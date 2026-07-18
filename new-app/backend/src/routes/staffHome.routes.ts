/**
 * Staff home WIRE routes — Flutter paths under /v1/me and /v1/businesses/:id/...
 */
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { StaffHomeController } from "../controllers/staffHome.controller";

export function createStaffHomeMeRoutes(
  controller: StaffHomeController,
  authz: AuthzMiddleware,
): Router {
  const r = Router();
  r.get("/profile", authz.requireAuth, (req, res, next) => {
    void controller.getProfile(req, res, next);
  });
  return r;
}

export function createTradePurchasesRoutes(
  controller: StaffHomeController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/delivery-pipeline",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.getDeliveryPipeline(req, res, next),
  );
  return r;
}

export function createStockRoutes(
  controller: StaffHomeController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/list",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.listStock(req, res, next),
  );
  r.get(
    "/opening/missing",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.openingMissing(req, res, next),
  );
  r.get(
    "/variances/today",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void controller.variancesToday(req, res, next),
  );
  return r;
}
