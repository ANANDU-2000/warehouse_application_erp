import type { Request, Response, NextFunction } from "express";
import type { OperationsRepository } from "../repositories/operations.repository";
import { sendDetail } from "../http/sendDetail";

interface AuthRequest extends Request {
  userId?: string;
  businessId?: string;
}

export class OperationsController {
  constructor(private readonly repo: OperationsRepository) {}

  getTemplates = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const templates = await this.repo.ensureTemplates(req.businessId!);
    const completions = await this.repo.getCompletionsForDate(
      req.businessId!,
      req.userId!,
      (req.query.date as string) ?? new Date().toISOString().slice(0, 10),
    );
    res.json({ templates, completions });
  };

  completeTask = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { slot, task_key } = req.body as { slot?: string; task_key?: string; notes?: string };
    if (!slot || !task_key) {
      sendDetail(res, 400, "slot and task_key are required");
      return;
    }
    const dateStr = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const created = await this.repo.upsertCompletion(
      req.businessId!,
      req.userId!,
      dateStr,
      slot,
      task_key,
      (req.body as any).notes ?? null,
    );
    res.status(created ? 201 : 200).json({
      message: created ? "Task completed" : "Already completed",
    });
  };

  replaceTemplates = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { tasks } = req.body as { tasks: Array<{ slot: string; task_key?: string; label: string; sort_order: number }> };
    if (!Array.isArray(tasks) || tasks.length === 0) {
      sendDetail(res, 400, "tasks array is required");
      return;
    }
    const templates = await this.repo.replaceTemplates(
      req.businessId!,
      tasks.map(t => ({ ...t, task_key: t.task_key ?? null })),
    );
    res.json(templates);
  };

  getUsageLogs = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const dateStr = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const items = await this.repo.getActiveItems(req.businessId!);
    const categories = await this.repo.getCategories(req.businessId!);

    const itemIds = items.map(i => i.id);
    const existingLogs = await this.repo.getUsageLogsForDate(req.businessId!, dateStr, itemIds);
    const purchasedQtyMap = await this.repo.getPurchasedQtyMap(req.businessId!, dateStr, itemIds);

    const logMap = new Map(existingLogs.map(l => [l.item_id, l]));

    const logs = items.map(item => {
      const existing = logMap.get(item.id);
      const purchasedQty = Number(purchasedQtyMap.get(item.id) ?? 0);
      return {
        item_id: item.id,
        item_name: item.name,
        item_code: item.item_code,
        category: categories.get(item.category_id ?? "") ?? null,
        stock_unit: item.stock_unit ?? item.default_unit,
        id: existing?.id ?? null,
        opening_qty: existing?.opening_qty ?? 0,
        purchased_qty: purchasedQty,
        used_qty: existing?.used_qty ?? 0,
        closing_qty: existing?.closing_qty ?? 0,
        notes: existing?.notes ?? null,
      };
    });

    const summary = await this.repo.getUsageSummary(req.businessId!, dateStr);

    res.json({ logs, summary });
  };

  saveUsageLogs = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const dateStr = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const entries = req.body as Array<{
      item_id: string;
      opening_qty: number;
      used_qty: number;
      closing_qty: number;
      notes?: string | null;
    }>;
    if (!Array.isArray(entries) || entries.length === 0) {
      sendDetail(res, 400, "entries array is required");
      return;
    }
    for (const e of entries) {
      const purchasedQty = await this.repo.getPurchasedQtyMap(req.businessId!, dateStr, [e.item_id]);
      await this.repo.upsertUsageLog(
        req.businessId!,
        e.item_id,
        dateStr,
        e.opening_qty,
        Number(purchasedQty.get(e.item_id) ?? 0),
        e.used_qty,
        e.closing_qty,
        e.notes ?? null,
        req.userId!,
      );
    }
    res.status(201).json({ message: "Usage logs saved" });
  };

  getSnapshots = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { date_from, date_to, item_id, limit } = req.query as Record<string, string>;
    const dateTo = date_to ?? new Date().toISOString().slice(0, 10);
    const dateFrom = date_from ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const snaps = await this.repo.getSnapshots(req.businessId!, dateFrom, dateTo, item_id, limit ? Number(limit) : undefined);
    res.json({ snapshots: snaps });
  };

  getSummary = async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const dateStr = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const [usageSummary, checklistSummary, supplierFreq] = await Promise.all([
      this.repo.getUsageSummary(req.businessId!, dateStr),
      this.repo.getCompletionSummary(req.businessId!, dateStr),
      this.repo.getSupplierFrequency(req.businessId!),
    ]);
    const activeItems = await this.repo.getActiveItems(req.businessId!);
    const itemIds = activeItems.map(i => i.id);
    const [usage7dMap, usage30dMap, lastAdj, lastPurch] = await Promise.all([
      this.repo.getUsage7d(req.businessId!, itemIds),
      this.repo.getUsage30d(req.businessId!, itemIds),
      this.repo.getLastAdjustmentDates(req.businessId!, itemIds),
      this.repo.getLastPurchaseDates(req.businessId!, itemIds),
    ]);
    const categories = await this.repo.getCategories(req.businessId!);

    const items = activeItems.map(item => ({
      id: item.id,
      name: item.name,
      item_code: item.item_code,
      current_stock: Number(item.current_stock ?? 0),
      stock_unit: item.stock_unit ?? item.default_unit,
      category: categories.get(item.category_id ?? "") ?? null,
      used_7d: Number(usage7dMap.get(item.id) ?? 0),
      used_30d: Number(usage30dMap.get(item.id) ?? 0),
      last_adjustment: lastAdj.get(item.id) ?? null,
      last_purchase_date: lastPurch.get(item.id) ?? null,
    }));

    res.json({
      date: dateStr,
      checklist: checklistSummary,
      usage: usageSummary,
      supplier_frequency: supplierFreq,
      items,
    });
  };
}
