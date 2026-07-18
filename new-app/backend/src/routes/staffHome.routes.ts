/**
 * Staff home + home activity WIRE routes.
 */
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { StaffHomeController } from "../controllers/staffHome.controller";
import type { HomeActivityController } from "../controllers/homeActivity.controller";

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
  staffHome: StaffHomeController,
  homeActivity: HomeActivityController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/delivery-pipeline",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.getDeliveryPipeline(req, res, next),
  );
  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void homeActivity.listTradePurchases(req, res, next),
  );
  return r;
}

export function createStockRoutes(
  staffHome: StaffHomeController,
  homeActivity: HomeActivityController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/list",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.listStock(req, res, next),
  );
  r.get(
    "/opening/missing",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.openingMissing(req, res, next),
  );
  r.get(
    "/variances/today",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.variancesToday(req, res, next),
  );
  r.get(
    "/audit/recent",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void homeActivity.auditRecent(req, res, next),
  );
  r.get(
    "/staff-purchases",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void homeActivity.listStaffPurchases(req, res, next),
  );
  return r;
}
