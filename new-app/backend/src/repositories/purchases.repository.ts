import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";
import type { PurchaseRow, PurchaseLineRow, PurchaseDraftRow, LifecycleEventRow } from "./types";

export type PurchaseRepository = {
  getDraft(businessId: string, userId: string): Promise<PurchaseDraftRow | null>;
  upsertDraft(businessId: string, userId: string, step: number, payload: string): Promise<void>;
  deleteDraft(businessId: string, userId: string): Promise<void>;
  maxHumanIdSequence(businessId: string, year: number): Promise<number>;
  lastTradeLineForItem(businessId: string, catalogItemId: string, supplierId?: string, brokerId?: string): Promise<Record<string, unknown> | null>;
  listPurchases(businessId: string, limit: number, offset: number, filters: Record<string, unknown>): Promise<PurchaseRow[]>;
  listPurchaseLines(purchaseIds: string[]): Promise<PurchaseLineRow[]>;
  getPurchase(businessId: string, purchaseId: string): Promise<PurchaseRow | null>;
  getPurchaseLines(purchaseId: string): Promise<PurchaseLineRow[]>;
  getPurchaseWithLines(businessId: string, purchaseId: string): Promise<{ header: PurchaseRow; lines: PurchaseLineRow[] } | null>;
  insertPurchase(header: Record<string, unknown>): Promise<void>;
  insertPurchaseLines(lines: Record<string, unknown>[]): Promise<void>;
  updatePurchase(businessId: string, purchaseId: string, fields: Record<string, unknown>): Promise<void>;
  deletePurchaseLines(purchaseId: string): Promise<void>;
  softDeletePurchase(businessId: string, purchaseId: string): Promise<void>;
  cancelPurchase(businessId: string, purchaseId: string): Promise<void>;
  updatePurchasePayment(businessId: string, purchaseId: string, paidAmount: number, paidAt: string): Promise<void>;
  insertLifecycleEvent(event: Record<string, unknown>): Promise<void>;
  listLifecycleEventsByPurchase(purchaseId: string): Promise<LifecycleEventRow[]>;
  findDuplicatePurchases(businessId: string, supplierId: string | null, windowStart: string, excludeId?: string): Promise<PurchaseRow[]>;
  getPurchaseLinesForCheck(purchaseIds: string[]): Promise<PurchaseLineRow[]>;

  // Delivery pipeline
  getDeliveryPipeline(businessId: string): Promise<{ delivery_status: string; cnt: number }[]>;
  getDeliveryPendingAmount(businessId: string): Promise<number>;
  updatePurchaseFields(businessId: string, purchaseId: string, fields: Record<string, unknown>): Promise<void>;
  updateLineVerification(lineId: string, receivedQty: number, damagedQty: number, returnQty: number): Promise<void>;
};

function nv(max: number) { return sql.NVarChar(max); }
function d14_2() { return sql.Decimal(14, 2); }
function uid() { return sql.UniqueIdentifier; }

export function createPurchaseRepository(client: SqlClient): PurchaseRepository {
  return {
    async getDraft(businessId, userId) {
      return queryOne<PurchaseDraftRow>(client,
        `SELECT id, business_id, user_id, step, payload_json, updated_at FROM trade_purchase_drafts WHERE business_id = @businessId AND user_id = @userId`,
        [{ name: "businessId", type: uid(), value: businessId }, { name: "userId", type: uid(), value: userId }],
      );
    },

    async upsertDraft(businessId, userId, step, payload) {
      const id = require("crypto").randomUUID();
      const now = new Date().toISOString();
      const req = client.request();
      req.input("id", uid(), id);
      req.input("businessId", uid(), businessId);
      req.input("userId", uid(), userId);
      req.input("step", sql.Int, step);
      req.input("payload", nv(-1), payload);
      req.input("updatedAt", nv(32), now);
      await req.query(`MERGE trade_purchase_drafts AS t
        USING (SELECT @id AS id, @businessId AS business_id, @userId AS user_id) AS s
        ON t.business_id = s.business_id AND t.user_id = s.user_id
        WHEN MATCHED THEN UPDATE SET step = @step, payload_json = @payload, updated_at = @updatedAt
        WHEN NOT MATCHED THEN INSERT (id, business_id, user_id, step, payload_json, updated_at)
          VALUES (@id, @businessId, @userId, @step, @payload, @updatedAt);`);
    },

    async deleteDraft(businessId, userId) {
      const req = client.request();
      req.input("businessId", uid(), businessId);
      req.input("userId", uid(), userId);
      await req.query("DELETE FROM trade_purchase_drafts WHERE business_id = @businessId AND user_id = @userId");
    },

    async maxHumanIdSequence(businessId, year) {
      const prefix = `PUR-${year}-`;
      const row = await queryOne<{ seq: number }>(client,
        `SELECT MAX(CAST(SUBSTRING(human_id, LEN(@prefix) + 1, 4) AS INT)) AS seq FROM trade_purchases WHERE business_id = @businessId AND human_id LIKE @prefix + '%'`,
        [{ name: "businessId", type: uid(), value: businessId }, { name: "prefix", type: nv(16), value: prefix }],
      );
      return row?.seq ?? 0;
    },

    async lastTradeLineForItem(businessId, catalogItemId, supplierId, brokerId) {
      const params: SqlParam[] = [
        { name: "businessId", type: uid(), value: businessId },
        { name: "catalogItemId", type: uid(), value: catalogItemId },
      ];
      let sqlText = `SELECT TOP 1 l.*, p.purchase_date, p.payment_days, p.broker_id,
        p.delivered_rate AS hdr_delivered_rate, p.billty_rate AS hdr_billty_rate,
        p.freight_amount, p.freight_type
        FROM trade_purchase_lines l
        JOIN trade_purchases p ON p.id = l.trade_purchase_id
        WHERE p.business_id = @businessId AND l.catalog_item_id = @catalogItemId
          AND p.status IN ('saved','confirmed','paid','partially_paid','overdue','due_soon')`;
      if (supplierId) { sqlText += ` AND p.supplier_id = @supplierId`; params.push({ name: "supplierId", type: uid(), value: supplierId }); }
      if (brokerId) { sqlText += ` AND p.broker_id = @brokerId`; params.push({ name: "brokerId", type: uid(), value: brokerId }); }
      sqlText += ` ORDER BY p.purchase_date DESC, p.created_at DESC`;
      const row = await queryOne<Record<string, unknown>>(client, sqlText, params);
      return row ?? null;
    },

    async listPurchases(businessId, limit, offset, filters) {
      const params: SqlParam[] = [{ name: "businessId", type: uid(), value: businessId }];
      let sqlText = `SELECT * FROM trade_purchases WHERE business_id = @businessId AND status != 'deleted'`;
      const status = filters.status as string | undefined;
      if (status && status !== "all") { sqlText += ` AND status = @status`; params.push({ name: "status", type: nv(24), value: status }); }
      const supplierId = filters.supplierId as string | undefined;
      if (supplierId) { sqlText += ` AND supplier_id = @supplierId`; params.push({ name: "supplierId", type: uid(), value: supplierId }); }
      const brokerId = filters.brokerId as string | undefined;
      if (brokerId) { sqlText += ` AND broker_id = @brokerId`; params.push({ name: "brokerId", type: uid(), value: brokerId }); }
      const purchaseFrom = filters.purchaseFrom as string | undefined;
      if (purchaseFrom) { sqlText += ` AND purchase_date >= @purchaseFrom`; params.push({ name: "purchaseFrom", type: nv(10), value: purchaseFrom }); }
      const purchaseTo = filters.purchaseTo as string | undefined;
      if (purchaseTo) { sqlText += ` AND purchase_date <= @purchaseTo`; params.push({ name: "purchaseTo", type: nv(10), value: purchaseTo }); }
      const q = filters.q as string | undefined;
      if (q) { sqlText += ` AND (human_id LIKE @q OR invoice_number LIKE @q)`; params.push({ name: "q", type: nv(64), value: `%${q}%` }); }
      sqlText += ` ORDER BY purchase_date DESC, created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
      params.push({ name: "offset", type: sql.Int, value: offset });
      params.push({ name: "limit", type: sql.Int, value: limit });
      return queryMany<PurchaseRow>(client, sqlText, params);
    },

    async listPurchaseLines(purchaseIds) {
      if (!purchaseIds.length) return [];
      const params: SqlParam[] = purchaseIds.map((id, i) => ({ name: `id${i}`, type: uid(), value: id }));
      const idPlaceholders = purchaseIds.map((_, i) => `@id${i}`).join(",");
      return queryMany<PurchaseLineRow>(client, `SELECT * FROM trade_purchase_lines WHERE trade_purchase_id IN (${idPlaceholders})`, params);
    },

    async getPurchase(businessId, purchaseId) {
      return queryOne<PurchaseRow>(client,
        `SELECT * FROM trade_purchases WHERE business_id = @businessId AND id = @purchaseId`,
        [{ name: "businessId", type: uid(), value: businessId }, { name: "purchaseId", type: uid(), value: purchaseId }],
      );
    },

    async getPurchaseLines(purchaseId) {
      return queryMany<PurchaseLineRow>(client,
        `SELECT * FROM trade_purchase_lines WHERE trade_purchase_id = @purchaseId`,
        [{ name: "purchaseId", type: uid(), value: purchaseId }],
      );
    },

    async getPurchaseWithLines(businessId, purchaseId) {
      const header = await this.getPurchase(businessId, purchaseId);
      if (!header) return null;
      const lines = await this.getPurchaseLines(purchaseId);
      return { header, lines };
    },

    async insertPurchase(header) {
      const cols = Object.keys(header);
      const names = cols.map((c) => `[${c}]`).join(",");
      const placeholders = cols.map((c) => `@${c}`).join(",");
      const req = client.request();
      for (const [k, v] of Object.entries(header)) {
        const t = typeof v === "string" && v.length > 100 ? nv(-1) : (typeof v === "number" ? d14_2() : (typeof v === "boolean" ? sql.Bit : nv(255)));
        req.input(k, t, v ?? null);
      }
      await req.query(`INSERT INTO trade_purchases (${names}) VALUES (${placeholders})`);
    },

    async insertPurchaseLines(lines) {
      if (!lines.length) return;
      for (const line of lines) {
        const cols = Object.keys(line);
        const names = cols.map((c) => `[${c}]`).join(",");
        const placeholders = cols.map((c) => `@${c}`).join(",");
        const req = client.request();
        for (const [k, v] of Object.entries(line)) {
          const t = typeof v === "string" && v.length > 100 ? nv(-1) : (typeof v === "number" ? d14_2() : nv(255));
          req.input(k, t, v ?? null);
        }
        await req.query(`INSERT INTO trade_purchase_lines (${names}) VALUES (${placeholders})`);
      }
    },

    async updatePurchase(businessId, purchaseId, fields) {
      if (!Object.keys(fields).length) return;
      const sets = Object.keys(fields).map((k) => `[${k}] = @${k}`).join(",");
      const req = client.request();
      req.input("businessId", uid(), businessId);
      req.input("purchaseId", uid(), purchaseId);
      for (const [k, v] of Object.entries(fields)) {
        const t = typeof v === "string" && v.length > 100 ? nv(-1) : (typeof v === "number" ? d14_2() : (typeof v === "boolean" ? sql.Bit : nv(255)));
        req.input(k, t, v ?? null);
      }
      await req.query(`UPDATE trade_purchases SET ${sets}, updated_at = @updatedAt WHERE business_id = @businessId AND id = @purchaseId`);
      if (!fields.updated_at) {
        req.input("updatedAt", nv(32), new Date().toISOString());
      }
    },

    async deletePurchaseLines(purchaseId) {
      const req = client.request();
      req.input("purchaseId", uid(), purchaseId);
      await req.query("DELETE FROM trade_purchase_lines WHERE trade_purchase_id = @purchaseId");
    },

    async softDeletePurchase(businessId, purchaseId) {
      const req = client.request();
      req.input("businessId", uid(), businessId);
      req.input("purchaseId", uid(), purchaseId);
      req.input("updatedAt", nv(32), new Date().toISOString());
      await req.query(`UPDATE trade_purchases SET status = 'deleted', is_delivered = 0, delivery_status = 'cancelled', updated_at = @updatedAt WHERE business_id = @businessId AND id = @purchaseId`);
    },

    async cancelPurchase(businessId, purchaseId) {
      const req = client.request();
      req.input("businessId", uid(), businessId);
      req.input("purchaseId", uid(), purchaseId);
      req.input("updatedAt", nv(32), new Date().toISOString());
      await req.query(`UPDATE trade_purchases SET status = 'cancelled', is_delivered = 0, delivery_status = 'cancelled', updated_at = @updatedAt WHERE business_id = @businessId AND id = @purchaseId`);
    },

    async updatePurchasePayment(businessId, purchaseId, paidAmount, paidAt) {
      const req = client.request();
      req.input("businessId", uid(), businessId);
      req.input("purchaseId", uid(), purchaseId);
      req.input("paidAmount", d14_2(), paidAmount);
      req.input("paidAt", nv(32), paidAt);
      req.input("updatedAt", nv(32), new Date().toISOString());
      await req.query(`UPDATE trade_purchases SET paid_amount = @paidAmount, paid_at = @paidAt, updated_at = @updatedAt WHERE business_id = @businessId AND id = @purchaseId`);
    },

    async insertLifecycleEvent(event) {
      const cols = Object.keys(event);
      const names = cols.map((c) => `[${c}]`).join(",");
      const placeholders = cols.map((c) => `@${c}`).join(",");
      const req = client.request();
      for (const [k, v] of Object.entries(event)) {
        const t = typeof v === "string" && v.length > 100 ? nv(-1) : (typeof v === "number" ? d14_2() : nv(255));
        req.input(k, t, v ?? null);
      }
      await req.query(`INSERT INTO purchase_lifecycle_events (${names}) VALUES (${placeholders})`);
    },

    async listLifecycleEventsByPurchase(purchaseId) {
      return queryMany<LifecycleEventRow>(client,
        `SELECT * FROM purchase_lifecycle_events WHERE purchase_id = @purchaseId ORDER BY created_at ASC`,
        [{ name: "purchaseId", type: uid(), value: purchaseId }],
      );
    },

    async findDuplicatePurchases(businessId, supplierId, windowStart, excludeId) {
      const params: SqlParam[] = [
        { name: "businessId", type: uid(), value: businessId },
        { name: "windowStart", type: nv(32), value: windowStart },
      ];
      let sqlText = `SELECT p.* FROM trade_purchases p WHERE p.business_id = @businessId AND p.created_at >= @windowStart AND p.status NOT IN ('deleted','cancelled')`;
      if (supplierId) { sqlText += ` AND p.supplier_id = @supplierId`; params.push({ name: "supplierId", type: uid(), value: supplierId }); }
      if (excludeId) { sqlText += ` AND p.id != @excludeId`; params.push({ name: "excludeId", type: uid(), value: excludeId }); }
      return queryMany<PurchaseRow>(client, sqlText, params);
    },

    async getPurchaseLinesForCheck(purchaseIds) {
      if (!purchaseIds.length) return [];
      const params: SqlParam[] = purchaseIds.map((id, i) => ({ name: `id${i}`, type: uid(), value: id }));
      const idPlaceholders = purchaseIds.map((_, i) => `@id${i}`).join(",");
      return queryMany<PurchaseLineRow>(client, `SELECT * FROM trade_purchase_lines WHERE trade_purchase_id IN (${idPlaceholders})`, params);
    },

    async getDeliveryPipeline(businessId) {
      return queryMany<{ delivery_status: string; cnt: number }>(client,
        `SELECT COALESCE(LOWER(delivery_status), 'pending') AS delivery_status, COUNT(*) AS cnt FROM trade_purchases WHERE business_id = @businessId AND status != 'deleted' GROUP BY LOWER(delivery_status)`,
        [{ name: "businessId", type: uid(), value: businessId }],
      );
    },

    async getDeliveryPendingAmount(businessId) {
      const row = await queryOne<{ total: number }>(client,
        `SELECT COALESCE(SUM(total_amount), 0) AS total FROM trade_purchases WHERE business_id = @businessId AND status NOT IN ('deleted','cancelled') AND COALESCE(LOWER(delivery_status), 'pending') NOT IN ('stock_committed','cancelled')`,
        [{ name: "businessId", type: uid(), value: businessId }],
      );
      return row?.total ?? 0;
    },

    async updatePurchaseFields(businessId, purchaseId, fields) {
      const cols = Object.keys(fields);
      if (!cols.length) return;
      const setClause = cols.map((c) => `[${c}] = @${c}`).join(",");
      const params: SqlParam[] = [
        { name: "businessId", type: uid(), value: businessId },
        { name: "purchaseId", type: uid(), value: purchaseId },
        ...cols.map((c) => ({ name: c, type: nv(255), value: fields[c] ?? null })),
      ];
      const req = client.request();
      for (const p of params) {
        req.input(p.name, p.type as never, p.value);
      }
      await req.query(`UPDATE trade_purchases SET ${setClause} WHERE business_id = @businessId AND id = @purchaseId`);
    },

    async updateLineVerification(lineId, receivedQty, damagedQty, returnQty) {
      const req = client.request();
      req.input("lineId", uid(), lineId);
      req.input("receivedQty", d14_2(), receivedQty);
      req.input("damagedQty", d14_2(), damagedQty);
      req.input("returnQty", d14_2(), returnQty);
      await req.query("UPDATE trade_purchase_lines SET received_qty = @receivedQty, damaged_qty = @damagedQty, return_qty = @returnQty WHERE id = @lineId");
    },
  };
}
