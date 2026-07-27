import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { PurchaseController } from "../controllers/purchases.controller";

export function createPurchaseRoutes(
  ctrl: PurchaseController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });

  // Draft
  r.get("/draft", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.getDraft(req, res, next));
  r.put("/draft", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.upsertDraft(req, res, next));
  r.delete("/draft", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.deleteDraft(req, res, next));

  // Preview / Validate / Duplicate
  r.post("/preview-lines", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.previewLines(req, res, next));
  r.post("/validate", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.validate(req, res, next));
  r.post("/check-duplicate", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.checkDuplicate(req, res, next));

  // Utilities
  r.get("/next-human-id", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.nextHumanId(req, res, next));
  r.get("/last-defaults", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.lastDefaults(req, res, next));

  // List / Create
  r.get("/", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.list(req, res, next));
  r.post("/", authz.requireAuth, authz.requireMembership, authz.requirePermission("purchase_create"), (req, res, next) => void ctrl.create(req, res, next));

  // Delivery pipeline (Goods Receipt)
  r.get("/delivery-pipeline", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.getDeliveryPipeline(req, res, next));
  r.patch("/:purchaseId/delivery", authz.requireAuth, authz.requireMembership, authz.requirePermission("stock_edit"), (req, res, next) => void ctrl.patchDelivery(req, res, next));
  r.post("/:purchaseId/dispatch", authz.requireAuth, authz.requireMembership, authz.requireRole("owner", "manager"), (req, res, next) => void ctrl.purchaseDispatch(req, res, next));
  r.post("/:purchaseId/arrive", authz.requireAuth, authz.requireMembership, authz.requirePermission("stock_edit"), (req, res, next) => void ctrl.purchaseArrive(req, res, next));
  r.post("/:purchaseId/commit-stock", authz.requireAuth, authz.requireMembership, authz.requirePermission("stock_edit"), (req, res, next) => void ctrl.commitStock(req, res, next));
  r.post("/:purchaseId/auto-commit", authz.requireAuth, authz.requireMembership, authz.requirePermission("stock_edit"), (req, res, next) => void ctrl.autoCommitStock(req, res, next));
  r.post("/:purchaseId/verify", authz.requireAuth, authz.requireMembership, authz.requirePermission("stock_edit"), (req, res, next) => void ctrl.purchaseVerify(req, res, next));
  r.post("/:purchaseId/damage-reports", authz.requireAuth, authz.requireMembership, authz.requirePermission("stock_edit"), (_req, res) => { res.status(501).json({ error: "Not implemented — Goods Receipt module" }); });
  r.get("/:purchaseId/damage-reports", authz.requireAuth, authz.requireMembership, (_req, res) => { res.status(501).json({ error: "Not implemented — Goods Receipt module" }); });
  r.get("/:purchaseId/lifecycle-events", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.listLifecycleEvents(req, res, next));
  r.post("/:purchaseId/lifecycle", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.transitionLifecycle(req, res, next));

  // By ID
  r.get("/:purchaseId", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.getById(req, res, next));
  r.put("/:purchaseId", authz.requireAuth, authz.requireMembership, authz.requirePermission("purchase_edit"), (req, res, next) => void ctrl.update(req, res, next));
  r.delete("/:purchaseId", authz.requireAuth, authz.requireMembership, authz.requireRole("owner", "manager", "super_admin"), (req, res, next) => void ctrl.deletePurchase(req, res, next));

  // Payment / Cancel
  r.patch("/:purchaseId/payment", authz.requireAuth, authz.requireMembership, authz.requirePermission("purchase_edit"), (req, res, next) => void ctrl.patchPayment(req, res, next));
  r.post("/:purchaseId/mark-paid", authz.requireAuth, authz.requireMembership, authz.requirePermission("purchase_edit"), (req, res, next) => void ctrl.markPaid(req, res, next));
  r.post("/:purchaseId/cancel", authz.requireAuth, authz.requireMembership, authz.requirePermission("purchase_edit"), (req, res, next) => void ctrl.cancel(req, res, next));

  // PDF
  r.get("/:purchaseId/pdf", authz.requireAuth, authz.requireMembership, (req, res, next) => void ctrl.exportPdf(req, res, next));

  return r;
}
