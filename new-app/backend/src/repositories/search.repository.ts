/**
 * Unified search — port of search.py unified_search.
 * GET /v1/businesses/{id}/search?q=
 */
import { sql } from "../config/database";
import { rankIdsByTokenSort, tokenSortRatio } from "../services/fuzzyCatalog";
import {
  redactCatalogItems,
  redactTradePurchaseDict,
  shouldRedactFinancials,
} from "../services/staffView";
import { tradePurchaseStatusInReportsSql } from "../services/tradeLineSql";
import { queryMany, type SqlClient, type SqlParam } from "./sql";

const PAIR_CAP = 5000;
const CATALOG_FETCH_LIMIT = 160;
const CATALOG_RETURN_LIMIT = 40;
const SUPPLIER_HISTORY_CATALOG_CAP = 4000;

const QUERY_ALIASES: Record<string, string> = {
  suger: "sugar",
  shugar: "sugar",
  sugr: "sugar",
};

export type UnifiedSearchOut = {
  catalog_items: Record<string, unknown>[];
  suppliers: Array<{ id: string; name: string }>;
  brokers: Array<{ id: string; name: string }>;
  entries: Record<string, unknown>[];
  catalog_subcategories: Record<string, unknown>[];
  recent_purchases: Record<string, unknown>[];
  fuzzy_catalog_used: boolean;
  fuzzy_suppliers_used: boolean;
  fuzzy_brokers_used: boolean;
};

export type SearchRepository = {
  unifiedSearch(opts: {
    businessId: string;
    q: string;
    role: string | null;
    supplierId?: string | null;
  }): Promise<UnifiedSearchOut>;
};

function emptyOut(): UnifiedSearchOut {
  return {
    catalog_items: [],
    suppliers: [],
    brokers: [],
    entries: [],
    catalog_subcategories: [],
    recent_purchases: [],
    fuzzy_catalog_used: false,
    fuzzy_suppliers_used: false,
    fuzzy_brokers_used: false,
  };
}

function searchTerms(q: string): string[] {
  const needle = q.trim().toLowerCase();
  const terms = needle ? [needle] : [];
  const alias = QUERY_ALIASES[needle];
  if (alias && !terms.includes(alias)) terms.push(alias);
  return terms;
}

type CatalogRow = {
  id: string;
  name: string;
  category_name: string | null;
  type_name: string | null;
  default_unit: string | null;
  default_kg_per_bag: number | null;
  hsn_code: string | null;
  item_code: string | null;
  tax_percent: number | null;
  default_landing_cost: number | null;
  default_selling_cost: number | null;
  last_purchase_price: number | null;
  last_selling_rate: number | null;
  last_supplier_id: string | null;
  last_broker_id: string | null;
  last_line_qty: number | null;
  last_line_unit: string | null;
  last_line_weight_kg: number | null;
  last_trade_purchase_id: string | null;
  selling_unit: string | null;
  stock_unit: string | null;
  package_type: string | null;
  package_size: number | null;
  package_measurement: string | null;
};

function hydrateCatalog(row: CatalogRow): Record<string, unknown> {
  const icode =
    row.item_code != null && String(row.item_code).trim()
      ? String(row.item_code).trim()
      : null;
  return {
    id: String(row.id),
    name: row.name,
    category_name: row.category_name,
    type_name: row.type_name,
    default_unit: row.default_unit,
    default_kg_per_bag:
      row.default_kg_per_bag != null ? Number(row.default_kg_per_bag) : null,
    hsn_code: row.hsn_code,
    item_code: icode,
    tax_percent: row.tax_percent != null ? Number(row.tax_percent) : null,
    default_landing_cost:
      row.default_landing_cost != null ? Number(row.default_landing_cost) : null,
    default_selling_cost:
      row.default_selling_cost != null ? Number(row.default_selling_cost) : null,
    last_purchase_price:
      row.last_purchase_price != null ? Number(row.last_purchase_price) : null,
    last_selling_rate:
      row.last_selling_rate != null ? Number(row.last_selling_rate) : null,
    last_supplier_id: row.last_supplier_id
      ? String(row.last_supplier_id)
      : null,
    last_broker_id: row.last_broker_id ? String(row.last_broker_id) : null,
    last_line_qty: row.last_line_qty != null ? Number(row.last_line_qty) : null,
    last_line_unit: row.last_line_unit,
    last_line_weight_kg:
      row.last_line_weight_kg != null ? Number(row.last_line_weight_kg) : null,
    last_trade_purchase_id: row.last_trade_purchase_id
      ? String(row.last_trade_purchase_id)
      : null,
    selling_unit: row.selling_unit,
    stock_unit: row.stock_unit,
    package_type: row.package_type,
    package_size: row.package_size != null ? Number(row.package_size) : null,
    package_measurement: row.package_measurement,
    last_purchase_human_id: null,
    last_supplier_name: null,
    last_broker_name: null,
    last_supplier_phone: null,
    last_broker_phone: null,
  };
}

function rankCatalogItemsForQuery(
  items: Record<string, unknown>[],
  needle: string,
  supplierId: string | null,
  supplierHistoryIds: Set<string>,
  limit: number,
): Record<string, unknown>[] {
  const nl = needle.trim().toLowerCase();
  if (!nl) return items.slice(0, limit);
  const scored: Array<{ score: number; nm: string; m: Record<string, unknown> }> =
    [];
  for (const m of items) {
    const name = String(m.name ?? "").trim();
    if (!name) continue;
    const nm = name.toLowerCase();
    let base = tokenSortRatio(nl, nm);
    let bonus = 0;
    if (nm.startsWith(nl)) bonus += 12;
    else {
      for (const part of nm.split(/[^a-z0-9]+/)) {
        if (part.startsWith(nl)) {
          bonus += 8;
          break;
        }
      }
    }
    if (supplierId != null) {
      const ls = m.last_supplier_id;
      if (ls != null && String(supplierId) === String(ls)) bonus += 18;
      const cid = String(m.id ?? "");
      if (cid && supplierHistoryIds.has(cid)) bonus += 14;
    }
    scored.push({ score: base + bonus, nm, m });
  }
  scored.sort((a, b) => b.score - a.score || a.nm.localeCompare(b.nm));
  return scored.slice(0, limit).map((t) => t.m);
}

const CATALOG_SELECT = `
  ci.[id], ci.[name], ic.[name] AS category_name, ct.[name] AS type_name,
  ci.[default_unit], CAST(ci.[default_kg_per_bag] AS FLOAT) AS default_kg_per_bag,
  ci.[hsn_code], ci.[item_code], CAST(ci.[tax_percent] AS FLOAT) AS tax_percent,
  CAST(ci.[default_landing_cost] AS FLOAT) AS default_landing_cost,
  CAST(ci.[default_selling_cost] AS FLOAT) AS default_selling_cost,
  CAST(ci.[last_purchase_price] AS FLOAT) AS last_purchase_price,
  CAST(ci.[last_selling_rate] AS FLOAT) AS last_selling_rate,
  ci.[last_supplier_id], ci.[last_broker_id],
  CAST(ci.[last_line_qty] AS FLOAT) AS last_line_qty, ci.[last_line_unit],
  CAST(ci.[last_line_weight_kg] AS FLOAT) AS last_line_weight_kg,
  ci.[last_trade_purchase_id],
  ci.[selling_unit], ci.[stock_unit], ci.[package_type],
  CAST(ci.[package_size] AS FLOAT) AS package_size, ci.[package_measurement]
`;

export function createSearchRepository(db: SqlClient): SearchRepository {
  return {
    async unifiedSearch(opts) {
      const needle = opts.q.trim().toLowerCase();
      if (needle.length < 1) return emptyOut();
      const redact = shouldRedactFinancials(opts.role);
      const terms = searchTerms(opts.q);
      const businessId = opts.businessId;

      try {
        let supplierForBoost: string | null = null;
        const supplierHistIds = new Set<string>();
        const sid = opts.supplierId?.trim() || null;
        if (sid) {
          const exists = await queryMany<{ id: string }>(
            db,
            `SELECT [id] FROM suppliers WHERE [business_id]=@businessId AND [id]=@sid`,
            [
              { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
              { name: "sid", type: sql.UniqueIdentifier, value: sid },
            ],
          );
          if (exists.length > 0) {
            supplierForBoost = sid;
            const hist = await queryMany<{ catalog_item_id: string }>(
              db,
              `SELECT DISTINCT TOP (${SUPPLIER_HISTORY_CATALOG_CAP}) tpl.[catalog_item_id]
               FROM trade_purchase_lines tpl
               INNER JOIN trade_purchases tp ON tp.[id]=tpl.[trade_purchase_id]
               WHERE tp.[business_id]=@businessId
                 AND tp.[supplier_id]=@sid
                 AND ${tradePurchaseStatusInReportsSql("tp")}
                 AND tpl.[catalog_item_id] IS NOT NULL`,
              [
                {
                  name: "businessId",
                  type: sql.UniqueIdentifier,
                  value: businessId,
                },
                { name: "sid", type: sql.UniqueIdentifier, value: sid },
              ],
            );
            for (const h of hist) {
              if (h.catalog_item_id) supplierHistIds.add(String(h.catalog_item_id));
            }
          }
        }

        /* Catalog substring — multi-term OR */
        const termParams: SqlParam[] = [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ];
        const termOrs: string[] = [];
        terms.forEach((t, i) => {
          const pn = `t${i}`;
          termParams.push({
            name: pn,
            type: sql.NVarChar(200),
            value: `%${t}%`,
          });
          termOrs.push(`(
            LOWER(ci.[name]) LIKE @${pn}
            OR LOWER(ic.[name]) LIKE @${pn}
            OR (ci.[hsn_code] IS NOT NULL AND LOWER(ci.[hsn_code]) LIKE @${pn})
            OR (ci.[item_code] IS NOT NULL AND LOWER(ci.[item_code]) LIKE @${pn})
            OR (ci.[type_id] IS NOT NULL AND LOWER(ct.[name]) LIKE @${pn})
          )`);
        });
        const matchSql = termOrs.join(" OR ");

        let catalogRows = await queryMany<CatalogRow>(
          db,
          `SELECT TOP (${CATALOG_FETCH_LIMIT}) ${CATALOG_SELECT}
           FROM catalog_items ci
           INNER JOIN item_categories ic ON ic.[id]=ci.[category_id]
           LEFT JOIN category_types ct ON ct.[id]=ci.[type_id]
           WHERE ci.[business_id]=@businessId
             AND ci.[deleted_at] IS NULL
             AND (${matchSql})
           ORDER BY LOWER(ci.[name])`,
          termParams,
        );

        let fuzzyCatalogUsed = false;
        if (catalogRows.length === 0) {
          const pairs = await queryMany<{ id: string; name: string }>(
            db,
            `SELECT TOP (${PAIR_CAP}) [id], [name] FROM catalog_items
             WHERE [business_id]=@businessId AND [deleted_at] IS NULL`,
            [
              {
                name: "businessId",
                type: sql.UniqueIdentifier,
                value: businessId,
              },
            ],
          );
          const fuzzyCut = needle.length < 2 ? 40 : 52;
          const ranked = rankIdsByTokenSort(needle, pairs, {
            limit: CATALOG_FETCH_LIMIT,
            scoreCutoff: fuzzyCut,
          });
          if (ranked.length > 0) {
            fuzzyCatalogUsed = true;
            const ids = ranked.map((r) => r.id);
            const hydrated: CatalogRow[] = [];
            for (const id of ids) {
              const row = await queryMany<CatalogRow>(
                db,
                `SELECT TOP 1 ${CATALOG_SELECT}
                 FROM catalog_items ci
                 INNER JOIN item_categories ic ON ic.[id]=ci.[category_id]
                 LEFT JOIN category_types ct ON ct.[id]=ci.[type_id]
                 WHERE ci.[id]=@id AND ci.[deleted_at] IS NULL`,
                [{ name: "id", type: sql.UniqueIdentifier, value: id }],
              );
              if (row[0]) hydrated.push(row[0]);
            }
            catalogRows = hydrated;
          }
        }

        let catalogItems = catalogRows.map(hydrateCatalog);
        await attachLastPartyNames(db, businessId, catalogItems);
        await attachLastPurchaseHumanIds(db, businessId, catalogItems);
        catalogItems = rankCatalogItemsForQuery(
          catalogItems,
          needle,
          supplierForBoost,
          supplierHistIds,
          CATALOG_RETURN_LIMIT,
        );

        /* Suppliers */
        let supRows = await queryMany<{ id: string; name: string }>(
          db,
          `SELECT TOP 12 [id], [name] FROM suppliers
           WHERE [business_id]=@businessId
             AND (LOWER([name]) LIKE @q
               OR ([gst_number] IS NOT NULL AND LOWER([gst_number]) LIKE @q))
           ORDER BY LOWER([name])`,
          [
            { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
            { name: "q", type: sql.NVarChar(200), value: `%${needle}%` },
          ],
        );
        let fuzzySuppliersUsed = false;
        if (supRows.length === 0) {
          const pairs = await queryMany<{ id: string; name: string }>(
            db,
            `SELECT TOP (${PAIR_CAP}) [id], [name] FROM suppliers WHERE [business_id]=@businessId`,
            [
              {
                name: "businessId",
                type: sql.UniqueIdentifier,
                value: businessId,
              },
            ],
          );
          const ranked = rankIdsByTokenSort(needle, pairs, {
            limit: 12,
            scoreCutoff: needle.length < 2 ? 40 : 52,
          });
          if (ranked.length > 0) {
            fuzzySuppliersUsed = true;
            const byId = new Map(pairs.map((p) => [p.id, p]));
            supRows = ranked
              .map((r) => byId.get(r.id))
              .filter((x): x is { id: string; name: string } => !!x);
          }
        }
        const suppliers = supRows.map((r) => ({
          id: String(r.id),
          name: r.name,
        }));

        /* Brokers */
        let broRows = await queryMany<{ id: string; name: string }>(
          db,
          `SELECT TOP 12 [id], [name] FROM brokers
           WHERE [business_id]=@businessId AND LOWER([name]) LIKE @q
           ORDER BY LOWER([name])`,
          [
            { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
            { name: "q", type: sql.NVarChar(200), value: `%${needle}%` },
          ],
        );
        let fuzzyBrokersUsed = false;
        if (broRows.length === 0) {
          const pairs = await queryMany<{ id: string; name: string }>(
            db,
            `SELECT TOP (${PAIR_CAP}) [id], [name] FROM brokers WHERE [business_id]=@businessId`,
            [
              {
                name: "businessId",
                type: sql.UniqueIdentifier,
                value: businessId,
              },
            ],
          );
          const ranked = rankIdsByTokenSort(needle, pairs, {
            limit: 12,
            scoreCutoff: needle.length < 2 ? 40 : 52,
          });
          if (ranked.length > 0) {
            fuzzyBrokersUsed = true;
            const byId = new Map(pairs.map((p) => [p.id, p]));
            broRows = ranked
              .map((r) => byId.get(r.id))
              .filter((x): x is { id: string; name: string } => !!x);
          }
        }
        const brokers = broRows.map((r) => ({
          id: String(r.id),
          name: r.name,
        }));

        /* Subcategories / types */
        let catalogSubcategories = await loadSubcategories(
          db,
          businessId,
          needle,
          catalogRows.map((r) => r.id),
        );

        /* Recent purchases with q */
        let recentPurchases = await loadRecentPurchases(
          db,
          businessId,
          opts.q.trim(),
        );
        if (redact) {
          recentPurchases = recentPurchases.map(redactTradePurchaseDict);
        }

        const catalogOut = redact
          ? redactCatalogItems(catalogItems)
          : catalogItems;

        return {
          catalog_items: catalogOut,
          suppliers,
          brokers,
          entries: [],
          catalog_subcategories: catalogSubcategories,
          recent_purchases: recentPurchases,
          fuzzy_catalog_used: fuzzyCatalogUsed,
          fuzzy_suppliers_used: fuzzySuppliersUsed,
          fuzzy_brokers_used: fuzzyBrokersUsed,
        };
      } catch {
        return emptyOut();
      }
    },
  };
}

async function attachLastPartyNames(
  db: SqlClient,
  businessId: string,
  items: Record<string, unknown>[],
): Promise<void> {
  const sIds = new Set<string>();
  const bIds = new Set<string>();
  for (const m of items) {
    if (m.last_supplier_id) sIds.add(String(m.last_supplier_id));
    if (m.last_broker_id) bIds.add(String(m.last_broker_id));
  }
  const sm = new Map<string, string>();
  const sphone = new Map<string, string>();
  const bm = new Map<string, string>();
  const bphone = new Map<string, string>();
  for (const id of sIds) {
    const rows = await queryMany<{
      id: string;
      name: string;
      phone: string | null;
    }>(
      db,
      `SELECT [id], [name], [phone] FROM suppliers WHERE [business_id]=@businessId AND [id]=@id`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "id", type: sql.UniqueIdentifier, value: id },
      ],
    );
    const r = rows[0];
    if (r) {
      sm.set(String(r.id), r.name);
      if (r.phone?.trim()) sphone.set(String(r.id), r.phone.trim());
    }
  }
  for (const id of bIds) {
    const rows = await queryMany<{
      id: string;
      name: string;
      phone: string | null;
    }>(
      db,
      `SELECT [id], [name], [phone] FROM brokers WHERE [business_id]=@businessId AND [id]=@id`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "id", type: sql.UniqueIdentifier, value: id },
      ],
    );
    const r = rows[0];
    if (r) {
      bm.set(String(r.id), r.name);
      if (r.phone?.trim()) bphone.set(String(r.id), r.phone.trim());
    }
  }
  for (const m of items) {
    const sid = m.last_supplier_id ? String(m.last_supplier_id) : null;
    if (sid && sm.has(sid)) {
      m.last_supplier_name = sm.get(sid);
      if (sphone.has(sid)) m.last_supplier_phone = sphone.get(sid);
    }
    const bid = m.last_broker_id ? String(m.last_broker_id) : null;
    if (bid && bm.has(bid)) {
      m.last_broker_name = bm.get(bid);
      if (bphone.has(bid)) m.last_broker_phone = bphone.get(bid);
    }
  }
}

async function attachLastPurchaseHumanIds(
  db: SqlClient,
  businessId: string,
  items: Record<string, unknown>[],
): Promise<void> {
  for (const m of items) {
    const raw = m.last_trade_purchase_id
      ? String(m.last_trade_purchase_id)
      : null;
    if (!raw) continue;
    const rows = await queryMany<{ human_id: string | null }>(
      db,
      `SELECT [human_id] FROM trade_purchases
       WHERE [business_id]=@businessId AND [id]=@id`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "id", type: sql.UniqueIdentifier, value: raw },
      ],
    );
    if (rows[0]?.human_id) m.last_purchase_human_id = rows[0].human_id;
  }
}

async function loadSubcategories(
  db: SqlClient,
  businessId: string,
  needle: string,
  catalogItemIds: string[],
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  const rows = await queryMany<{
    id: string;
    name: string;
    category_id: string;
    category_name: string;
  }>(
    db,
    `SELECT DISTINCT TOP 20
        ct.[id], ct.[name], ic.[id] AS category_id, ic.[name] AS category_name
     FROM category_types ct
     INNER JOIN item_categories ic ON ic.[id]=ct.[category_id]
     WHERE ic.[business_id]=@businessId
       AND (LOWER(ct.[name]) LIKE @q OR LOWER(ic.[name]) LIKE @q)`,
    [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      { name: "q", type: sql.NVarChar(200), value: `%${needle}%` },
    ],
  );
  for (const row of rows) {
    out.push({
      id: String(row.id),
      name: row.name,
      category_id: String(row.category_id),
      category_name: row.category_name,
      parent_name: row.category_name,
    });
  }
  const seen = new Set(out.map((d) => String(d.id)));
  for (const cid of catalogItemIds.slice(0, CATALOG_FETCH_LIMIT)) {
    const trows = await queryMany<{
      id: string;
      name: string;
      category_id: string;
      category_name: string;
    }>(
      db,
      `SELECT TOP 1 ct.[id], ct.[name], ic.[id] AS category_id, ic.[name] AS category_name
       FROM catalog_items ci
       INNER JOIN category_types ct ON ct.[id]=ci.[type_id]
       INNER JOIN item_categories ic ON ic.[id]=ct.[category_id]
       WHERE ci.[id]=@cid AND ci.[business_id]=@businessId
         AND ci.[deleted_at] IS NULL AND ic.[business_id]=@businessId`,
      [
        { name: "cid", type: sql.UniqueIdentifier, value: cid },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    const t = trows[0];
    if (t && !seen.has(String(t.id))) {
      seen.add(String(t.id));
      out.push({
        id: String(t.id),
        name: t.name,
        category_id: String(t.category_id),
        category_name: t.category_name,
        parent_name: t.category_name,
      });
    }
  }
  if (out.length === 0) {
    const pairs = await queryMany<{
      id: string;
      name: string;
      category_id: string;
      category_name: string;
    }>(
      db,
      `SELECT TOP (${PAIR_CAP})
          ct.[id], ct.[name], ic.[id] AS category_id, ic.[name] AS category_name
       FROM category_types ct
       INNER JOIN item_categories ic ON ic.[id]=ct.[category_id]
       WHERE ic.[business_id]=@businessId`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    const typePairs = pairs
      .map((p) => ({
        id: String(p.id),
        name: `${p.name} ${p.category_name}`.trim(),
        meta: p,
      }))
      .filter((p) => p.name);
    const ranked = rankIdsByTokenSort(
      needle,
      typePairs.map((p) => ({ id: p.id, name: p.name })),
      { limit: 20, scoreCutoff: needle.length < 2 ? 40 : 52 },
    );
    const byId = new Map(typePairs.map((p) => [p.id, p.meta]));
    for (const r of ranked) {
      const meta = byId.get(r.id);
      if (!meta) continue;
      out.push({
        id: String(meta.id),
        name: meta.name,
        category_id: String(meta.category_id),
        category_name: meta.category_name,
        parent_name: meta.category_name,
      });
    }
  }
  return out;
}

async function loadRecentPurchases(
  db: SqlClient,
  businessId: string,
  q: string,
): Promise<Record<string, unknown>[]> {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const pattern = `%${needle}%`;
  const headers = await queryMany<{
    id: string;
    human_id: string | null;
    purchase_date: Date | string;
    is_delivered: boolean | number;
    supplier_name: string | null;
    broker_name: string | null;
  }>(
    db,
    `SELECT TOP 10
        tp.[id], tp.[human_id], tp.[purchase_date], tp.[is_delivered],
        s.[name] AS supplier_name, b.[name] AS broker_name
     FROM trade_purchases tp
     LEFT JOIN suppliers s ON s.[id]=tp.[supplier_id]
     LEFT JOIN brokers b ON b.[id]=tp.[broker_id]
     WHERE tp.[business_id]=@businessId
       AND tp.[status] <> N'deleted'
       AND ${tradePurchaseStatusInReportsSql("tp")}
       AND (
         LOWER(COALESCE(tp.[human_id], N'')) LIKE @q
         OR LOWER(COALESCE(s.[name], N'')) LIKE @q
         OR LOWER(COALESCE(b.[name], N'')) LIKE @q
         OR EXISTS (
           SELECT 1 FROM trade_purchase_lines tpl
           WHERE tpl.[trade_purchase_id]=tp.[id]
             AND LOWER(COALESCE(tpl.[item_name], N'')) LIKE @q
         )
       )
     ORDER BY tp.[purchase_date] DESC, tp.[created_at] DESC`,
    [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      { name: "q", type: sql.NVarChar(200), value: pattern },
    ],
  );

  const out: Record<string, unknown>[] = [];
  for (const h of headers) {
    const lines = await queryMany<{
      id: string;
      item_name: string | null;
      qty: number | null;
      unit: string | null;
      catalog_item_id: string | null;
    }>(
      db,
      `SELECT [id], [item_name], CAST([qty] AS FLOAT) AS qty, [unit], [catalog_item_id]
       FROM trade_purchase_lines WHERE [trade_purchase_id]=@pid`,
      [{ name: "pid", type: sql.UniqueIdentifier, value: h.id }],
    );
    const pd =
      h.purchase_date instanceof Date
        ? h.purchase_date.toISOString().slice(0, 10)
        : String(h.purchase_date).slice(0, 10);
    out.push({
      id: String(h.id),
      human_id: h.human_id,
      purchase_date: pd,
      is_delivered: Boolean(h.is_delivered),
      supplier_name: h.supplier_name,
      broker_name: h.broker_name,
      lines: lines.map((li) => ({
        id: String(li.id),
        item_name: li.item_name,
        qty: li.qty != null ? Number(li.qty) : null,
        unit: li.unit,
        catalog_item_id: li.catalog_item_id
          ? String(li.catalog_item_id)
          : null,
      })),
    });
  }
  return out;
}
