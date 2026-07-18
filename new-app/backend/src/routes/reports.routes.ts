/**
 * Business-scoped reports routes (home-overview slice).
 * Prefix mounted at /v1/businesses/:businessId/reports
 */
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
    (req, res, next) =>
      void controller.tradeDashboardSnapshot(req, res, next),
  );

  r.get(
    "/home-overview",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.homeOverview(req, res, next),
  );

  return r;
}
