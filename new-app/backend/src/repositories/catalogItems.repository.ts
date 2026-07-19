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

export type CatalogItemInsert = {
  id: string;
  businessId: string;
  categoryId: string;
  typeId: string;
  name: string;
  defaultUnit: string;
  defaultKgPerBag: number | null;
  defaultItemsPerBox: number | null;
  defaultWeightPerTin: number | null;
  defaultPurchaseUnit: string | null;
  defaultSaleUnit: string | null;
  hsnCode: string | null;
  itemCode: string | null;
  barcode: string | null;
  publicToken: string;
  taxPercent: number | null;
  defaultLandingCost: number | null;
  defaultSellingCost: number | null;
  packageType: string | null;
  sellingUnit: string | null;
  stockUnit: string | null;
  displayUnit: string | null;
  packageSize: number | null;
  packageMeasurement: string | null;
  validationStatus: string | null;
};

export type CatalogSmartFields = {
  normalizedName: string | null;
  sellingUnit: string | null;
  stockUnit: string | null;
  displayUnit: string | null;
  packageType: string | null;
  packageSize: number | null;
  packageMeasurement: string | null;
  conversionFactor: number | null;
  unitConfidence: number | null;
  smartClassification: string | null;
  defaultKgPerBag: number | null;
  validationStatus: string | null;
};

export type CatalogItemsRepository = {
  list(opts: ListCatalogItemsOpts): Promise<CatalogItemEnriched[]>;
  getById(businessId: string, itemId: string): Promise<CatalogItemEnriched | null>;
  categoryExists(businessId: string, categoryId: string): Promise<boolean>;
  verifyTypeInCategory(
    businessId: string,
    categoryId: string,
    typeId: string,
  ): Promise<void>;
  getOrCreateGeneralTypeId(
    businessId: string,
    categoryId: string,
  ): Promise<string>;
  findDupItemId(
    businessId: string,
    categoryId: string,
    typeId: string | null,
    name: string,
    excludeId?: string,
  ): Promise<string | null>;
  nextItemCode(businessId: string): Promise<string>;
  assertSupplierIdsInBusiness(
    businessId: string,
    supplierIds: string[],
  ): Promise<void>;
  assertBrokerIdsInBusiness(
    businessId: string,
    brokerIds: string[],
  ): Promise<void>;
  getCategoryName(businessId: string, categoryId: string): Promise<string | null>;
  insertItem(row: CatalogItemInsert): Promise<void>;
  updateSmartFields(itemId: string, fields: CatalogSmartFields): Promise<void>;
  replaceDefaultSuppliers(
    businessId: string,
    itemId: string,
    supplierIds: string[],
  ): Promise<void>;
  replaceDefaultBrokers(
    businessId: string,
    itemId: string,
    brokerIds: string[],
  ): Promise<void>;
  seedSupplierItemDefaults(
    businessId: string,
    itemId: string,
    supplierIds: string[],
  ): Promise<void>;
  patchItem(args: {
    businessId: string;
    itemId: string;
    categoryId: string;
    typeId: string | null;
    patch: Record<string, unknown>;
  }): Promise<void>;
  countTradeLines(itemId: string): Promise<number>;
  listVariantIds(businessId: string, itemId: string): Promise<string[]>;
  countArchivedEntryLinesForVariants(variantIds: string[]): Promise<number>;
  deleteItem(businessId: string, itemId: string): Promise<void>;
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

    async categoryExists(businessId, categoryId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT [id] FROM item_categories
         WHERE [id] = @categoryId AND [business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        ],
      );
      return row != null;
    },

    async verifyTypeInCategory(businessId, categoryId, typeId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT ct.[id]
         FROM category_types ct
         INNER JOIN item_categories ic ON ic.[id] = ct.[category_id]
         WHERE ct.[id] = @typeId AND ct.[category_id] = @categoryId
           AND ic.[business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
          { name: "typeId", type: sql.UniqueIdentifier, value: typeId },
        ],
      );
      if (!row) {
        const { HttpError } = await import("../errors/httpError");
        throw new HttpError(400, "type_id not found for this category");
      }
    },

    async getOrCreateGeneralTypeId(businessId, categoryId) {
      const existing = await queryOne<Record<string, unknown>>(
        db,
        `SELECT [id] FROM category_types
         WHERE [category_id] = @categoryId AND LOWER([name]) = N'general'`,
        [{ name: "categoryId", type: sql.UniqueIdentifier, value: categoryId }],
      );
      if (existing) return String(existing.id);
      const cat = await queryOne<Record<string, unknown>>(
        db,
        `SELECT [id] FROM item_categories
         WHERE [id] = @categoryId AND [business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        ],
      );
      if (!cat) {
        const { HttpError } = await import("../errors/httpError");
        throw new HttpError(400, "category_id not found in this business");
      }
      const { randomUUID } = await import("node:crypto");
      const id = randomUUID();
      await queryOne(
        db,
        `INSERT INTO category_types ([id], [category_id], [name], [created_at])
         VALUES (@id, @categoryId, N'General', SYSUTCDATETIME())`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: id },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        ],
      );
      return id;
    },

    async findDupItemId(businessId, categoryId, typeId, name, excludeId) {
      const { normName } = await import("../validation/catalogItems.schemas");
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        { name: "name", type: sql.NVarChar(512), value: normName(name) },
      ];
      let sqlText = `SELECT TOP 1 [id] FROM catalog_items
        WHERE [business_id] = @businessId AND [category_id] = @categoryId
          AND LOWER(LTRIM(RTRIM([name]))) = @name
          AND [deleted_at] IS NULL`;
      if (typeId != null) {
        sqlText += ` AND [type_id] = @typeId`;
        params.push({
          name: "typeId",
          type: sql.UniqueIdentifier,
          value: typeId,
        });
      } else {
        sqlText += ` AND [type_id] IS NULL`;
      }
      if (excludeId) {
        sqlText += ` AND [id] <> @excludeId`;
        params.push({
          name: "excludeId",
          type: sql.UniqueIdentifier,
          value: excludeId,
        });
      }
      const row = await queryOne<Record<string, unknown>>(db, sqlText, params);
      return row ? String(row.id) : null;
    },

    async nextItemCode(businessId) {
      const rows = await queryMany<Record<string, unknown>>(
        db,
        `SELECT [item_code] FROM catalog_items
         WHERE [business_id] = @businessId AND [item_code] LIKE N'ITM-%'`,
        [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
      );
      let maxN = 0;
      const re = /^ITM-(\d+)$/i;
      for (const r of rows) {
        const m = re.exec(String(r.item_code ?? "").trim());
        if (m) maxN = Math.max(maxN, Number(m[1]));
      }
      return `ITM-${String(maxN + 1).padStart(4, "0")}`;
    },

    async assertSupplierIdsInBusiness(businessId, supplierIds) {
      if (supplierIds.length === 0) return;
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ];
      const ph = supplierIds.map((id, i) => {
        const n = `s${i}`;
        params.push({ name: n, type: sql.UniqueIdentifier, value: id });
        return `@${n}`;
      });
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT COUNT(*) AS [c] FROM suppliers
         WHERE [business_id] = @businessId AND [id] IN (${ph.join(",")})`,
        params,
      );
      if (Number(row?.c ?? 0) !== supplierIds.length) {
        const { HttpError } = await import("../errors/httpError");
        throw new HttpError(
          400,
          "One or more default_supplier_ids are invalid for this business",
        );
      }
    },

    async assertBrokerIdsInBusiness(businessId, brokerIds) {
      if (brokerIds.length === 0) return;
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ];
      const ph = brokerIds.map((id, i) => {
        const n = `b${i}`;
        params.push({ name: n, type: sql.UniqueIdentifier, value: id });
        return `@${n}`;
      });
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT COUNT(*) AS [c] FROM brokers
         WHERE [business_id] = @businessId AND [id] IN (${ph.join(",")})`,
        params,
      );
      if (Number(row?.c ?? 0) !== brokerIds.length) {
        const { HttpError } = await import("../errors/httpError");
        throw new HttpError(
          400,
          "One or more default_broker_ids are invalid for this business",
        );
      }
    },

    async getCategoryName(businessId, categoryId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT [name] FROM item_categories
         WHERE [id] = @categoryId AND [business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: categoryId },
        ],
      );
      return row?.name != null ? String(row.name) : null;
    },

    async insertItem(row) {
      await queryOne(
        db,
        `INSERT INTO catalog_items (
           [id], [business_id], [category_id], [type_id], [name],
           [default_unit], [default_kg_per_bag], [default_items_per_box],
           [default_weight_per_tin], [default_purchase_unit], [default_sale_unit],
           [hsn_code], [item_code], [barcode], [public_token], [tax_percent],
           [default_landing_cost], [default_selling_cost],
           [package_type], [selling_unit], [stock_unit], [display_unit],
           [package_size], [package_measurement], [validation_status],
           [auto_detect_enabled], [stock_version], [opening_stock_locked], [created_at]
         ) VALUES (
           @id, @businessId, @categoryId, @typeId, @name,
           @defaultUnit, @dkg, @dbox, @dwt, @purchaseU, @saleU,
           @hsn, @itemCode, @barcode, @publicToken, @tax,
           @landing, @selling,
           @packageType, @sellingUnit, @stockUnit, @displayUnit,
           @packageSize, @packageMeasurement, @validationStatus,
           1, 0, 0, SYSUTCDATETIME()
         )`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: row.id },
          { name: "businessId", type: sql.UniqueIdentifier, value: row.businessId },
          { name: "categoryId", type: sql.UniqueIdentifier, value: row.categoryId },
          { name: "typeId", type: sql.UniqueIdentifier, value: row.typeId },
          { name: "name", type: sql.NVarChar(512), value: row.name },
          { name: "defaultUnit", type: sql.NVarChar(32), value: row.defaultUnit },
          { name: "dkg", type: sql.Decimal(12, 3), value: row.defaultKgPerBag },
          { name: "dbox", type: sql.Decimal(12, 3), value: row.defaultItemsPerBox },
          { name: "dwt", type: sql.Decimal(12, 3), value: row.defaultWeightPerTin },
          { name: "purchaseU", type: sql.NVarChar(32), value: row.defaultPurchaseUnit },
          { name: "saleU", type: sql.NVarChar(32), value: row.defaultSaleUnit },
          { name: "hsn", type: sql.NVarChar(32), value: row.hsnCode },
          { name: "itemCode", type: sql.NVarChar(64), value: row.itemCode },
          { name: "barcode", type: sql.NVarChar(64), value: row.barcode },
          { name: "publicToken", type: sql.NVarChar(64), value: row.publicToken },
          { name: "tax", type: sql.Decimal(5, 2), value: row.taxPercent },
          { name: "landing", type: sql.Decimal(12, 2), value: row.defaultLandingCost },
          { name: "selling", type: sql.Decimal(12, 2), value: row.defaultSellingCost },
          { name: "packageType", type: sql.NVarChar(32), value: row.packageType },
          { name: "sellingUnit", type: sql.NVarChar(32), value: row.sellingUnit },
          { name: "stockUnit", type: sql.NVarChar(32), value: row.stockUnit },
          { name: "displayUnit", type: sql.NVarChar(32), value: row.displayUnit },
          { name: "packageSize", type: sql.Decimal(14, 4), value: row.packageSize },
          { name: "packageMeasurement", type: sql.NVarChar(16), value: row.packageMeasurement },
          { name: "validationStatus", type: sql.NVarChar(32), value: row.validationStatus },
        ],
      );
    },

    async updateSmartFields(itemId, fields) {
      await queryOne(
        db,
        `UPDATE catalog_items SET
           [normalized_name] = @normalizedName,
           [selling_unit] = @sellingUnit,
           [stock_unit] = @stockUnit,
           [display_unit] = @displayUnit,
           [package_type] = @packageType,
           [package_size] = @packageSize,
           [package_measurement] = @packageMeasurement,
           [conversion_factor] = @conversionFactor,
           [unit_confidence] = @unitConfidence,
           [smart_classification] = @smartClassification,
           [default_kg_per_bag] = @defaultKgPerBag,
           [validation_status] = @validationStatus
         WHERE [id] = @itemId`,
        [
          { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
          { name: "normalizedName", type: sql.NVarChar(512), value: fields.normalizedName },
          { name: "sellingUnit", type: sql.NVarChar(32), value: fields.sellingUnit },
          { name: "stockUnit", type: sql.NVarChar(32), value: fields.stockUnit },
          { name: "displayUnit", type: sql.NVarChar(32), value: fields.displayUnit },
          { name: "packageType", type: sql.NVarChar(32), value: fields.packageType },
          { name: "packageSize", type: sql.Decimal(14, 4), value: fields.packageSize },
          { name: "packageMeasurement", type: sql.NVarChar(16), value: fields.packageMeasurement },
          { name: "conversionFactor", type: sql.Decimal(14, 6), value: fields.conversionFactor },
          { name: "unitConfidence", type: sql.Decimal(5, 2), value: fields.unitConfidence },
          { name: "smartClassification", type: sql.NVarChar(64), value: fields.smartClassification },
          { name: "defaultKgPerBag", type: sql.Decimal(12, 3), value: fields.defaultKgPerBag },
          { name: "validationStatus", type: sql.NVarChar(32), value: fields.validationStatus },
        ],
      );
    },

    async replaceDefaultSuppliers(businessId, itemId, supplierIds) {
      await queryOne(
        db,
        `DELETE FROM catalog_item_default_suppliers
         WHERE [business_id] = @businessId AND [catalog_item_id] = @itemId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        ],
      );
      const { randomUUID } = await import("node:crypto");
      for (let order = 0; order < supplierIds.length; order++) {
        await queryOne(
          db,
          `INSERT INTO catalog_item_default_suppliers
             ([id], [business_id], [catalog_item_id], [supplier_id], [sort_order])
           VALUES (@id, @businessId, @itemId, @supplierId, @ord)`,
          [
            { name: "id", type: sql.UniqueIdentifier, value: randomUUID() },
            { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
            { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
            { name: "supplierId", type: sql.UniqueIdentifier, value: supplierIds[order] },
            { name: "ord", type: sql.Int, value: order },
          ],
        );
      }
    },

    async replaceDefaultBrokers(businessId, itemId, brokerIds) {
      await queryOne(
        db,
        `DELETE FROM catalog_item_default_brokers
         WHERE [business_id] = @businessId AND [catalog_item_id] = @itemId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        ],
      );
      const { randomUUID } = await import("node:crypto");
      for (let order = 0; order < brokerIds.length; order++) {
        await queryOne(
          db,
          `INSERT INTO catalog_item_default_brokers
             ([id], [business_id], [catalog_item_id], [broker_id], [sort_order])
           VALUES (@id, @businessId, @itemId, @brokerId, @ord)`,
          [
            { name: "id", type: sql.UniqueIdentifier, value: randomUUID() },
            { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
            { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
            { name: "brokerId", type: sql.UniqueIdentifier, value: brokerIds[order] },
            { name: "ord", type: sql.Int, value: order },
          ],
        );
      }
    },

    async seedSupplierItemDefaults(businessId, itemId, supplierIds) {
      const { randomUUID } = await import("node:crypto");
      for (const sid of supplierIds) {
        const ex = await queryOne<Record<string, unknown>>(
          db,
          `SELECT [id] FROM supplier_item_defaults
           WHERE [business_id] = @businessId AND [catalog_item_id] = @itemId
             AND [supplier_id] = @supplierId`,
          [
            { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
            { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
            { name: "supplierId", type: sql.UniqueIdentifier, value: sid },
          ],
        );
        if (ex) continue;
        await queryOne(
          db,
          `INSERT INTO supplier_item_defaults
             ([id], [business_id], [supplier_id], [catalog_item_id],
              [purchase_count], [updated_at])
           VALUES (@id, @businessId, @supplierId, @itemId, 0, SYSUTCDATETIME())`,
          [
            { name: "id", type: sql.UniqueIdentifier, value: randomUUID() },
            { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
            { name: "supplierId", type: sql.UniqueIdentifier, value: sid },
            { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
          ],
        );
      }
    },

    async patchItem(args) {
      const { coerceBoxItemsPerBox } = await import(
        "../validation/catalogItems.schemas"
      );
      const p = args.patch;
      const sets: string[] = [
        "[category_id] = @categoryId",
        "[type_id] = @typeId",
      ];
      const params: SqlParam[] = [
        { name: "businessId", type: sql.UniqueIdentifier, value: args.businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: args.itemId },
        { name: "categoryId", type: sql.UniqueIdentifier, value: args.categoryId },
        { name: "typeId", type: sql.UniqueIdentifier, value: args.typeId },
      ];
      if ("name" in p && p.name != null) {
        sets.push("[name] = @name");
        params.push({ name: "name", type: sql.NVarChar(512), value: p.name });
      }
      let unit = typeof p.default_unit === "string" ? p.default_unit : null;
      if ("default_unit" in p) {
        sets.push("[default_unit] = @defaultUnit");
        params.push({
          name: "defaultUnit",
          type: sql.NVarChar(32),
          value: p.default_unit,
        });
        unit = String(p.default_unit);
        // Formula source: catalog.py update — clear extras when unit ≠ type;
        // only set matching field when key present (switching TO bag keeps old kg if unset).
        if (unit !== "bag") {
          sets.push("[default_kg_per_bag] = @dkg");
          params.push({ name: "dkg", type: sql.Decimal(12, 3), value: null });
        } else if ("default_kg_per_bag" in p) {
          sets.push("[default_kg_per_bag] = @dkg");
          params.push({
            name: "dkg",
            type: sql.Decimal(12, 3),
            value: p.default_kg_per_bag ?? null,
          });
        }
        if (unit !== "box") {
          sets.push("[default_items_per_box] = @dbox");
          params.push({ name: "dbox", type: sql.Decimal(12, 3), value: null });
        } else if ("default_items_per_box" in p) {
          sets.push("[default_items_per_box] = @dbox");
          params.push({
            name: "dbox",
            type: sql.Decimal(12, 3),
            value: coerceBoxItemsPerBox(
              p.default_items_per_box as number | null | undefined,
            ),
          });
        }
        if (unit !== "tin") {
          sets.push("[default_weight_per_tin] = @dwt");
          params.push({ name: "dwt", type: sql.Decimal(12, 3), value: null });
        } else if ("default_weight_per_tin" in p) {
          sets.push("[default_weight_per_tin] = @dwt");
          params.push({
            name: "dwt",
            type: sql.Decimal(12, 3),
            value: p.default_weight_per_tin ?? null,
          });
        }
      } else {
        if ("default_kg_per_bag" in p) {
          sets.push("[default_kg_per_bag] = @dkgOnly");
          params.push({
            name: "dkgOnly",
            type: sql.Decimal(12, 3),
            value: p.default_kg_per_bag,
          });
        }
        if ("default_items_per_box" in p) {
          sets.push("[default_items_per_box] = @dboxOnly");
          params.push({
            name: "dboxOnly",
            type: sql.Decimal(12, 3),
            value: p.default_items_per_box,
          });
        }
        if ("default_weight_per_tin" in p) {
          sets.push("[default_weight_per_tin] = @dwtOnly");
          params.push({
            name: "dwtOnly",
            type: sql.Decimal(12, 3),
            value: p.default_weight_per_tin,
          });
        }
      }
      if ("default_purchase_unit" in p) {
        sets.push("[default_purchase_unit] = @purchaseU");
        params.push({
          name: "purchaseU",
          type: sql.NVarChar(32),
          value: p.default_purchase_unit,
        });
      }
      if ("default_sale_unit" in p) {
        sets.push("[default_sale_unit] = @saleU");
        params.push({
          name: "saleU",
          type: sql.NVarChar(32),
          value: p.default_sale_unit,
        });
      }
      if ("hsn_code" in p) {
        sets.push("[hsn_code] = @hsn");
        params.push({ name: "hsn", type: sql.NVarChar(32), value: p.hsn_code });
      }
      if ("item_code" in p) {
        sets.push("[item_code] = @itemCode");
        params.push({
          name: "itemCode",
          type: sql.NVarChar(64),
          value: p.item_code,
        });
      }
      if ("tax_percent" in p) {
        sets.push("[tax_percent] = @tax");
        params.push({
          name: "tax",
          type: sql.Decimal(5, 2),
          value: p.tax_percent,
        });
      }
      if ("default_landing_cost" in p) {
        sets.push("[default_landing_cost] = @landing");
        params.push({
          name: "landing",
          type: sql.Decimal(12, 2),
          value: p.default_landing_cost,
        });
      }
      if ("default_selling_cost" in p) {
        sets.push("[default_selling_cost] = @selling");
        params.push({
          name: "selling",
          type: sql.Decimal(12, 2),
          value: p.default_selling_cost,
        });
      }
      if ("reorder_level" in p) {
        sets.push("[reorder_level] = @reorder");
        params.push({
          name: "reorder",
          type: sql.Decimal(12, 3),
          value: p.reorder_level ?? 0,
        });
      }
      await queryOne(
        db,
        `UPDATE catalog_items SET ${sets.join(", ")}
         WHERE [id] = @itemId AND [business_id] = @businessId`,
        params,
      );
    },

    async countTradeLines(itemId) {
      const row = await queryOne<Record<string, unknown>>(
        db,
        `SELECT COUNT(*) AS [c] FROM trade_purchase_lines
         WHERE [catalog_item_id] = @itemId`,
        [{ name: "itemId", type: sql.UniqueIdentifier, value: itemId }],
      );
      return Number(row?.c ?? 0);
    },

    async listVariantIds(businessId, itemId) {
      const rows = await queryMany<Record<string, unknown>>(
        db,
        `SELECT [id] FROM catalog_variants
         WHERE [business_id] = @businessId AND [catalog_item_id] = @itemId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        ],
      );
      return rows.map((r) => String(r.id));
    },

    async countArchivedEntryLinesForVariants(variantIds) {
      if (variantIds.length === 0) return 0;
      try {
        const params: SqlParam[] = [];
        const ph = variantIds.map((id, i) => {
          const n = `v${i}`;
          params.push({ name: n, type: sql.UniqueIdentifier, value: id });
          return `@${n}`;
        });
        const row = await queryOne<Record<string, unknown>>(
          db,
          `SELECT COUNT(*) AS [c] FROM _archived_entry_line_items
           WHERE [catalog_variant_id] IN (${ph.join(",")})`,
          params,
        );
        return Number(row?.c ?? 0);
      } catch {
        return 0;
      }
    },

    async deleteItem(businessId, itemId) {
      await queryOne(
        db,
        `DELETE FROM catalog_items
         WHERE [id] = @itemId AND [business_id] = @businessId`,
        [
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        ],
      );
    },
  };
}
