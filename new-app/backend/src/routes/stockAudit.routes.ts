import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { StockAuditController } from "../controllers/stockAudit.controller";

export function createStockAuditRoutes(
  controller: StockAuditController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });

  r.get(
    "/kpis",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getKpis(req, res, next),
  );

  r.get(
    "/pending-lines",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireRole("owner", "manager", "super_admin"),
    (req, res, next) => void controller.getPendingLines(req, res, next),
  );

  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.list(req, res, next),
  );

  r.post(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.create(req, res, next),
  );

  r.get(
    "/:auditId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getById(req, res, next),
  );

  r.put(
    "/:auditId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.update(req, res, next),
  );

  r.post(
    "/:auditId/lines",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.upsertLine(req, res, next),
  );

  r.post(
    "/:auditId/complete",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.complete(req, res, next),
  );

  r.post(
    "/:auditId/lines/:lineId/approve",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireRole("owner", "manager", "super_admin"),
    (req, res, next) => void controller.approveLine(req, res, next),
  );

  r.delete(
    "/:auditId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.delete(req, res, next),
  );

  return r;
}
