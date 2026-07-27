import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { StockController } from "../controllers/stock.controller";

export function createStockDetailRoutes(
  stock: StockController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });

  r.get(
    "/inventory-summary",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.getInventorySummary(req, res, next),
  );

  r.get(
    "/reorder",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.listReorderEntries(req, res, next),
  );

  r.patch(
    "/reorder/:entryId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.patchReorderEntry(req, res, next),
  );

  r.delete(
    "/reorder/:entryId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.deleteReorderEntry(req, res, next),
  );

  r.get(
    "/barcode/lookup",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.barcodeLookup(req, res, next),
  );

  r.get(
    "/barcode/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.barcodeLabel(req, res, next),
  );

  r.post(
    "/barcode/batch",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("stock_edit"),
    (req, res, next) => void stock.barcodeBatch(req, res, next),
  );

  r.get(
    "/items/:itemId/purchase-intelligence",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.purchaseIntelligence(req, res, next),
  );

  r.get(
    "/audit/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.listStockAuditByItem(req, res, next),
  );

  r.get(
    "/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.getStockDetail(req, res, next),
  );

  r.get(
    "/:itemId/movements",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.listMovements(req, res, next),
  );

  r.patch(
    "/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("stock_edit"),
    (req, res, next) => void stock.patchStock(req, res, next),
  );

  r.post(
    "/:itemId/quick-purchase",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("stock_edit"),
    (req, res, next) => void stock.quickPurchase(req, res, next),
  );

  r.post(
    "/:itemId/undo-last",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("stock_edit"),
    (req, res, next) => void stock.undoLastAdjustment(req, res, next),
  );

  r.post(
    "/:itemId/opening-stock",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireRole("owner", "manager", "super_admin"),
    (req, res, next) => void stock.createOpeningStock(req, res, next),
  );

  r.post(
    "/:itemId/physical-count",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("stock_edit"),
    (req, res, next) => void stock.createPhysicalCount(req, res, next),
  );

  r.post(
    "/:itemId/reorder",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void stock.createReorderEntry(req, res, next),
  );

  return r;
}
