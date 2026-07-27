import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { HomeOverviewRepository } from "../repositories/homeOverview.repository";
import type { ReportsRepository } from "../repositories/reports.repository";
import {
  buildHomeOverview,
  computeTradeDashboardSnapshot,
} from "../services/homeOverview.service";

export type ReportsControllerDeps = {
  homeOverview: HomeOverviewRepository;
  reportsRepo: ReportsRepository;
};

function parseDateParam(
  value: unknown,
  name: string,
): { ok: true; value: string } | { ok: false; detail: string } {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, detail: `${name} must be YYYY-MM-DD` };
  }
  return { ok: true, value };
}

function bizId(req: Request): string | null {
  const v = req.params.businessId;
  return typeof v === "string" && v.length > 0 ? v : null;
}

function parseNum(raw: unknown, def: number, min: number, max: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
}

export function createReportsController(deps: ReportsControllerDeps) {
  const repo = deps.reportsRepo;

  return {
    async tradeDashboardSnapshot(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        if (fromP.value > toP.value) { sendDetail(res, 422, "from_must_not_exceed_to"); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const out = await computeTradeDashboardSnapshot(
          deps.homeOverview, id, fromP.value, toP.value,
        );
        res.json(out);
      } catch (e) { next(e); }
    },

    async homeOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        if (fromP.value > toP.value) { sendDetail(res, 422, "from_must_not_exceed_to"); return; }
        const maxSpan = typeof req.query.max_span_days === "string" ? Number(req.query.max_span_days) : undefined;
        if (maxSpan !== undefined && Number.isFinite(maxSpan)) {
          const fromD = new Date(fromP.value + "T00:00:00Z");
          const toD = new Date(toP.value + "T00:00:00Z");
          const days = Math.floor((toD.getTime() - fromD.getTime()) / 86400000) + 1;
          if (days > maxSpan) { sendDetail(res, 422, "date_range_exceeds_max_span_days"); return; }
        }
        const compact = req.query.compact === "true" || req.query.compact === "1";
        const shellBundle = req.query.shell_bundle === "true" || req.query.shell_bundle === "1";
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const out = await buildHomeOverview(deps.homeOverview, id, fromP.value, toP.value, { compact, shellBundle });
        res.setHeader("Cache-Control", "private, max-age=60");
        res.json(out);
      } catch (e) { next(e); }
    },

    async tradeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const supplierId = typeof req.query.supplier_id === "string" ? req.query.supplier_id : undefined;
        const out = await repo.tradeSummary(id, fromP.value, toP.value, supplierId);
        res.json(out);
      } catch (e) { next(e); }
    },

    async tradeDailyProfit(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const out = await repo.tradeDailyProfit(id, fromP.value, toP.value);
        res.json(out);
      } catch (e) { next(e); }
    },

    async tradeItems(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const catIds = typeof req.query.category_id === "string" ? req.query.category_id.split(",").filter(Boolean) : undefined;
        const supIds = typeof req.query.supplier_id === "string" ? req.query.supplier_id.split(",").filter(Boolean) : undefined;
        const out = await repo.tradeItems(id, fromP.value, toP.value, {
          categoryIds: catIds,
          supplierIds: supIds,
          sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
          order: typeof req.query.order === "string" ? req.query.order : undefined,
          limit: parseNum(req.query.limit, 50, 1, 2000),
          offset: parseNum(req.query.offset, 0, 0, 10000),
        });
        res.json(out);
      } catch (e) { next(e); }
    },

    async tradeSuppliers(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const limit = parseNum(req.query.limit, 100, 1, 500);
        const out = await repo.tradeSuppliers(id, fromP.value, toP.value, limit);
        res.json(out);
      } catch (e) { next(e); }
    },

    async tradeCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const limit = parseNum(req.query.limit, 100, 1, 500);
        const out = await repo.tradeCategories(id, fromP.value, toP.value, limit);
        res.json(out);
      } catch (e) { next(e); }
    },

    async tradeTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const limit = parseNum(req.query.limit, 100, 1, 500);
        const out = await repo.tradeTypes(id, fromP.value, toP.value, limit);
        res.json(out);
      } catch (e) { next(e); }
    },

    async periodComparison(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const ms = new Date(toP.value).getTime() - new Date(fromP.value).getTime();
        const priorTo = new Date(fromP.value);
        priorTo.setMilliseconds(priorTo.getMilliseconds() - 1);
        const priorToStr = priorTo.toISOString().slice(0, 10);
        const priorFrom = new Date(priorTo.getTime() - ms);
        const priorFromStr = priorFrom.toISOString().slice(0, 10);

        const [current, prior] = await Promise.all([
          repo.periodComparison(id, fromP.value, toP.value),
          repo.periodComparison(id, priorFromStr, priorToStr),
        ]);
        const purchaseChangePct = prior.total_purchase > 0
          ? ((current.total_purchase - prior.total_purchase) / prior.total_purchase) * 100
          : 0;
        res.json({
          current,
          prior,
          purchase_change_pct: Math.round(purchaseChangePct * 100) / 100,
        });
      } catch (e) { next(e); }
    },

    async itemDrill(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const itemId = req.params.itemId as string;
        if (!itemId) { sendDetail(res, 400, "itemId required"); return; }
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) { sendDetail(res, 422, fromP.detail); return; }
        if (!toP.ok) { sendDetail(res, 422, toP.detail); return; }
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const limit = parseNum(req.query.limit, 50, 1, 200);
        const offset = parseNum(req.query.offset, 0, 0, 5000);
        const out = await repo.itemDrill(id, itemId, fromP.value, toP.value, limit, offset);
        if (!out.item) { sendDetail(res, 404, "Item not found"); return; }
        res.json(out);
      } catch (e) { next(e); }
    },

    async listReportViews(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const user = req.user;
        if (!user) { sendDetail(res, 401, "Not authenticated"); return; }
        const views = await repo.reportViews(id, user.id);
        res.json(views);
      } catch (e) { next(e); }
    },

    async createReportView(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const user = req.user;
        if (!user) { sendDetail(res, 401, "Not authenticated"); return; }
        const { name, tab, filters_json, is_default } = req.body as Record<string, unknown>;
        if (!name || typeof name !== "string" || !name.trim()) {
          sendDetail(res, 400, "name required (1-120 chars)");
          return;
        }
        if (!tab || typeof tab !== "string" || !tab.trim()) {
          sendDetail(res, 400, "tab required");
          return;
        }
        const viewId = await repo.createReportView(
          id, user.id, name.trim().slice(0, 120), tab.trim().slice(0, 32),
          filters_json ? JSON.stringify(filters_json) : null,
          is_default === true,
        );
        res.status(201).json({ id: viewId });
      } catch (e) { next(e); }
    },

    async deleteReportView(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = bizId(req);
        if (!id) { sendDetail(res, 400, "businessId required"); return; }
        const user = req.user;
        if (!user) { sendDetail(res, 401, "Not authenticated"); return; }
        const viewId = req.params.viewId as string;
        if (!viewId) { sendDetail(res, 400, "viewId required"); return; }
        const deleted = await repo.deleteReportView(viewId, id, user.id);
        if (!deleted) { sendDetail(res, 404, "Report view not found"); return; }
        res.status(204).send();
      } catch (e) { next(e); }
    },
  };
}
