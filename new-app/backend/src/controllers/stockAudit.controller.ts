import type { Request, Response, NextFunction } from "express";
import type { StockAuditRepository } from "../repositories/stockAudit.repository";
import type { StockService } from "../services/stock.service";
import { sendDetail } from "../http/sendDetail";
import { randomUUID } from "node:crypto";

export function createStockAuditController(repo: StockAuditRepository, stockService: StockService) {
  const getAuditWithItems = async (businessId: string, auditId: string) => {
    const audit = await repo.getById(businessId, auditId);
    if (!audit) return null;
    const items = await repo.getItemsByAuditId(auditId);
    return { ...audit, items };
  };

  return {
    async getKpis(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const kpis = await repo.getKpis(businessId);
        res.json(kpis);
      } catch (e) { next(e); }
    },

    async list(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const page = Math.max(1, Number(req.query.page ?? 1));
        const perPage = Math.min(100, Math.max(1, Number(req.query.per_page ?? 30)));
        const status = req.query.status as string | undefined;
        const audits = await repo.list(businessId, { status, page, perPage });
        res.json(audits);
      } catch (e) { next(e); }
    },

    async create(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const userId = req.user!.id;
        const auditDate = (req.body as any)?.audit_date ?? new Date().toISOString().split("T")[0];
        const id = randomUUID();
        await repo.create(id, businessId, userId, auditDate);
        const audit = await getAuditWithItems(businessId, id);
        res.status(201).json(audit);
      } catch (e) { next(e); }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const auditId = req.params.auditId as string;
        const audit = await getAuditWithItems(businessId, auditId);
        if (!audit) { sendDetail(res, 404, "Audit not found"); return; }
        res.json(audit);
      } catch (e) { next(e); }
    },

    async update(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const auditId = req.params.auditId as string;
        const { notes, items } = req.body as { notes?: string; items?: Array<{ item_id: string; counted_qty: number; adjustment_type?: string; reason?: string; notes?: string }> };
        const audit = await repo.getById(businessId, auditId);
        if (!audit) { sendDetail(res, 404, "Audit not found"); return; }
        if (audit.status === "completed") { sendDetail(res, 400, "Completed audits cannot be modified"); return; }
        await repo.update(auditId, { notes: notes ?? null });
        if (items && Array.isArray(items)) {
          for (const item of items) {
            const itemId = item.item_id;
            const countedQty = item.counted_qty;
            const systemQty = await repo.getSystemQty(businessId, itemId);
            await repo.upsertLine(auditId, itemId, systemQty, countedQty, item.adjustment_type ?? null, item.reason ?? null, item.notes ?? null);
          }
        }
        const updated = await getAuditWithItems(businessId, auditId);
        res.json(updated);
      } catch (e) { next(e); }
    },

    async upsertLine(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const auditId = req.params.auditId as string;
        const { item_id, counted_qty, adjustment_type, reason, notes } = req.body as { item_id: string; counted_qty: number; adjustment_type?: string; reason?: string; notes?: string };
        if (!item_id || counted_qty === undefined) { sendDetail(res, 400, "item_id and counted_qty are required"); return; }
        const audit = await repo.getById(businessId, auditId);
        if (!audit) { sendDetail(res, 404, "Audit not found"); return; }
        if (audit.status !== "draft" && audit.status !== "pending_review") { sendDetail(res, 400, "Audit is not open for new lines"); return; }
        const systemQty = await repo.getSystemQty(businessId, item_id);
        await repo.upsertLine(auditId, item_id, systemQty, counted_qty, adjustment_type ?? null, reason ?? null, notes ?? null);
        const updated = await getAuditWithItems(businessId, auditId);
        res.json(updated);
      } catch (e) { next(e); }
    },

    async complete(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const auditId = req.params.auditId as string;
        const audit = await repo.getById(businessId, auditId);
        if (!audit) { sendDetail(res, 404, "Audit not found"); return; }
        if (audit.status === "completed") { sendDetail(res, 400, "Audit is already completed"); return; }
        const items = await repo.getItemsByAuditId(auditId);
        let pending = 0;
        for (const line of items) {
          if (line.line_status === "pending_approval") { pending++; }
        }
        const newStatus = pending > 0 ? "pending_review" : "completed";
        await repo.update(auditId, { status: newStatus });
        const updated = await getAuditWithItems(businessId, auditId);
        res.json(updated);
      } catch (e) { next(e); }
    },

    async approveLine(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const auditId = req.params.auditId as string;
        const lineId = req.params.lineId as string;
        const user = req.user!;
        const audit = await repo.getById(businessId, auditId);
        if (!audit) { sendDetail(res, 404, "Audit not found"); return; }
        const line = await repo.getLineById(lineId);
        if (!line) { sendDetail(res, 404, "Audit line not found"); return; }
        if (line.line_status !== "pending_approval") { sendDetail(res, 400, "Line is not pending approval"); return; }
        await stockService.patchStock({
          businessId,
          itemId: line.item_id,
          movementKind: "correction",
          deltaQty: line.difference_qty,
          mode: "delta",
          reason: `Audit ${auditId}: ${line.reason ?? "Stock correction"}`,
          notes: line.notes,
          sourceType: "stock_audit",
          sourceId: auditId,
          idempotencyKey: `audit-${lineId}`,
          actorId: user.id,
          actorName: user.name ?? null,
          adjustmentType: "correction",
        });
        await repo.updateLineStatus(lineId, "applied");
        const allItems = await repo.getItemsByAuditId(auditId);
        const pendingLines = allItems.filter(i => i.line_status === "pending_approval").length;
        if (pendingLines === 0 && audit.status === "pending_review") {
          await repo.update(auditId, { status: "completed" });
        }
        const updated = await getAuditWithItems(businessId, auditId);
        res.json(updated);
      } catch (e) { next(e); }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const auditId = req.params.auditId as string;
        const audit = await repo.getById(businessId, auditId);
        if (!audit) { sendDetail(res, 404, "Audit not found"); return; }
        if (audit.status === "completed" || audit.status === "pending_review") {
          sendDetail(res, 400, "Only draft audits can be deleted");
          return;
        }
        await repo.delete(auditId, businessId);
        res.status(204).end();
      } catch (e) { next(e); }
    },

    async getPendingLines(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.query.item_id as string;
        if (!itemId) { sendDetail(res, 400, "item_id query param is required"); return; }
        const lines = await repo.getPendingLines(businessId, itemId);
        res.json(lines);
      } catch (e) { next(e); }
    },
  };
}

export type StockAuditController = ReturnType<typeof createStockAuditController>;
