/**
 * Reports home-overview / trade-dashboard-snapshot HTTP.
 * Source: source-app/backend/app/routers/reports_trade.py
 */
import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { HomeOverviewRepository } from "../repositories/homeOverview.repository";
import {
  buildHomeOverview,
  computeTradeDashboardSnapshot,
} from "../services/homeOverview.service";

export type ReportsControllerDeps = {
  homeOverview: HomeOverviewRepository;
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

export function createReportsController(deps: ReportsControllerDeps) {
  return {
    async tradeDashboardSnapshot(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) {
          sendDetail(res, 422, fromP.detail);
          return;
        }
        if (!toP.ok) {
          sendDetail(res, 422, toP.detail);
          return;
        }
        if (fromP.value > toP.value) {
          sendDetail(res, 422, "from_must_not_exceed_to");
          return;
        }
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const out = await computeTradeDashboardSnapshot(
          deps.homeOverview,
          businessId,
          fromP.value,
          toP.value,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async homeOverview(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const fromP = parseDateParam(req.query.from, "from");
        const toP = parseDateParam(req.query.to, "to");
        if (!fromP.ok) {
          sendDetail(res, 422, fromP.detail);
          return;
        }
        if (!toP.ok) {
          sendDetail(res, 422, toP.detail);
          return;
        }
        if (fromP.value > toP.value) {
          sendDetail(res, 422, "from_must_not_exceed_to");
          return;
        }

        const maxSpan =
          typeof req.query.max_span_days === "string"
            ? Number(req.query.max_span_days)
            : undefined;
        if (maxSpan !== undefined && Number.isFinite(maxSpan)) {
          const fromD = new Date(fromP.value + "T00:00:00Z");
          const toD = new Date(toP.value + "T00:00:00Z");
          const days =
            Math.floor((toD.getTime() - fromD.getTime()) / 86400000) + 1;
          if (days > maxSpan) {
            sendDetail(res, 422, "date_range_exceeds_max_span_days");
            return;
          }
        }

        const compact =
          req.query.compact === "true" || req.query.compact === "1";
        const shellBundle =
          req.query.shell_bundle === "true" ||
          req.query.shell_bundle === "1";

        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }

        const out = await buildHomeOverview(
          deps.homeOverview,
          businessId,
          fromP.value,
          toP.value,
          { compact, shellBundle },
        );
        res.setHeader("Cache-Control", "private, max-age=60");
        res.json(out);
      } catch (e) {
        next(e);
      }
    },
  };
}
