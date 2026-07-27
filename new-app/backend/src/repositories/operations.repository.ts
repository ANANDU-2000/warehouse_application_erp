import { randomUUID } from "node:crypto";
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";

type CountRow = { c: number };

type ChecklistTemplateRow = {
  id: string;
  slot: string;
  task_key: string;
  label: string;
  sort_order: number;
};

type ChecklistCompletionRow = {
  id: string;
  slot: string;
  task_key: string;
  completed_at: Date;
  notes: string | null;
};

type UsageLogRow = {
  id: string;
  item_id: string;
  usage_date: string;
  opening_qty: number | null;
  purchased_qty: number | null;
  used_qty: number | null;
  closing_qty: number | null;
  notes: string | null;
};

type ItemRow = {
  id: string;
  name: string;
  item_code: string | null;
  current_stock: number | null;
  stock_unit: string | null;
  default_unit: string | null;
  category_id: string | null;
};

type CategoryRow = { id: string; name: string };

type ItemUsageRow = { item_id: string; used_qty: number | null };
type AdjustmentDateRow = { item_id: string; updated_at: Date | null };

export class OperationsRepository {
  constructor(private readonly client: SqlClient) {}

  async ensureTemplates(businessId: string): Promise<ChecklistTemplateRow[]> {
    const count = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT([id]) AS c FROM staff_checklist_templates WHERE [business_id] = @businessId`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    if (Number(count?.c ?? 0) === 0) {
      const defaults = [
        { slot: "morning", task_key: "open_shop", label: "Open shop / unlock premises", sort_order: 1 },
        { slot: "morning", task_key: "check_stock", label: "Check morning stock levels", sort_order: 2 },
        { slot: "midday", task_key: "mid_stock_check", label: "Midday stock check", sort_order: 1 },
        { slot: "midday", task_key: "clean_area", label: "Clean work area", sort_order: 2 },
        { slot: "evening", task_key: "close_shop", label: "Close shop / lock premises", sort_order: 1 },
        { slot: "evening", task_key: "evening_stock", label: "Evening stock reconciliation", sort_order: 2 },
      ];
      for (const t of defaults) {
        await queryOne(
          this.client,
          `INSERT INTO staff_checklist_templates ([id], [business_id], [slot], [task_key], [label], [sort_order])
           VALUES (@id, @businessId, @slot, @taskKey, @label, @sortOrder)`,
          [
            { name: "id", type: sql.UniqueIdentifier, value: randomUUID() },
            { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
            { name: "slot", type: sql.NVarChar(16), value: t.slot },
            { name: "taskKey", type: sql.NVarChar(64), value: t.task_key },
            { name: "label", type: sql.NVarChar(255), value: t.label },
            { name: "sortOrder", type: sql.Int, value: t.sort_order },
          ],
        );
      }
    }
    return queryMany<ChecklistTemplateRow>(
      this.client,
      `SELECT [id], [slot], [task_key], [label], [sort_order]
       FROM staff_checklist_templates
       WHERE [business_id] = @businessId
       ORDER BY [slot], [sort_order]`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
  }

  async getCompletionsForDate(
    businessId: string,
    userId: string,
    dateStr: string,
  ): Promise<ChecklistCompletionRow[]> {
    return queryMany<ChecklistCompletionRow>(
      this.client,
      `SELECT [id], [slot], [task_key], [completed_at], [notes]
       FROM staff_checklist_completions
       WHERE [business_id] = @businessId
         AND [user_id] = @userId
         AND [checklist_date] = @dateStr`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
        { name: "dateStr", type: sql.Date, value: dateStr },
      ],
    );
  }

  async upsertCompletion(
    businessId: string,
    userId: string,
    dateStr: string,
    slot: string,
    taskKey: string,
    notes: string | null,
  ): Promise<boolean> {
    const existing = await queryOne<{ id: string }>(
      this.client,
      `SELECT [id] FROM staff_checklist_completions
       WHERE [business_id] = @businessId
         AND [user_id] = @userId
         AND [checklist_date] = @dateStr
         AND [slot] = @slot
         AND [task_key] = @taskKey`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
        { name: "dateStr", type: sql.Date, value: dateStr },
        { name: "slot", type: sql.NVarChar(16), value: slot },
        { name: "taskKey", type: sql.NVarChar(64), value: taskKey },
      ],
    );
    if (existing) return false;
    const id = randomUUID();
    await queryOne(
      this.client,
      `INSERT INTO staff_checklist_completions ([id], [business_id], [user_id], [checklist_date], [slot], [task_key], [completed_at], [notes])
       VALUES (@id, @businessId, @userId, @dateStr, @slot, @taskKey, SYSUTCDATETIME(), @notes)`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: id },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
        { name: "dateStr", type: sql.Date, value: dateStr },
        { name: "slot", type: sql.NVarChar(16), value: slot },
        { name: "taskKey", type: sql.NVarChar(64), value: taskKey },
        { name: "notes", type: sql.NVarChar(sql.MAX), value: notes ?? null },
      ],
    );
    return true;
  }

  async getActiveItems(businessId: string): Promise<ItemRow[]> {
    return queryMany<ItemRow>(
      this.client,
      `SELECT [id], [name], [item_code], [current_stock],
              [stock_unit], [default_unit], [category_id]
       FROM catalog_items
       WHERE [business_id] = @businessId
         AND [deleted_at] IS NULL
         AND [current_stock] IS NOT NULL
         AND [current_stock] > 0
       ORDER BY [name]`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
  }

  async getAllItems(businessId: string): Promise<ItemRow[]> {
    return queryMany<ItemRow>(
      this.client,
      `SELECT [id], [name], [item_code], [current_stock],
              [stock_unit], [default_unit], [category_id]
       FROM catalog_items
       WHERE [business_id] = @businessId
         AND [deleted_at] IS NULL
       ORDER BY [name]`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
  }

  async getCategories(businessId: string): Promise<Map<string, string>> {
    const rows = await queryMany<CategoryRow>(
      this.client,
      `SELECT [id], [name] FROM item_categories WHERE [business_id] = @businessId`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    const m = new Map<string, string>();
    for (const r of rows) m.set(r.id, r.name);
    return m;
  }

  async getPurchasedQtyMap(
    businessId: string,
    dateStr: string,
    itemIds: string[],
  ): Promise<Map<string, number>> {
    const m = new Map<string, number>();
    if (itemIds.length === 0) return m;
    const rows = await queryMany<{ catalog_item_id: string; qty: number | null }>(
      this.client,
      `SELECT tpl.[catalog_item_id],
              CAST(COALESCE(SUM(
                COALESCE(tpl.[qty_in_stock_unit], tpl.[qty], 0)
              ), 0) AS FLOAT) AS qty
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND CAST(tp.[purchase_date] AS date) = @dateStr
         AND tp.[status] NOT IN (N'cancelled', N'deleted')
         AND tp.[is_delivered] = 1
         AND tpl.[catalog_item_id] IN (${itemIds.map((_, i) => `@id${i}`).join(",")})
       GROUP BY tpl.[catalog_item_id]`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateStr", type: sql.Date, value: dateStr },
        ...itemIds.map((id, i) => ({ name: `id${i}`, type: sql.UniqueIdentifier, value: id })),
      ],
    );
    for (const r of rows) m.set(r.catalog_item_id, Number(r.qty ?? 0));
    return m;
  }

  async getUsageLogsForDate(
    businessId: string,
    dateStr: string,
    itemIds?: string[],
  ): Promise<UsageLogRow[]> {
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      { name: "dateStr", type: sql.Date, value: dateStr },
    ];
    let idFilter = "";
    if (itemIds && itemIds.length > 0) {
      idFilter = ` AND [item_id] IN (${itemIds.map((_, i) => `@id${i}`).join(",")})`;
      params.push(...itemIds.map((id, i) => ({ name: `id${i}`, type: sql.UniqueIdentifier, value: id })));
    }
    return queryMany<UsageLogRow>(
      this.client,
      `SELECT [id], [item_id], [usage_date], [opening_qty], [purchased_qty],
              [used_qty], [closing_qty], [notes]
       FROM daily_usage_logs
       WHERE [business_id] = @businessId
         AND [usage_date] = @dateStr${idFilter}`,
      params,
    );
  }

  async upsertUsageLog(
    businessId: string,
    itemId: string,
    dateStr: string,
    openingQty: number,
    purchasedQty: number,
    usedQty: number,
    closingQty: number,
    notes: string | null,
    userId: string | null,
  ): Promise<string> {
    const existing = await queryOne<{ id: string }>(
      this.client,
      `SELECT [id] FROM daily_usage_logs
       WHERE [business_id] = @businessId AND [item_id] = @itemId AND [usage_date] = @dateStr`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "dateStr", type: sql.Date, value: dateStr },
      ],
    );
    if (existing) {
      await this.client.request()
        .input("id", sql.UniqueIdentifier, existing.id)
        .input("usedQty", sql.Decimal(12, 3), usedQty)
        .input("closingQty", sql.Decimal(12, 3), closingQty)
        .input("openingQty", sql.Decimal(12, 3), openingQty)
        .input("purchasedQty", sql.Decimal(12, 3), purchasedQty)
        .input("notes", sql.NVarChar(sql.MAX), notes ?? null)
        .query(
          `UPDATE daily_usage_logs
           SET [used_qty] = @usedQty, [closing_qty] = @closingQty,
               [opening_qty] = @openingQty, [purchased_qty] = @purchasedQty,
               [notes] = @notes
           WHERE [id] = @id`,
        );
      return existing.id;
    }
    const id = randomUUID();
    await queryOne(
      this.client,
      `INSERT INTO daily_usage_logs ([id], [business_id], [item_id], [usage_date],
         [opening_qty], [purchased_qty], [used_qty], [closing_qty],
         [logged_by_user_id], [notes], [created_at])
       VALUES (@id, @businessId, @itemId, @dateStr,
         @openingQty, @purchasedQty, @usedQty, @closingQty,
         @userId, @notes, SYSUTCDATETIME())`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: id },
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "itemId", type: sql.UniqueIdentifier, value: itemId },
        { name: "dateStr", type: sql.Date, value: dateStr },
        { name: "openingQty", type: sql.Decimal(12, 3), value: openingQty },
        { name: "purchasedQty", type: sql.Decimal(12, 3), value: purchasedQty },
        { name: "usedQty", type: sql.Decimal(12, 3), value: usedQty },
        { name: "closingQty", type: sql.Decimal(12, 3), value: closingQty },
        { name: "userId", type: sql.UniqueIdentifier, value: userId ?? null },
        { name: "notes", type: sql.NVarChar(sql.MAX), value: notes ?? null },
      ],
    );
    return id;
  }

  async replaceTemplates(
    businessId: string,
    tasks: Array<{ slot: string; task_key: string | null; label: string; sort_order: number }>,
  ): Promise<ChecklistTemplateRow[]> {
    await this.client.request()
      .input("businessId", sql.UniqueIdentifier, businessId)
      .query(`DELETE FROM staff_checklist_templates WHERE [business_id] = @businessId`);

    const dedup = new Map<string, number>();
    for (const t of tasks) {
      let key = t.task_key;
      if (!key || key.trim().length === 0) {
        key = t.label.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 60);
      }
      const dedupKey = `${t.slot}:${key}`;
      const count = (dedup.get(dedupKey) ?? 0) + 1;
      dedup.set(dedupKey, count);
      if (count > 1) key = `${key}_${count}`;
      const id = randomUUID();
      await queryOne(
        this.client,
        `INSERT INTO staff_checklist_templates ([id], [business_id], [slot], [task_key], [label], [sort_order])
         VALUES (@id, @businessId, @slot, @taskKey, @label, @sortOrder)`,
        [
          { name: "id", type: sql.UniqueIdentifier, value: id },
          { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
          { name: "slot", type: sql.NVarChar(16), value: t.slot },
          { name: "taskKey", type: sql.NVarChar(64), value: key },
          { name: "label", type: sql.NVarChar(255), value: t.label },
          { name: "sortOrder", type: sql.Int, value: t.sort_order },
        ],
      );
    }
    return this.ensureTemplates(businessId);
  }

  async getCompletionSummary(businessId: string, dateStr: string): Promise<{ completed: number; total: number }> {
    const templates = await this.ensureTemplates(businessId);
    const total = templates.length;
    const row = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(DISTINCT [task_key]) AS c
       FROM staff_checklist_completions
       WHERE [business_id] = @businessId AND [checklist_date] = @dateStr`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateStr", type: sql.Date, value: dateStr },
      ],
    );
    return { completed: Number(row?.c ?? 0), total };
  }

  async getUsageSummary(businessId: string, dateStr: string): Promise<{ items_logged: number; total_used_qty: number; active_items: number }> {
    const summaryRow = await queryOne<{ cnt: number | null; sum_qty: number | null }>(
      this.client,
      `SELECT COUNT([id]) AS cnt, COALESCE(SUM([used_qty]), 0) AS sum_qty
       FROM daily_usage_logs
       WHERE [business_id] = @businessId AND [usage_date] = @dateStr`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateStr", type: sql.Date, value: dateStr },
      ],
    );
    const activeRow = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT([id]) AS c FROM catalog_items
       WHERE [business_id] = @businessId AND [deleted_at] IS NULL AND [current_stock] > 0`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    const itemsLogged = Number(summaryRow?.cnt ?? 0);
    return {
      items_logged: itemsLogged,
      total_used_qty: Number(summaryRow?.sum_qty ?? 0),
      active_items: Number(activeRow?.c ?? 0),
    };
  }

  async getSnapshots(
    businessId: string,
    dateFrom: string,
    dateTo: string,
    itemId?: string,
    limit: number = 500,
  ): Promise<UsageLogRow[]> {
    const where = ["d.[business_id] = @businessId", "d.[usage_date] >= @dateFrom", "d.[usage_date] <= @dateTo"];
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      { name: "dateFrom", type: sql.Date, value: dateFrom },
      { name: "dateTo", type: sql.Date, value: dateTo },
    ];
    if (itemId) {
      where.push("d.[item_id] = @itemId");
      params.push({ name: "itemId", type: sql.UniqueIdentifier, value: itemId });
    }
    const lim = Math.min(500, Math.max(1, limit));
    return queryMany<UsageLogRow>(
      this.client,
      `SELECT d.[id], d.[item_id], d.[usage_date], d.[opening_qty], d.[purchased_qty],
              d.[used_qty], d.[closing_qty], d.[notes]
       FROM daily_usage_logs d
       WHERE ${where.join(" AND ")}
       ORDER BY d.[usage_date] DESC, d.[item_id]
       OFFSET 0 ROWS FETCH NEXT @lim ROWS ONLY`,
      [...params, { name: "lim", type: sql.Int, value: lim }],
    );
  }

  async getUsage7d(businessId: string, itemIds: string[]): Promise<Map<string, number>> {
    const m = new Map<string, number>();
    if (itemIds.length === 0) return m;
    const since7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const rows = await queryMany<ItemUsageRow>(
      this.client,
      `SELECT [item_id], COALESCE(SUM([used_qty]), 0) AS used_qty
       FROM daily_usage_logs
       WHERE [business_id] = @businessId AND [usage_date] >= @since7
         AND [item_id] IN (${itemIds.map((_, i) => `@id${i}`).join(",")})
       GROUP BY [item_id]`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "since7", type: sql.Date, value: since7 },
        ...itemIds.map((id, i) => ({ name: `id${i}`, type: sql.UniqueIdentifier, value: id })),
      ],
    );
    for (const r of rows) m.set(r.item_id, Number(r.used_qty ?? 0));
    return m;
  }

  async getUsage30d(businessId: string, itemIds: string[]): Promise<Map<string, number>> {
    const m = new Map<string, number>();
    if (itemIds.length === 0) return m;
    const since30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const rows = await queryMany<ItemUsageRow>(
      this.client,
      `SELECT [item_id], COALESCE(SUM([used_qty]), 0) AS used_qty
       FROM daily_usage_logs
       WHERE [business_id] = @businessId AND [usage_date] >= @since30
         AND [item_id] IN (${itemIds.map((_, i) => `@id${i}`).join(",")})
       GROUP BY [item_id]`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "since30", type: sql.Date, value: since30 },
        ...itemIds.map((id, i) => ({ name: `id${i}`, type: sql.UniqueIdentifier, value: id })),
      ],
    );
    for (const r of rows) m.set(r.item_id, Number(r.used_qty ?? 0));
    return m;
  }

  async getLastAdjustmentDates(businessId: string, itemIds: string[]): Promise<Map<string, string | null>> {
    const m = new Map<string, string | null>();
    if (itemIds.length === 0) return m;
    const rows = await queryMany<AdjustmentDateRow>(
      this.client,
      `SELECT [item_id], MAX([updated_at]) AS updated_at
       FROM stock_adjustment_log
       WHERE [business_id] = @businessId
         AND [item_id] IN (${itemIds.map((_, i) => `@id${i}`).join(",")})
       GROUP BY [item_id]`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ...itemIds.map((id, i) => ({ name: `id${i}`, type: sql.UniqueIdentifier, value: id })),
      ],
    );
    for (const r of rows) {
      m.set(r.item_id, r.updated_at ? (r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at)) : null);
    }
    return m;
  }

  async getLastPurchaseDates(businessId: string, itemIds: string[]): Promise<Map<string, Date | null>> {
    const m = new Map<string, Date | null>();
    if (itemIds.length === 0) return m;
    const rows = await queryMany<{ catalog_item_id: string; purchase_date: Date | null }>(
      this.client,
      `SELECT tpl.[catalog_item_id], MAX(tp.[purchase_date]) AS purchase_date
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[status] NOT IN (N'cancelled', N'deleted')
         AND tpl.[catalog_item_id] IN (${itemIds.map((_, i) => `@id${i}`).join(",")})
       GROUP BY tpl.[catalog_item_id]`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        ...itemIds.map((id, i) => ({ name: `id${i}`, type: sql.UniqueIdentifier, value: id })),
      ],
    );
    for (const r of rows) m.set(r.catalog_item_id, r.purchase_date);
    return m;
  }

  async getSupplierFrequency(businessId: string): Promise<Array<{ supplier_id: string | null; purchase_count: number }>> {
    const now = new Date();
    const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    return queryMany<any>(
      this.client,
      `SELECT [supplier_id], COUNT(*) AS purchase_count
       FROM trade_purchases
       WHERE [business_id] = @businessId
         AND [status] <> N'cancelled'
         AND [purchase_date] >= @firstOfMonth
       GROUP BY [supplier_id]
       ORDER BY COUNT(*) DESC
       OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "firstOfMonth", type: sql.Date, value: firstOfMonth },
      ],
    );
  }
}

export function createOperationsRepository(client: SqlClient): OperationsRepository {
  return new OperationsRepository(client);
}
