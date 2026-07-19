/**
 * Catalog items list/get — Formula source: catalog.py list_catalog_items / get_catalog_item
 */
import { sql } from "../config/database";
import { tradePurchaseStatusInReportsSql } from "../services/tradeLineSql";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";

export type CatalogItemRow = {
  id: string;
  category_id: string;
  type_id: string | null;
  type_name: string | null;
  category_name: string | null;
  name: string;
  default_unit: string | null;
  default_kg_per_bag: number | null;
  default_items_per_box: number | null;
  default_weight_per_tin: number | null;
  default_purchase_unit: string | null;
  default_sale_unit: string | null;
  hsn_code: string | null;
  item_code: string | null;
  barcode: string | null;
  public_token: string | null;
  tax_percent: number | null;
  default_landing_cost: number | null;
  default_selling_cost: number | null;
  last_purchase_price: number | null;
  last_selling_rate: number | null;
  last_supplier_id: string | null;
  last_broker_id: string | null;
  last_trade_purchase_id: string | null;
  last_line_qty: number | null;
  last_line_unit: string | null;
  last_line_weight_kg: number | null;
  selling_unit: string | null;
  stock_unit: string | null;
  display_unit: string | null;
  package_type: string | null;
  package_size: number | null;
  package_measurement: string | null;
  conversion_factor: number | null;
  unit_confidence: number | null;
  validation_status: string | null;
  smart_classification: string | null;
};

export type CatalogItemEnriched = CatalogItemRow & {
  default_supplier_ids: string[];
  default_broker_ids: string[];
  last_supplier_name: string | null;
  last_broker_name: string | null;
  last_purchase_date: string | null;
  last_purchase_delivered: boolean | null;
};

export type ListCatalogItemsOpts = {
  businessId: string;
  categoryId?: string | null;
  typeId?: string | null;
  page: number;
  perPage: number;
};

export type CatalogItemsRepository = {
  list(opts: ListCatalogItemsOpts): Promise<CatalogItemEnriched[]>;
  getById(businessId: string, itemId: string): Promise<CatalogItemEnriched | null>;
};

const ITEM_SELECT = `
  ci.[id],
  ci.[category_id],
  ci.[type_id],
  ct.[name] AS [type_name],
  ic.[name] AS [category_name],
  ci.[name],
  ci.[default_unit],
  ci.[default_kg_per_bag],
  ci.[default_items_per_box],
  ci.[default_weight_per_tin],
  ci.[default_purchase_unit],
  ci.[default_sale_unit],
  ci.[hsn_code],
  ci.[item_code],
  ci.[barcode],
  ci.[public_token],
  ci.[tax_percent],
  ci.[default_landing_cost],
  ci.[default_selling_cost],
  ci.[last_purchase_price],
  ci.[last_selling_rate],
  ci.[last_supplier_id],
  ci.[last_broker_id],
  ci.[last_trade_purchase_id],
  ci.[last_line_qty],
  ci.[last_line_unit],
  ci.[last_line_weight_kg],
  ci.[selling_unit],
  ci.[stock_unit],
  ci.[display_unit],
  ci.[package_type],
  ci.[package_size],
  ci.[package_measurement],
  ci.[conversion_factor],
  ci.[unit_confidence],
  ci.[validation_status],
  ci.[smart_classification]
`;

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapRow(r: Record<string, unknown>): CatalogItemRow {
  return {
    id: String(r.id),
    category_id: String(r.category_id),
    type_id: r.type_id != null ? String(r.type_id) : null,
    type_name: r.type_name != null ? String(r.type_name) : null,
    category_name: r.category_name != null ? String(r.category_name) : null,
    name: String(r.name ?? ""),
    default_unit: r.default_unit != null ? String(r.default_unit) : null,
    default_kg_per_bag: num(r.default_kg_per_bag),
    default_items_per_box: num(r.default_items_per_box),
    default_weight_per_tin: num(r.default_weight_per_tin),
    default_purchase_unit:
      r.default_purchase_unit != null ? String(r.default_purchase_unit) : null,
    default_sale_unit:
      r.default_sale_unit != null ? String(r.default_sale_unit) : null,
    hsn_code: r.hsn_code != null ? String(r.hsn_code) : null,
    item_code: r.item_code != null ? String(r.item_code) : null,
    barcode: r.barcode != null ? String(r.barcode) : null,
    public_token: r.public_token != null ? String(r.public_token) : null,
    tax_percent: num(r.tax_percent),
    default_landing_cost: num(r.default_landing_cost),
    default_selling_cost: num(r.default_selling_cost),
    last_purchase_price: num(r.last_purchase_price),
    last_selling_rate: num(r.last_selling_rate),
    last_supplier_id:
      r.last_supplier_id != null ? String(r.last_supplier_id) : null,
    last_broker_id: r.last_broker_id != null ? String(r.last_broker_id) : null,
    last_trade_purchase_id:
      r.last_trade_purchase_id != null
        ? String(r.last_trade_purchase_id)
        : null,
    last_line_qty: num(r.last_line_qty),
    last_line_unit: r.last_line_unit != null ? String(r.last_line_unit) : null,
    last_line_weight_kg: num(r.last_line_weight_kg),
    selling_unit: r.selling_unit != null ? String(r.selling_unit) : null,
    stock_unit: r.stock_unit != null ? String(r.stock_unit) : null,
    display_unit: r.display_unit != null ? String(r.display_unit) : null,
    package_type: r.package_type != null ? String(r.package_type) : null,
    package_size: num(r.package_size),
    package_measurement:
      r.package_measurement != null ? String(r.package_measurement) : null,
    conversion_factor: num(r.conversion_factor),
    unit_confidence: num(r.unit_confidence),
    validation_status:
      r.validation_status != null ? String(r.validation_status) : null,
    smart_classification:
      r.smart_classification != null ? String(r.smart_classification) : null,
  };
}

async function defaultSupplierBrokerIds(
  db: SqlClient,
  businessId: string,
  itemIds: string[],
): Promise<{
  suppliers: Map<string, string[]>;
  brokers: Map<string, string[]>;
}> {
  const suppliers = new Map<string, string[]>();
  const brokers = new Map<string, string[]>();
  for (const id of itemIds) {
    suppliers.set(id, []);
    brokers.set(id, []);
  }
  if (itemIds.length === 0) return { suppliers, brokers };

  const idParams: SqlParam[] = [
    { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
  ];
  const idPlaceholders: string[] = [];
  itemIds.forEach((id, i) => {
    const n = `id${i}`;
    idPlaceholders.push(`@${n}`);
    idParams.push({ name: n, type: sql.UniqueIdentifier, value: id });
  });
  const inList = idPlaceholders.join(",");

  const sRows = await queryMany<Record<string, unknown>>(
    db,
    `SELECT [catalog_item_id], [supplier_id]
     FROM catalog_item_default_suppliers
     WHERE [business_id] = @businessId AND [catalog_item_id] IN (${inList})
     ORDER BY [catalog_item_id], [sort_order], [supplier_id]`,
    idParams,
  );
  for (const r of sRows) {
    const cid = String(r.catalog_item_id);
    suppliers.get(cid)?.push(String(r.supplier_id));
  }

  const bRows = await queryMany<Record<string, unknown>>(
    db,
    `SELECT [catalog_item_id], [broker_id]
     FROM catalog_item_default_brokers
     WHERE [business_id] = @businessId AND [catalog_item_id] IN (${inList})
     ORDER BY [catalog_item_id], [sort_order], [broker_id]`,
    idParams,
  );
  for (const r of bRows) {
    const cid = String(r.catalog_item_id);
    brokers.get(cid)?.push(String(r.broker_id));
  }

  return { suppliers, brokers };
}

async function partyNameMaps(
  db: SqlClient,
  businessId: string,
  supplierIds: string[],
  brokerIds: string[],
): Promise<{ suppliers: Map<string, string>; brokers: Map<string, string> }> {
  const suppliers = new Map<string, string>();
  const brokers = new Map<string, string>();
  if (supplierIds.length > 0) {
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
    ];
    const ph: string[] = [];
    supplierIds.forEach((id, i) => {
      const n = `s${i}`;
      ph.push(`@${n}`);
      params.push({ name: n, type: sql.UniqueIdentifier, value: id });
    });
    const rows = await queryMany<Record<string, unknown>>(
      db,
      `SELECT [id], [name] FROM suppliers
       WHERE [business_id] = @businessId AND [id] IN (${ph.join(",")})`,
      params,
    );
    for (const r of rows) suppliers.set(String(r.id), String(r.name ?? ""));
  }
  if (brokerIds.length > 0) {
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
    ];
    const ph: string[] = [];
    brokerIds.forEach((id, i) => {
      const n = `b${i}`;
      ph.push(`@${n}`);
      params.push({ name: n, type: sql.UniqueIdentifier, value: id });
    });
    const rows = await queryMany<Record<string, unknown>>(
      db,
      `SELECT [id], [name] FROM brokers
       WHERE [business_id] = @businessId AND [id] IN (${ph.join(",")})`,
      params,
    );
    for (const r of rows) brokers.set(String(r.id), String(r.name ?? ""));
  }
  return { suppliers, brokers };
}

async function maxPurchaseDates(
  db: SqlClient,
  businessId: string,
  itemIds: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (itemIds.length === 0) return out;
  const params: SqlParam[] = [
    { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
  ];
  const ph: string[] = [];
  itemIds.forEach((id, i) => {
    const n = `i${i}`;
    ph.push(`@${n}`);
    params.push({ name: n, type: sql.UniqueIdentifier, value: id });
  });
  const rows = await queryMany<Record<string, unknown>>(
    db,
    `SELECT tpl.[catalog_item_id], MAX(tp.[purchase_date]) AS [max_date]
     FROM trade_purchase_lines tpl
     INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
     WHERE tp.[business_id] = @businessId
       AND tpl.[catalog_item_id] IN (${ph.join(",")})
       AND ${tradePurchaseStatusInReportsSql("tp")}
     GROUP BY tpl.[catalog_item_id]`,
    params,
  );
  for (const r of rows) {
    if (r.max_date == null) continue;
    const d =
      r.max_date instanceof Date
        ? r.max_date.toISOString().slice(0, 10)
        : String(r.max_date).slice(0, 10);
    out.set(String(r.catalog_item_id), d);
  }
  return out;
}

async function deliveredMap(
  db: SqlClient,
  businessId: string,
  purchaseIds: string[],
): Promise<Map<string, boolean>> {
  const out = new Map<string, boolean>();
  if (purchaseIds.length === 0) return out;
  const params: SqlParam[] = [
    { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
  ];
  const ph: string[] = [];
  purchaseIds.forEach((id, i) => {
    const n = `p${i}`;
    ph.push(`@${n}`);
    params.push({ name: n, type: sql.UniqueIdentifier, value: id });
  });
  const rows = await queryMany<Record<string, unknown>>(
    db,
    `SELECT [id], [delivery_status]
     FROM trade_purchases
     WHERE [business_id] = @businessId
       AND [id] IN (${ph.join(",")})
       AND [status] NOT IN (N'deleted', N'cancelled')`,
    params,
  );
  for (const r of rows) {
    const ds = String(r.delivery_status ?? "")
      .trim()
      .toLowerCase();
    out.set(String(r.id), ds === "stock_committed");
  }
  return out;
}

async function enrich(
  db: SqlClient,
  businessId: string,
  rows: CatalogItemRow[],
): Promise<CatalogItemEnriched[]> {
  const ids = rows.map((r) => r.id);
  const { suppliers, brokers } = await defaultSupplierBrokerIds(
    db,
    businessId,
    ids,
  );
  const sIds = [
    ...new Set(
      rows
        .map((r) => r.last_supplier_id)
        .filter((x): x is string => x != null),
    ),
  ];
  const bIds = [
    ...new Set(
      rows.map((r) => r.last_broker_id).filter((x): x is string => x != null),
    ),
  ];
  const names = await partyNameMaps(db, businessId, sIds, bIds);
  const dates = await maxPurchaseDates(db, businessId, ids);
  const tpIds = [
    ...new Set(
      rows
        .map((r) => r.last_trade_purchase_id)
        .filter((x): x is string => x != null),
    ),
  ];
  const del = await deliveredMap(db, businessId, tpIds);

  return rows.map((r) => ({
    ...r,
    default_supplier_ids: suppliers.get(r.id) ?? [],
    default_broker_ids: brokers.get(r.id) ?? [],
    last_supplier_name: r.last_supplier_id
      ? (names.suppliers.get(r.last_supplier_id) ?? null)
      : null,
    last_broker_name: r.last_broker_id
      ? (names.brokers.get(r.last_broker_id) ?? null)
      : null,
    last_purchase_date: dates.get(r.id) ?? null,
    last_purchase_delivered: r.last_trade_purchase_id
      ? (del.get(r.last_trade_purchase_id) ?? null)
      : null,
  }));
}

export function createCatalogItemsRepository(
  db: SqlClient,
): CatalogItemsRepository {
  return {
    async list(opts) {
      const offset = (opts.page - 1) * opts.perPage;
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
        { name: "offset", type: sql.Int, value: offset },
        { name: "limit", type: sql.Int, value: opts.perPage },
      ];
      let where = `ci.[business_id] = @businessId AND ci.[deleted_at] IS NULL`;
      if (opts.categoryId) {
        where += ` AND ci.[category_id] = @categoryId`;
        params.push({
          name: "categoryId",
          type: sql.UniqueIdentifier,
          value: opts.categoryId,
        });
      }
      if (opts.typeId) {
        where += ` AND ci.[type_id] = @typeId`;
        params.push({
          name: "typeId",
          type: sql.UniqueIdentifier,
          value: opts.typeId,
        });
      }
      const raw = await queryMany<Record<string, unknown>>(
        db,
        `SELECT ${ITEM_SELECT}
         FROM catalog_items ci
         INNER JOIN item_categories ic ON ic.[id] = ci.[category_id]
         LEFT JOIN category_types ct ON ct.[id] = ci.[type_id]
         WHERE ${where}
         ORDER BY LOWER(ci.[name])
         OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        params,
      );
      return enrich(
        db,
        opts.businessId,
        raw.map(mapRow),
      );
    },

    async getById(businessId, itemId) {
      const raw = await queryOne<Record<string, unknown>>(
        db,
        `SELECT ${ITEM_SELECT}
         FROM catalog_items ci
         INNER JOIN item_categories ic ON ic.[id] = ci.[category_id]
         LEFT JOIN category_types ct ON ct.[id] = ci.[type_id]
         WHERE ci.[id] = @itemId AND ci.[business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        ],
      );
      if (!raw) return null;
      const [one] = await enrich(db, businessId, [mapRow(raw)]);
      return one ?? null;
    },
  };
}
