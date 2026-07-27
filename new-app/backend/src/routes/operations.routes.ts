import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { OperationsController } from "../controllers/operations.controller";

export function createOperationsRoutes(
  controller: OperationsController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });

  r.get(
    "/checklist",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getTemplates(req, res, next),
  );

  r.post(
    "/checklist/complete",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.completeTask(req, res, next),
  );

  r.put(
    "/checklist/templates",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireRole("owner", "manager", "super_admin"),
    (req, res, next) => void controller.replaceTemplates(req, res, next),
  );

  r.get(
    "/usage",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getUsageLogs(req, res, next),
  );

  r.post(
    "/usage",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("stock_edit"),
    (req, res, next) => void controller.saveUsageLogs(req, res, next),
  );

  r.get(
    "/snapshots",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getSnapshots(req, res, next),
  );

  r.get(
    "/summary",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getSummary(req, res, next),
  );

  return r;
}
