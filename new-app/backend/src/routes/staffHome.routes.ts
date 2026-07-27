/**
 * Staff home + home activity WIRE routes.
 */
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { StaffHomeController } from "../controllers/staffHome.controller";
import type { HomeActivityController } from "../controllers/homeActivity.controller";

export function createActivityLogRoutes(
  staffHome: StaffHomeController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.listActivityLog(req, res, next),
  );
  r.post(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.postActivityLog(req, res, next),
  );
  return r;
}

export function createNotificationsRoutes(
  staffHome: StaffHomeController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/summary",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.notificationsSummary(req, res, next),
  );

  r.post(
    "/client-event",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.clientNotificationEvent(req, res, next),
  );

  r.get(
    "/unread-count",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) =>
      void staffHome.notificationsUnreadCount(req, res, next),
  );
  r.post(
    "/mark-all-read",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.markAllNotificationsRead(req, res, next),
  );
  r.delete(
    "/clear-all",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.clearAllNotifications(req, res, next),
  );
  r.patch(
    "/:notificationId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.patchNotificationRead(req, res, next),
  );
  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.listNotifications(req, res, next),
  );
  return r;
}

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
    "/totals",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.stockTotals(req, res, next),
  );
  r.get(
    "/alerts/summary",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.stockAlertsSummary(req, res, next),
  );
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
    "/audit/feed",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void homeActivity.auditRecent(req, res, next),
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
  r.get(
    "/low-stock/operations",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.listLowStockOperations(req, res, next),
  );
  r.post(
    "/:itemId/notify-owner",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void staffHome.notifyOwnerStockItem(req, res, next),
  );
  return r;
}
