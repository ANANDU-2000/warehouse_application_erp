/**
 * Dashboard HTTP — GET /v1/businesses/:businessId/dashboard
 * Source: source-app/backend/app/routers/dashboard.py
 */
import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { DashboardRepository } from "../repositories/dashboard.repository";
import { computeMonthDashboard } from "../services/dashboard.service";

export type DashboardControllerDeps = {
  dashboard: DashboardRepository;
};

export function createDashboardController(deps: DashboardControllerDeps) {
  return {
    async getMonthDashboard(
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const month = typeof req.query.month === "string" ? req.query.month : "";
        if (!month) {
          sendDetail(res, 422, "month must be YYYY-MM");
          return;
        }
        const out = await computeMonthDashboard(
          deps.dashboard,
          businessId,
          month,
        );
        res.json(out);
      } catch (e) {
        const err = e as Error & { status?: number };
        if (err.status === 422) {
          sendDetail(res, 422, err.message);
          return;
        }
        next(e);
      }
    },
  };
}
