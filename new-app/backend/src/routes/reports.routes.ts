import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import {
  createRequireRole,
} from "../middleware/membership";
import type { createReportsController } from "../controllers/reports.controller";

export function createReportsRoutes(
  controller: ReturnType<typeof createReportsController>,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });

  r.get(
    "/trade-dashboard-snapshot",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "manager", "super_admin"),
    (req, res, next) => void controller.tradeDashboardSnapshot(req, res, next),
  );

  r.get(
    "/home-overview",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.homeOverview(req, res, next),
  );

  r.get(
    "/trade-summary",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "manager", "super_admin"),
    (req, res, next) => void controller.tradeSummary(req, res, next),
  );

  r.get(
    "/trade-daily-profit",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.tradeDailyProfit(req, res, next),
  );

  r.get(
    "/trade-items",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.tradeItems(req, res, next),
  );

  r.get(
    "/trade-suppliers",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.tradeSuppliers(req, res, next),
  );

  r.get(
    "/trade-categories",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.tradeCategories(req, res, next),
  );

  r.get(
    "/trade-types",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.tradeTypes(req, res, next),
  );

  r.get(
    "/period-comparison",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.periodComparison(req, res, next),
  );

  r.get(
    "/item/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.itemDrill(req, res, next),
  );

  r.get(
    "/report-views",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.listReportViews(req, res, next),
  );

  r.post(
    "/report-views",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.createReportView(req, res, next),
  );

  r.delete(
    "/report-views/:viewId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.deleteReportView(req, res, next),
  );

  return r;
}
