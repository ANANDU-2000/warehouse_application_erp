import { randomUUID } from "node:crypto";
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";

export type StockAuditRow = {
  id: string;
  audit_date: string;
  auditor_id: string | null;
  business_id: string;
  status: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export type StockAuditItemRow = {
  id: string;
  audit_id: string;
  item_id: string;
  system_qty: number;
  counted_qty: number;
  difference_qty: number;
  line_status: string;
  adjustment_type: string | null;
  reason: string | null;
  notes: string | null;
};

export type StockAuditKpis = {
  items_audited_today: number;
  mismatch_lines_today: number;
  pending_approval_count: number;
  open_draft_sessions: number;
};

export class StockAuditRepository {
  constructor(private readonly client: SqlClient) {}

  async getKpis(businessId: string): Promise<StockAuditKpis> {
    const today = new Date().toISOString().split("T")[0];
    const itemsToday = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT(DISTINCT sai.[item_id]) AS c
       FROM stock_audit_items sai
       INNER JOIN stock_audits sa ON sa.[id] = sai.[audit_id]
       WHERE sa.[business_id] = @businessId AND CAST(sa.[audit_date] AS DATE) = @today`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "today", type: sql.Date, value: today },
      ],
    );
    const mismatchToday = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT(DISTINCT sai.[item_id]) AS c
       FROM stock_audit_items sai
       INNER JOIN stock_audits sa ON sa.[id] = sai.[audit_id]
       WHERE sa.[business_id] = @businessId AND CAST(sa.[audit_date] AS DATE) = @today
         AND sai.[difference_qty] <> 0`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "today", type: sql.Date, value: today },
      ],
    );
    const pendingApproval = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT(DISTINCT sai.[id]) AS c
       FROM stock_audit_items sai
       INNER JOIN stock_audits sa ON sa.[id] = sai.[audit_id]
       WHERE sa.[business_id] = @businessId AND sai.[line_status] = N'pending_approval'`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    const drafts = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c FROM stock_audits
       WHERE [business_id] = @businessId AND [status] = N'draft'`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    return {
      items_audited_today: Number(itemsToday?.c ?? 0),
      mismatch_lines_today: Number(mismatchToday?.c ?? 0),
      pending_approval_count: Number(pendingApproval?.c ?? 0),
      open_draft_sessions: Number(drafts?.c ?? 0),
    };
  }

  async list(businessId: string, opts: { status?: string; page: number; perPage: number }): Promise<StockAuditRow[]> {
    const where = ["[business_id] = @businessId"];
    const params: SqlParam[] = [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }];
    if (opts.status) {
      where.push("[status] = @status");
      params.push({ name: "status", type: sql.NVarChar(32), value: opts.status });
    }
    const offset = (opts.page - 1) * opts.perPage;
    return queryMany<StockAuditRow>(
      this.client,
      `SELECT * FROM stock_audits WHERE ${where.join(" AND ")}
       ORDER BY [created_at] DESC
       OFFSET @offset ROWS FETCH NEXT @perPage ROWS ONLY`,
      [
        ...params,
        { name: "offset", type: sql.Int, value: offset },
        { name: "perPage", type: sql.Int, value: opts.perPage },
      ],
    );
  }

  async getById(businessId: string, auditId: string): Promise<StockAuditRow | null> {
    return queryOne<StockAuditRow>(
      this.client,
      `SELECT * FROM stock_audits WHERE [id] = @auditId AND [business_id] = @businessId`,
      [
        { name: "auditId", type: sql.UniqueIdentifier, value: auditId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
  }

  async getItemsByAuditId(auditId: string): Promise<StockAuditItemRow[]> {
    return queryMany<StockAuditItemRow>(
      this.client,
      `SELECT * FROM stock_audit_items WHERE [audit_id] = @auditId ORDER BY [id]`,
      [{ name: "auditId", type: sql.UniqueIdentifier, value: auditId }],
    );
  }

  async create(auditId: string, businessId: string, auditorId: string | null, auditDate: string): Promise<void> {
    await queryOne(
      this.client,
      `INSERT INTO stock_audits ([id], [audit_date], [auditor_id], [business_id], [status], [created_at], [updated_at])
       VALUES (@id, @auditDate, @auditorId, @businessId, N'draft', SYSUTCDATETIME(), SYSUTCDATETIME())`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: auditId },
        { name: "auditDate", type: sql.Date, value: auditDate },
        { name: "auditorId", type: sql.UniqueIdentifier, value: auditorId ?? null },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
  }

  async update(auditId: string, fields: { notes?: string | null; status?: string }): Promise<void> {
    const sets: string[] = ["[updated_at] = SYSUTCDATETIME()"];
    const params: SqlParam[] = [{ name: "id", type: sql.UniqueIdentifier, value: auditId }];
    if (fields.notes !== undefined) {
      sets.push("[notes] = @notes");
      params.push({ name: "notes", type: sql.NVarChar(sql.MAX), value: fields.notes ?? null });
    }
    if (fields.status) {
      sets.push("[status] = @status");
      params.push({ name: "status", type: sql.NVarChar(32), value: fields.status });
    }
    const request = this.client.request();
    for (const p of params) {
      request.input(p.name, p.type as import("mssql").ISqlType, p.value);
    }
    await request.query(
      `UPDATE stock_audits SET ${sets.join(", ")} WHERE [id] = @id`,
    );
  }

  async delete(auditId: string, businessId: string): Promise<boolean> {
    const result = await this.client.request()
      .input("id", sql.UniqueIdentifier, auditId)
      .input("businessId", sql.UniqueIdentifier, businessId)
      .query(`DELETE FROM stock_audits WHERE [id] = @id AND [business_id] = @businessId`);
    return (result.rowsAffected?.[0] ?? 0) > 0;
  }

  async getSystemQty(businessId: string, itemId: string): Promise<number> {
    const row = await queryOne<{ qty: number }>(
      this.client,
      `SELECT CAST(ISNULL([current_stock], 0) AS FLOAT) AS qty FROM catalog_items
       WHERE [id] = @itemId AND [business_id] = @businessId AND [deleted_at] IS NULL`,
      [
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      ],
    );
    return Number(row?.qty ?? 0);
  }

  async upsertLine(auditId: string, itemId: string, systemQty: number, countedQty: number, adjustmentType: string | null, reason: string | null, notes: string | null): Promise<StockAuditItemRow> {
    const diff = countedQty - systemQty;
    const lineStatus = diff === 0 ? "matched" : "pending_approval";
    const existing = await queryOne<StockAuditItemRow>(
      this.client,
      `SELECT * FROM stock_audit_items WHERE [audit_id] = @auditId AND [item_id] = @itemId`,
      [
        { name: "auditId", type: sql.UniqueIdentifier, value: auditId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
      ],
    );
    if (existing) {
      await this.client.request()
        .input("id", sql.UniqueIdentifier, existing.id)
        .input("systemQty", sql.Decimal(10, 2), systemQty)
        .input("countedQty", sql.Decimal(10, 2), countedQty)
        .input("diff", sql.Decimal(10, 2), diff)
        .input("lineStatus", sql.NVarChar(32), lineStatus)
        .input("adjType", sql.NVarChar(32), adjustmentType ?? null)
        .input("reason", sql.NVarChar(sql.MAX), reason ?? null)
        .input("notes", sql.NVarChar(sql.MAX), notes ?? null)
        .query(
          `UPDATE stock_audit_items
           SET [system_qty] = @systemQty, [counted_qty] = @countedQty,
               [difference_qty] = @diff, [line_status] = @lineStatus,
               [adjustment_type] = @adjType, [reason] = @reason, [notes] = @notes
           WHERE [id] = @id`,
        );
      const updated = await this.getLineById(existing.id);
      return updated!;
    }
    const id = randomUUID();
    await queryOne(
      this.client,
      `INSERT INTO stock_audit_items ([id], [audit_id], [item_id], [system_qty], [counted_qty], [difference_qty], [line_status], [adjustment_type], [reason], [notes])
       VALUES (@id, @auditId, @itemId, @systemQty, @countedQty, @diff, @lineStatus, @adjType, @reason, @notes)`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: id },
        { name: "auditId", type: sql.UniqueIdentifier, value: auditId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "systemQty", type: sql.Decimal(10, 2), value: systemQty },
        { name: "countedQty", type: sql.Decimal(10, 2), value: countedQty },
        { name: "diff", type: sql.Decimal(10, 2), value: diff },
        { name: "lineStatus", type: sql.NVarChar(32), value: lineStatus },
        { name: "adjType", type: sql.NVarChar(32), value: adjustmentType ?? null },
        { name: "reason", type: sql.NVarChar(sql.MAX), value: reason ?? null },
        { name: "notes", type: sql.NVarChar(sql.MAX), value: notes ?? null },
      ],
    );
    const inserted = await this.getLineById(id);
    return inserted!;
  }

  async getLineById(lineId: string): Promise<StockAuditItemRow | null> {
    return queryOne<StockAuditItemRow>(
      this.client,
      `SELECT * FROM stock_audit_items WHERE [id] = @lineId`,
      [{ name: "lineId", type: sql.UniqueIdentifier, value: lineId }],
    );
  }

  async updateLineStatus(lineId: string, lineStatus: string): Promise<void> {
    await this.client.request()
      .input("id", sql.UniqueIdentifier, lineId)
      .input("lineStatus", sql.NVarChar(32), lineStatus)
      .query(`UPDATE stock_audit_items SET [line_status] = @lineStatus WHERE [id] = @id`);
  }

  async getPendingLines(businessId: string, itemId: string): Promise<Array<StockAuditItemRow & { audit_date: Date }>> {
    return queryMany<any>(
      this.client,
      `SELECT sai.*, sa.[audit_date]
       FROM stock_audit_items sai
       INNER JOIN stock_audits sa ON sa.[id] = sai.[audit_id]
       WHERE sa.[business_id] = @businessId
         AND sai.[item_id] = @itemId
         AND sai.[line_status] = N'pending_approval'
       ORDER BY sa.[created_at] DESC, sai.[id] DESC`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
      ],
    );
  }
}

export function createStockAuditRepository(client: SqlClient): StockAuditRepository {
  return new StockAuditRepository(client);
}
