import { randomUUID } from "node:crypto";
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";
import type {
  StockDetailOut,
  StockMovementOut,
  BarcodeLookupOut,
  ReorderListOut,
  StaffPurchaseLogOut,
  StockAuditItemOut,
} from "../validation/stock.schemas";

type CatalogItemDetailRow = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  current_stock: number | null;
  reorder_level: number | null;
  stock_unit: string | null;
  default_unit: string | null;
  stock_version: number;
  opening_stock_set_at: Date | null;
  opening_stock_qty: number | null;
  opening_stock_locked: boolean;
  last_stock_updated_at: Date | null;
  category_name: string | null;
  subcategory_name: string | null;
};

type MovementRow = {
  id: string;
  movement_kind: string;
  delta_qty: number | null;
  qty_before: number | null;
  qty_after: number | null;
  stock_unit: string | null;
  reason: string | null;
  notes: string | null;
  source_type: string | null;
  actor_name: string | null;
  created_at: Date;
};

type AdjRow = {
  id: string;
  old_qty: number | null;
  new_qty: number | null;
  adjustment_type: string;
  reason: string | null;
  updated_by_name: string | null;
  updated_at: Date;
};

type BarcodeRow = {
  id: string;
  name: string;
  item_code: string | null;
  barcode: string | null;
  current_stock: number | null;
  stock_unit: string | null;
  category_name: string | null;
};

type ReorderRow = {
  id: string;
  item_id: string;
  item_name: string;
  current_stock: number | null;
  reorder_level: number | null;
  stock_unit: string | null;
  status: string;
  added_by_name: string | null;
  created_at: Date;
  updated_at: Date;
};

type CountRow = { c: number };

type StaffPurchRow = {
  id: string;
  item_id: string;
  item_name: string;
  qty: number | null;
  unit: string | null;
  supplier_name: string | null;
  broker_name: string | null;
  notes: string | null;
  created_by_name: string | null;
  created_at: Date;
};

function toIso(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : String(d);
}

function num(n: number | null | undefined): number {
  return Number(n ?? 0);
}

export class StockRepository {
  constructor(private readonly client: SqlClient) {}

  async getStockDetail(
    businessId: string,
    itemId: string,
  ): Promise<StockDetailOut | null> {
    const row = await queryOne<CatalogItemDetailRow>(
      this.client,
      `SELECT ci.[id], ci.[name], ci.[item_code], ci.[barcode],
              ci.[current_stock], ci.[reorder_level],
              ci.[stock_unit], ci.[default_unit],
              ci.[stock_version],
              ci.[opening_stock_set_at], ci.[opening_stock_qty],
              ci.[opening_stock_locked],
              ci.[last_stock_updated_at],
              ic.[name] AS category_name,
              ct.[name] AS subcategory_name
       FROM catalog_items ci
       LEFT JOIN item_categories ic ON ic.[id] = ci.[category_id]
       LEFT JOIN category_types ct ON ct.[id] = ci.[type_id]
       WHERE ci.[id] = @itemId
         AND ci.[business_id] = @businessId
         AND ci.[deleted_at] IS NULL`,
      [
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    if (!row) return null;

    const current = num(row.current_stock);
    const reorder = num(row.reorder_level);
    let stockStatus = "healthy";
    if (current <= 0) stockStatus = "out";
    else if (reorder > 0 && current <= reorder * 0.5) stockStatus = "critical";
    else if (reorder > 0 && current <= reorder) stockStatus = "low";

    return {
      id: row.id,
      name: row.name,
      item_code: row.item_code,
      barcode: row.barcode,
      current_stock: current,
      reorder_level: row.reorder_level != null ? num(row.reorder_level) : null,
      stock_unit: row.stock_unit,
      default_unit: row.default_unit,
      category_name: row.category_name,
      subcategory_name: row.subcategory_name,
      stock_status: stockStatus,
      opening_stock_set_at: toIso(row.opening_stock_set_at),
      opening_stock_qty: row.opening_stock_qty != null ? num(row.opening_stock_qty) : null,
      opening_stock_locked: row.opening_stock_locked,
      stock_version: row.stock_version,
      last_stock_updated_at: toIso(row.last_stock_updated_at),
      physical_stock_qty: null,
      physical_stock_difference_qty: null,
    };
  }

  async getCatalogItemForPatch(
    businessId: string,
    itemId: string,
  ): Promise<{
    id: string;
    current_stock: number;
    stock_version: number;
    opening_stock_locked: boolean;
    name: string;
    stock_unit: string | null;
    reorder_level: number | null;
  } | null> {
    const row = await queryOne<{
      id: string;
      current_stock: number | null;
      stock_version: number;
      opening_stock_locked: boolean;
      name: string;
      stock_unit: string | null;
      reorder_level: number | null;
    }>(
      this.client,
      `SELECT [id], [current_stock], [stock_version], [opening_stock_locked],
              [name], [stock_unit], [reorder_level]
       FROM catalog_items
       WHERE [id] = @itemId
         AND [business_id] = @businessId
         AND [deleted_at] IS NULL`,
      [
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    if (!row) return null;
    return {
      id: row.id,
      current_stock: num(row.current_stock),
      stock_version: row.stock_version,
      opening_stock_locked: row.opening_stock_locked,
      name: row.name,
      stock_unit: row.stock_unit,
      reorder_level: row.reorder_level,
    };
  }

  async patchStockAtomic(
    itemId: string,
    newQty: number,
    expectedVersion: number,
  ): Promise<boolean> {
    const result = await this.client
      .request()
      .input("itemId", sql.UniqueIdentifier, itemId)
      .input("newQty", sql.Decimal(12, 3), newQty)
      .input("expectedVersion", sql.Int, expectedVersion)
      .query(
        `UPDATE catalog_items
         SET [current_stock] = @newQty,
             [stock_version] = [stock_version] + 1,
             [last_stock_updated_at] = SYSUTCDATETIME()
         WHERE [id] = @itemId
           AND [stock_version] = @expectedVersion`,
      );
    return (result.rowsAffected?.[0] ?? 0) > 0;
  }

  async listMovements(
    businessId: string,
    itemId: string,
    limit: number,
    offset: number,
  ): Promise<StockMovementOut[]> {
    const rows = await queryMany<MovementRow>(
      this.client,
      `SELECT [id], [movement_kind], [delta_qty], [qty_before], [qty_after],
              [stock_unit], [reason], [notes], [source_type], [actor_name], [created_at]
       FROM stock_movements
       WHERE [business_id] = @businessId AND [item_id] = @itemId
       ORDER BY [created_at] DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "offset", type: sql.Int, value: offset },
        { name: "limit", type: sql.Int, value: limit },
      ],
    );
    return rows.map((r) => ({
      id: r.id,
      movement_kind: r.movement_kind,
      delta_qty: num(r.delta_qty),
      qty_before: num(r.qty_before),
      qty_after: num(r.qty_after),
      stock_unit: r.stock_unit,
      reason: r.reason,
      notes: r.notes,
      source_type: r.source_type,
      actor_name: r.actor_name,
      created_at: toIso(r.created_at)!,
    }));
  }

  async barcodeLookup(
    businessId: string,
    code: string,
  ): Promise<BarcodeLookupOut | null> {
    const row = await queryOne<BarcodeRow>(
      this.client,
      `SELECT ci.[id], ci.[name], ci.[item_code], ci.[barcode],
              ci.[current_stock], ci.[stock_unit],
              ic.[name] AS category_name
       FROM catalog_items ci
       LEFT JOIN item_categories ic ON ic.[id] = ci.[category_id]
       WHERE ci.[business_id] = @businessId
         AND ci.[deleted_at] IS NULL
         AND (ci.[barcode] = @code OR ci.[item_code] = @code)`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "code", type: sql.NVarChar(255), value: code },
      ],
    );
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      item_code: row.item_code,
      barcode: row.barcode,
      current_stock: num(row.current_stock),
      stock_unit: row.stock_unit,
      category_name: row.category_name,
      supplier_name: null,
    };
  }

  async listReorderEntries(
    businessId: string,
    status?: string,
  ): Promise<ReorderListOut> {
    const where: string[] = ["r.[business_id] = @businessId", "ci.[deleted_at] IS NULL"];
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
    ];
    if (status && status !== "all") {
      where.push("r.[status] = @status");
      params.push({ name: "status", type: sql.NVarChar(32), value: status });
    }
    const totalRow = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(r.[id]) AS c
       FROM reorder_list r
       INNER JOIN catalog_items ci ON ci.[id] = r.[item_id]
       WHERE ${where.join(" AND ")}`,
      params,
    );
    const total = Number(totalRow?.c ?? 0);
    if (total === 0) return { items: [], total: 0 };

    const rows = await queryMany<ReorderRow>(
      this.client,
      `SELECT r.[id], r.[item_id], ci.[name] AS item_name,
              ci.[current_stock], ci.[reorder_level],
              COALESCE(ci.[stock_unit], ci.[default_unit]) AS stock_unit,
              r.[status], r.[added_by_name],
              r.[created_at], r.[updated_at]
       FROM reorder_list r
       INNER JOIN catalog_items ci ON ci.[id] = r.[item_id]
       WHERE ${where.join(" AND ")}
       ORDER BY r.[created_at] DESC
       OFFSET 0 ROWS FETCH NEXT 200 ROWS ONLY`,
      params,
    );
    return {
      items: rows.map((r) => ({
        id: r.id,
        item_id: r.item_id,
        item_name: r.item_name,
        current_stock: num(r.current_stock),
        reorder_level: r.reorder_level != null ? num(r.reorder_level) : null,
        unit: r.stock_unit,
        status: r.status,
        added_by_name: r.added_by_name,
        created_at: toIso(r.created_at)!,
        updated_at: toIso(r.updated_at)!,
      })),
      total,
    };
  }

  async insertReorderEntry(
    businessId: string,
    itemId: string,
    addedBy: string | null,
    addedByName: string | null,
  ): Promise<string | null> {
    const existing = await queryOne<{ id: string }>(
      this.client,
      `SELECT [id] FROM reorder_list
       WHERE [business_id] = @businessId AND [item_id] = @itemId AND [status] = N'pending'`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
      ],
    );
    if (existing) return existing.id;

    const id = randomUUID();
    await queryOne(
      this.client,
      `INSERT INTO reorder_list ([id], [business_id], [item_id], [added_by], [added_by_name], [status], [created_at], [updated_at])
       VALUES (@id, @businessId, @itemId, @addedBy, @addedByName, N'pending', SYSUTCDATETIME(), SYSUTCDATETIME())`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: id },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        {
          name: "addedBy",
          type: sql.UniqueIdentifier,
          value: addedBy ?? null,
        },
        {
          name: "addedByName",
          type: sql.NVarChar(255),
          value: addedByName ?? null,
        },
      ],
    );
    return id;
  }

  async updateReorderEntry(
    entryId: string,
    businessId: string,
    status: string,
  ): Promise<boolean> {
    const result = await this.client
      .request()
      .input("entryId", sql.UniqueIdentifier, entryId)
      .input("businessId", sql.UniqueIdentifier, businessId)
      .input("status", sql.NVarChar(32), status)
      .query(
        `UPDATE reorder_list
         SET [status] = @status, [updated_at] = SYSUTCDATETIME()
         WHERE [id] = @entryId AND [business_id] = @businessId`,
      );
    return (result.rowsAffected?.[0] ?? 0) > 0;
  }

  async deleteReorderEntry(entryId: string, businessId: string): Promise<boolean> {
    const result = await this.client
      .request()
      .input("entryId", sql.UniqueIdentifier, entryId)
      .input("businessId", sql.UniqueIdentifier, businessId)
      .query(
        `DELETE FROM reorder_list WHERE [id] = @entryId AND [business_id] = @businessId`,
      );
    return (result.rowsAffected?.[0] ?? 0) > 0;
  }

  async insertStockMovement(opts: {
    businessId: string;
    itemId: string;
    movementKind: string;
    deltaQty: number;
    qtyBefore: number;
    qtyAfter: number;
    stockUnit: string | null;
    reason: string | null;
    notes: string | null;
    sourceType: string | null;
    sourceId: string | null;
    idempotencyKey: string;
    actorId: string | null;
    actorName: string | null;
    unitMismatchFlag: boolean;
    metadataJson: string | null;
  }): Promise<string> {
    const id = randomUUID();
    await queryOne(
      this.client,
      `INSERT INTO stock_movements (
         [id], [business_id], [item_id], [movement_kind],
         [delta_qty], [qty_before], [qty_after], [stock_unit],
         [reason], [notes], [source_type], [source_id],
         [idempotency_key], [actor_id], [actor_name],
         [unit_mismatch_flag], [metadata_json], [created_at]
       ) VALUES (
         @id, @businessId, @itemId, @movementKind,
         @deltaQty, @qtyBefore, @qtyAfter, @stockUnit,
         @reason, @notes, @sourceType, @sourceId,
         @idempotencyKey, @actorId, @actorName,
         @unitMismatchFlag, @metadataJson, SYSUTCDATETIME()
       )`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: id },
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: opts.itemId },
        { name: "movementKind", type: sql.NVarChar(50), value: opts.movementKind },
        { name: "deltaQty", type: sql.Decimal(12, 3), value: opts.deltaQty },
        { name: "qtyBefore", type: sql.Decimal(12, 3), value: opts.qtyBefore },
        { name: "qtyAfter", type: sql.Decimal(12, 3), value: opts.qtyAfter },
        { name: "stockUnit", type: sql.NVarChar(32), value: opts.stockUnit ?? null },
        { name: "reason", type: sql.NVarChar(255), value: opts.reason ?? null },
        { name: "notes", type: sql.NVarChar(sql.MAX), value: opts.notes ?? null },
        { name: "sourceType", type: sql.NVarChar(50), value: opts.sourceType ?? null },
        { name: "sourceId", type: sql.UniqueIdentifier, value: opts.sourceId ?? null },
        { name: "idempotencyKey", type: sql.NVarChar(120), value: opts.idempotencyKey },
        { name: "actorId", type: sql.UniqueIdentifier, value: opts.actorId ?? null },
        { name: "actorName", type: sql.NVarChar(255), value: opts.actorName ?? null },
        { name: "unitMismatchFlag", type: sql.Bit, value: opts.unitMismatchFlag },
        { name: "metadataJson", type: sql.NVarChar(sql.MAX), value: opts.metadataJson ?? null },
      ],
    );
    return id;
  }

  async insertStockAdjustmentLog(opts: {
    businessId: string;
    itemId: string;
    oldQty: number;
    newQty: number;
    adjustmentType: string;
    reason: string | null;
    updatedBy: string | null;
    updatedByName: string | null;
  }): Promise<string> {
    const id = randomUUID();
    await queryOne(
      this.client,
      `INSERT INTO stock_adjustment_log (
         [id], [business_id], [item_id], [old_qty], [new_qty],
         [adjustment_type], [reason], [updated_by], [updated_by_name], [updated_at]
       ) VALUES (
         @id, @businessId, @itemId, @oldQty, @newQty,
         @adjustmentType, @reason, @updatedBy, @updatedByName, SYSUTCDATETIME()
       )`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: id },
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: opts.itemId },
        { name: "oldQty", type: sql.Decimal(12, 3), value: opts.oldQty },
        { name: "newQty", type: sql.Decimal(12, 3), value: opts.newQty },
        { name: "adjustmentType", type: sql.NVarChar(50), value: opts.adjustmentType },
        { name: "reason", type: sql.NVarChar(255), value: opts.reason ?? null },
        { name: "updatedBy", type: sql.UniqueIdentifier, value: opts.updatedBy ?? null },
        { name: "updatedByName", type: sql.NVarChar(255), value: opts.updatedByName ?? null },
      ],
    );
    return id;
  }

  async insertPhysicalCount(opts: {
    businessId: string;
    itemId: string;
    systemQty: number;
    countedQty: number;
    purchasedQty: number | null;
    stockUnit: string | null;
    periodStart: string | null;
    periodEnd: string | null;
    notes: string | null;
    countedBy: string | null;
    countedByName: string | null;
  }): Promise<string> {
    const id = randomUUID();
    const diff = opts.countedQty - opts.systemQty;
    await queryOne(
      this.client,
      `INSERT INTO stock_physical_counts (
         [id], [business_id], [item_id], [system_qty], [counted_qty],
         [difference_qty], [purchased_qty], [stock_unit],
         [period_start], [period_end], [notes],
         [counted_by], [counted_by_name], [counted_at]
       ) VALUES (
         @id, @businessId, @itemId, @systemQty, @countedQty,
         @differenceQty, @purchasedQty, @stockUnit,
         @periodStart, @periodEnd, @notes,
         @countedBy, @countedByName, SYSUTCDATETIME()
       )`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: id },
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: opts.itemId },
        { name: "systemQty", type: sql.Decimal(12, 3), value: opts.systemQty },
        { name: "countedQty", type: sql.Decimal(12, 3), value: opts.countedQty },
        { name: "differenceQty", type: sql.Decimal(12, 3), value: diff },
        { name: "purchasedQty", type: sql.Decimal(12, 3), value: opts.purchasedQty ?? null },
        { name: "stockUnit", type: sql.NVarChar(32), value: opts.stockUnit ?? null },
        { name: "periodStart", type: sql.Date, value: opts.periodStart ?? null },
        { name: "periodEnd", type: sql.Date, value: opts.periodEnd ?? null },
        { name: "notes", type: sql.NVarChar(sql.MAX), value: opts.notes ?? null },
        { name: "countedBy", type: sql.UniqueIdentifier, value: opts.countedBy ?? null },
        { name: "countedByName", type: sql.NVarChar(255), value: opts.countedByName ?? null },
      ],
    );
    return id;
  }

  async setOpeningStock(opts: {
    businessId: string;
    itemId: string;
    qty: number;
    reason: string | null;
    notes: string | null;
    userId: string | null;
    userName: string | null;
    idempotencyKey: string;
  }): Promise<boolean> {
    const result = await this.client
      .request()
      .input("itemId", sql.UniqueIdentifier, opts.itemId)
      .input("businessId", sql.UniqueIdentifier, opts.businessId)
      .input("qty", sql.Decimal(12, 3), opts.qty)
      .input("reason", sql.NVarChar(255), opts.reason ?? null)
      .input("notes", sql.NVarChar(sql.MAX), opts.notes ?? null)
      .input("userId", sql.UniqueIdentifier, opts.userId ?? null)
      .input("userName", sql.NVarChar(255), opts.userName ?? null)
      .query(
        `UPDATE catalog_items
         SET [current_stock] = @qty,
             [opening_stock_qty] = @qty,
             [opening_stock_set_at] = SYSUTCDATETIME(),
             [opening_stock_set_by] = @userId,
             [opening_stock_locked] = 1,
             [stock_version] = [stock_version] + 1,
             [last_stock_updated_at] = SYSUTCDATETIME()
         WHERE [id] = @itemId
           AND [business_id] = @businessId
           AND [deleted_at] IS NULL
           AND [opening_stock_set_at] IS NULL`,
      );
    return (result.rowsAffected?.[0] ?? 0) > 0;
  }

  async insertStaffPurchaseLog(opts: {
    id: string;
    businessId: string;
    itemId: string;
    itemName: string;
    qty: number;
    unit: string | null;
    amount: number | null;
    supplierId: string | null;
    supplierName: string | null;
    brokerId: string | null;
    brokerName: string | null;
    notes: string | null;
    idempotencyKey: string | null;
    stockMovementId: string | null;
    createdBy: string | null;
    createdByName: string | null;
  }): Promise<void> {
    await queryOne(
      this.client,
      `INSERT INTO staff_purchase_logs (
         [id], [business_id], [item_id], [item_name],
         [qty], [unit], [amount],
         [supplier_id], [supplier_name], [broker_id], [broker_name],
         [notes], [idempotency_key], [stock_movement_id],
         [created_by], [created_by_name], [created_at]
       ) VALUES (
         @id, @businessId, @itemId, @itemName,
         @qty, @unit, @amount,
         @supplierId, @supplierName, @brokerId, @brokerName,
         @notes, @idempotencyKey, @stockMovementId,
         @createdBy, @createdByName, SYSUTCDATETIME()
       )`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: opts.id },
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: opts.itemId },
        { name: "itemName", type: sql.NVarChar(512), value: opts.itemName },
        { name: "qty", type: sql.Decimal(12, 3), value: opts.qty },
        { name: "unit", type: sql.NVarChar(32), value: opts.unit ?? null },
        { name: "amount", type: sql.Decimal(12, 2), value: opts.amount ?? null },
        { name: "supplierId", type: sql.UniqueIdentifier, value: opts.supplierId ?? null },
        { name: "supplierName", type: sql.NVarChar(255), value: opts.supplierName ?? null },
        { name: "brokerId", type: sql.UniqueIdentifier, value: opts.brokerId ?? null },
        { name: "brokerName", type: sql.NVarChar(255), value: opts.brokerName ?? null },
        { name: "notes", type: sql.NVarChar(sql.MAX), value: opts.notes ?? null },
        { name: "idempotencyKey", type: sql.NVarChar(120), value: opts.idempotencyKey ?? null },
        { name: "stockMovementId", type: sql.UniqueIdentifier, value: opts.stockMovementId ?? null },
        { name: "createdBy", type: sql.UniqueIdentifier, value: opts.createdBy ?? null },
        { name: "createdByName", type: sql.NVarChar(255), value: opts.createdByName ?? null },
      ],
    );
  }

  async findExistingStaffPurchase(
    businessId: string,
    idempotencyKey: string,
  ): Promise<StaffPurchaseLogOut | null> {
    const row = await queryOne<StaffPurchRow>(
      this.client,
      `SELECT [id], [item_id], [item_name], [qty], [unit],
              [supplier_name], [broker_name], [notes],
              [created_by_name], [created_at]
       FROM staff_purchase_logs
       WHERE [business_id] = @businessId AND [idempotency_key] = @key`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "key", type: sql.NVarChar(120), value: idempotencyKey },
      ],
    );
    if (!row) return null;
    return {
      id: row.id,
      item_id: row.item_id,
      item_name: row.item_name,
      qty: num(row.qty),
      unit: row.unit,
      supplier_name: row.supplier_name,
      broker_name: row.broker_name,
      notes: row.notes,
      created_by_name: row.created_by_name,
      created_at: toIso(row.created_at)!,
    };
  }

  async listStockAuditByItem(
    businessId: string,
    itemId: string,
    limit: number,
  ): Promise<StockAuditItemOut[]> {
    const lim = Math.min(100, Math.max(1, limit));
    const rows = await queryMany<AdjRow>(
      this.client,
      `SELECT [id], [old_qty], [new_qty], [adjustment_type],
              [reason], [updated_by_name], [updated_at]
       FROM stock_adjustment_log
       WHERE [business_id] = @businessId AND [item_id] = @itemId
       ORDER BY [updated_at] DESC
       OFFSET 0 ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "lim", type: sql.Int, value: lim },
      ],
    );
    return rows.map((r) => ({
      id: r.id,
      old_qty: num(r.old_qty),
      new_qty: num(r.new_qty),
      adjustment_type: r.adjustment_type,
      reason: r.reason,
      updated_by_name: r.updated_by_name,
      updated_at: toIso(r.updated_at)!,
    }));
  }

  async getLastAdjustmentByUser(
    businessId: string,
    itemId: string,
    userId: string,
    withinMinutes: number,
  ): Promise<{
    id: string;
    old_qty: number;
    new_qty: number;
  } | null> {
    const row = await queryOne<{
      id: string;
      old_qty: number | null;
      new_qty: number | null;
    }>(
      this.client,
      `SELECT TOP (1) [id], [old_qty], [new_qty]
       FROM stock_adjustment_log
       WHERE [business_id] = @businessId
         AND [item_id] = @itemId
         AND [updated_by] = @userId
         AND [updated_at] >= DATEADD(minute, -@mins, SYSUTCDATETIME())
       ORDER BY [updated_at] DESC`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
        { name: "mins", type: sql.Int, value: withinMinutes },
      ],
    );
    if (!row) return null;
    return { id: row.id, old_qty: num(row.old_qty), new_qty: num(row.new_qty) };
  }

  async getMovementDeliveredQty(
    businessId: string,
    itemId: string,
  ): Promise<number> {
    const row = await queryOne<{ total: number | null }>(
      this.client,
      `SELECT COALESCE(SUM([delta_qty]), 0) AS total
       FROM stock_movements
       WHERE [business_id] = @businessId
         AND [item_id] = @itemId
         AND [movement_kind] = N'delivery_receive'`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
      ],
    );
    return num(row?.total);
  }

  async getPeriodPurchasedQty(
    businessId: string,
    itemId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<number> {
    const row = await queryOne<{ total: number | null }>(
      this.client,
      `SELECT COALESCE(SUM(tpl.[qty_in_stock_unit]), 0) AS total
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tpl.[catalog_item_id] = @itemId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND tp.[status] NOT IN (N'deleted', N'cancelled')`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return num(row?.total);
  }

  async getSupplierNameForItem(
    businessId: string,
    itemId: string,
  ): Promise<string | null> {
    const row = await queryOne<{ name: string | null }>(
      this.client,
      `SELECT s.[name]
       FROM catalog_items ci
       LEFT JOIN suppliers s ON s.[id] = ci.[last_supplier_id]
       WHERE ci.[id] = @itemId AND ci.[business_id] = @businessId`,
      [
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    return row?.name ?? null;
  }

  async getLastPurchaseHumanId(
    businessId: string,
    itemId: string,
  ): Promise<string | null> {
    const row = await queryOne<{ human_id: string | null }>(
      this.client,
      `SELECT tp.[human_id]
       FROM trade_purchases tp
       INNER JOIN catalog_items ci ON ci.[last_trade_purchase_id] = tp.[id]
       WHERE ci.[id] = @itemId AND ci.[business_id] = @businessId`,
      [
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    return row?.human_id ?? null;
  }

  async findCatalogItemName(
    businessId: string,
    itemId: string,
  ): Promise<string | null> {
    const row = await queryOne<{ name: string }>(
      this.client,
      `SELECT [name] FROM catalog_items
       WHERE [id] = @itemId AND [business_id] = @businessId AND [deleted_at] IS NULL`,
      [
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    return row?.name ?? null;
  }

  async updateCatalogItemLastSupplier(
    businessId: string,
    itemId: string,
    supplierId: string | null,
    supplierName: string | null,
    brokerId: string | null,
    brokerName: string | null,
    qty: number,
    unit: string | null,
  ): Promise<void> {
    await this.client
      .request()
      .input("itemId", sql.UniqueIdentifier, itemId)
      .input("businessId", sql.UniqueIdentifier, businessId)
      .input("supplierId", sql.UniqueIdentifier, supplierId ?? null)
      .input("supplierName", sql.NVarChar(255), supplierName ?? null)
      .input("brokerId", sql.UniqueIdentifier, brokerId ?? null)
      .input("brokerName", sql.NVarChar(255), brokerName ?? null)
      .input("qty", sql.Decimal(12, 3), qty)
      .input("unit", sql.NVarChar(32), unit ?? null)
      .query(
        `UPDATE catalog_items
         SET [last_supplier_id] = @supplierId,
             [last_supplier_name] = @supplierName,
             [last_broker_id] = @brokerId,
             [last_broker_name] = @brokerName,
             [last_line_qty] = @qty,
             [last_line_unit] = @unit
          WHERE [id] = @itemId AND [business_id] = @businessId`,
      );
  }

  async getBarcodeLabelItem(
    businessId: string,
    itemId: string,
  ): Promise<{
    id: string;
    name: string;
    item_code: string | null;
    barcode: string | null;
    current_stock: number;
    reorder_level: number | null;
    stock_unit: string | null;
    default_unit: string | null;
    category_id: string | null;
    last_supplier_id: string | null;
  } | null> {
    const row = await queryOne<any>(
      this.client,
      `SELECT [id], [name], [item_code], [barcode],
              CAST(ISNULL([current_stock], 0) AS FLOAT) AS current_stock,
              [reorder_level], [stock_unit], [default_unit],
              [category_id], [last_supplier_id]
       FROM catalog_items
       WHERE [id] = @itemId AND [business_id] = @businessId AND [deleted_at] IS NULL`,
      [
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    return row as any ?? null;
  }

  async getCategoryName(
    categoryId: string,
  ): Promise<string | null> {
    const row = await queryOne<{ name: string }>(
      this.client,
      `SELECT [name] FROM item_categories WHERE [id] = @categoryId`,
      [{ name: "categoryId", type: sql.UniqueIdentifier, value: categoryId }],
    );
    return row?.name ?? null;
  }

  async getSupplierName(
    supplierId: string,
  ): Promise<string | null> {
    const row = await queryOne<{ name: string }>(
      this.client,
      `SELECT [name] FROM suppliers WHERE [id] = @supplierId`,
      [{ name: "supplierId", type: sql.UniqueIdentifier, value: supplierId }],
    );
    return row?.name ?? null;
  }

  async getLatestPurchaseForItem(
    businessId: string,
    itemId: string,
  ): Promise<{
    purchase_date: string | null;
    qty: number | null;
    unit: string | null;
    rate: number | null;
  } | null> {
    const row = await queryOne<any>(
      this.client,
      `SELECT TOP 1 tp.[purchase_date], tpl.[qty], tpl.[unit],
              CAST(ISNULL(tpl.[landing_cost], tpl.[purchase_rate]) AS FLOAT) AS rate
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tpl.[catalog_item_id] = @itemId
         AND tp.[status] NOT IN (N'cancelled', N'deleted')
       ORDER BY tp.[purchase_date] DESC`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
      ],
    );
    return row as any ?? null;
  }

  async getPurchaseIntelligence(
    businessId: string,
    itemId: string,
  ): Promise<{
    suggested_qty: number;
    avg_interval_days: number | null;
    default_supplier: { id: string; name: string } | null;
  }> {
    const rows = await queryMany<any>(
      this.client,
      `SELECT TOP 12 tpl.[qty], tpl.[landing_cost], tpl.[purchase_rate],
              tp.[purchase_date], tp.[supplier_id], s.[name] AS supplier_name
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       LEFT JOIN suppliers s ON s.[id] = tp.[supplier_id]
       WHERE tp.[business_id] = @businessId
         AND tpl.[catalog_item_id] = @itemId
         AND tp.[status] NOT IN (N'cancelled', N'deleted')
       ORDER BY tp.[purchase_date] DESC`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
      ],
    );
    if (rows.length === 0) {
      return { suggested_qty: 0, avg_interval_days: null, default_supplier: null };
    }
    const totalQty = rows.reduce((s: number, r: any) => s + Number(r.qty ?? 0), 0);
    const suggestedQty = totalQty / rows.length;
    let avgInterval: number | null = null;
    if (rows.length >= 2) {
      const sorted = [...rows].sort(
        (a: any, b: any) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime(),
      );
      let totalDays = 0;
      for (let i = 1; i < sorted.length; i++) {
        totalDays += (new Date(sorted[i].purchase_date).getTime() - new Date(sorted[i - 1].purchase_date).getTime()) / 86400000;
      }
      avgInterval = totalDays / (sorted.length - 1);
    }
    const supplierMap = new Map<string, { id: string; name: string; count: number }>();
    for (const r of rows) {
      if (r.supplier_id) {
        const key = String(r.supplier_id);
        const existing = supplierMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          supplierMap.set(key, { id: key, name: r.supplier_name ?? "Unknown", count: 1 });
        }
      }
    }
    let defaultSupplier: { id: string; name: string } | null = null;
    let maxCount = 0;
    for (const s of supplierMap.values()) {
      if (s.count > maxCount) {
        maxCount = s.count;
        defaultSupplier = { id: s.id, name: s.name };
      }
    }
    return { suggested_qty: Math.round(suggestedQty), avg_interval_days: avgInterval ? Math.round(avgInterval) : null, default_supplier: defaultSupplier };
  }
}

export function createStockRepository(client: SqlClient): StockRepository {
  return new StockRepository(client);
}
