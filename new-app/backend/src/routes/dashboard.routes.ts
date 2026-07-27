/**
 * Business-scoped dashboard route.
 * GET /v1/businesses/:businessId/dashboard
 */
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { createDashboardController } from "../controllers/dashboard.controller";

export function createDashboardRoutes(
  controller: ReturnType<typeof createDashboardController>,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/dashboard",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getMonthDashboard(req, res, next),
  );
  return r;
}
