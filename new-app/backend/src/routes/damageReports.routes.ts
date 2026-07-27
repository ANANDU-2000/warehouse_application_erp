import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { DamageReportsController } from "../controllers/damageReports.controller";

export function createDamageReportsRoutes(
  controller: DamageReportsController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });

  r.get(
    "/pending-count",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getPendingCount(req, res, next),
  );

  r.patch(
    "/:reportId",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireRole("owner", "manager", "super_admin"),
    (req, res, next) => void controller.patchReport(req, res, next),
  );

  return r;
}
