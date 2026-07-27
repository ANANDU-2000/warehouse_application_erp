import type { Request, Response, NextFunction } from "express";
import type { PurchaseService } from "../services/purchases.service";
import {
  PurchaseValidationError,
  PurchaseDuplicateError,
  PurchaseStateConflictError,
  NotFoundError,
} from "../services/purchases.service";

export type PurchaseController = {
  getDraft: (req: Request, res: Response, next: NextFunction) => void;
  upsertDraft: (req: Request, res: Response, next: NextFunction) => void;
  deleteDraft: (req: Request, res: Response, next: NextFunction) => void;
  previewLines: (req: Request, res: Response, next: NextFunction) => void;
  validate: (req: Request, res: Response, next: NextFunction) => void;
  checkDuplicate: (req: Request, res: Response, next: NextFunction) => void;
  nextHumanId: (req: Request, res: Response, next: NextFunction) => void;
  lastDefaults: (req: Request, res: Response, next: NextFunction) => void;
  list: (req: Request, res: Response, next: NextFunction) => void;
  create: (req: Request, res: Response, next: NextFunction) => void;
  getById: (req: Request, res: Response, next: NextFunction) => void;
  update: (req: Request, res: Response, next: NextFunction) => void;
  deletePurchase: (req: Request, res: Response, next: NextFunction) => void;
  patchPayment: (req: Request, res: Response, next: NextFunction) => void;
  markPaid: (req: Request, res: Response, next: NextFunction) => void;
  cancel: (req: Request, res: Response, next: NextFunction) => void;
  listLifecycleEvents: (req: Request, res: Response, next: NextFunction) => void;
  transitionLifecycle: (req: Request, res: Response, next: NextFunction) => void;
  // Delivery pipeline
  getDeliveryPipeline: (req: Request, res: Response, next: NextFunction) => void;
  purchaseDispatch: (req: Request, res: Response, next: NextFunction) => void;
  purchaseArrive: (req: Request, res: Response, next: NextFunction) => void;
  purchaseVerify: (req: Request, res: Response, next: NextFunction) => void;
  patchDelivery: (req: Request, res: Response, next: NextFunction) => void;
  commitStock: (req: Request, res: Response, next: NextFunction) => void;
  autoCommitStock: (req: Request, res: Response, next: NextFunction) => void;
};

function handleServiceError(err: unknown, res: Response): void {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message, code: err.code });
    return;
  }
  if (err instanceof PurchaseValidationError) {
    res.status(422).json({ error: "Validation failed", code: err.code, details: err.details });
    return;
  }
  if (err instanceof PurchaseDuplicateError) {
    res.status(409).json({
      error: err.message, code: err.code, existing_id: err.existingId, existing_human_id: err.existingHumanId,
    });
    return;
  }
  if (err instanceof PurchaseStateConflictError) {
    res.status(409).json({ error: err.message, code: err.code });
    return;
  }
  throw err;
}

export function createPurchaseController(svc: PurchaseService): PurchaseController {
  const wrap = (fn: (req: Request, res: Response) => Promise<void>) => {
    return (req: Request, res: Response, _next: NextFunction) => {
      fn(req, res).catch((err) => handleServiceError(err, res));
    };
  };

  return {
    getDraft: wrap(async (req, res) => {
      const result = await svc.getDraft(req.params["businessId"] as string, req.user!.id);
      if (!result) { res.status(404).json({ error: "No draft" }); return; }
      res.json(result);
    }),

    upsertDraft: wrap(async (req, res) => {
      await svc.upsertDraft(req.params["businessId"] as string, req.user!.id, req.body);
      res.json({ ok: true });
    }),

    deleteDraft: wrap(async (req, res) => {
      await svc.deleteDraft(req.params["businessId"] as string, req.user!.id);
      res.json({ ok: true });
    }),

    previewLines: wrap(async (req, res) => {
      const result = await svc.previewLines(req.body);
      res.json(result);
    }),

    validate: wrap(async (req, res) => {
      const result = await svc.validate(req.body);
      res.json(result);
    }),

    checkDuplicate: wrap(async (req, res) => {
      const result = await svc.checkDuplicate(req.params["businessId"] as string, req.body);
      res.json(result);
    }),

    nextHumanId: wrap(async (req, res) => {
      const result = await svc.nextHumanId(req.params["businessId"] as string);
      res.json(result);
    }),

    lastDefaults: wrap(async (req, res) => {
      const catalogItemId = req.query.catalog_item_id as string | undefined;
      if (!catalogItemId) { res.status(400).json({ error: "catalog_item_id is required" }); return; }
      const supplierId = req.query.supplier_id as string | undefined;
      const brokerId = req.query.broker_id as string | undefined;
      const result = await svc.lastDefaults(req.params["businessId"] as string, catalogItemId, supplierId, brokerId);
      res.json(result);
    }),

    list: wrap(async (req, res) => {
      const businessId = req.params["businessId"] as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const filters: Record<string, unknown> = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.supplier_id) filters.supplierId = req.query.supplier_id as string;
      if (req.query.broker_id) filters.brokerId = req.query.broker_id as string;
      if (req.query.q) filters.q = req.query.q as string;
      if (req.query.purchase_from) filters.purchaseFrom = req.query.purchase_from as string;
      if (req.query.purchase_to) filters.purchaseTo = req.query.purchase_to as string;
      if (req.query.catalog_item_id) filters.catalogItemId = req.query.catalog_item_id as string;
      const result = await svc.listPurchases(businessId, limit, offset, filters);
      res.json(result);
    }),

    create: wrap(async (req, res) => {
      const result = await svc.createPurchase(req.params["businessId"] as string, req.user!.id, req.body);
      res.status(201).json(result);
    }),

    getById: wrap(async (req, res) => {
      const result = await svc.getPurchase(req.params["businessId"] as string, req.params["purchaseId"] as string);
      res.json(result);
    }),

    update: wrap(async (req, res) => {
      const result = await svc.updatePurchase(req.params["businessId"] as string, req.params["purchaseId"] as string, req.body);
      res.json(result);
    }),

    deletePurchase: wrap(async (req, res) => {
      await svc.deletePurchase(req.params["businessId"] as string, req.params["purchaseId"] as string);
      res.json({ ok: true });
    }),

    patchPayment: wrap(async (req, res) => {
      const result = await svc.patchPayment(req.params["businessId"] as string, req.params["purchaseId"] as string, req.body);
      res.json(result);
    }),

    markPaid: wrap(async (req, res) => {
      const result = await svc.markPaid(req.params["businessId"] as string, req.params["purchaseId"] as string, req.body);
      res.json(result);
    }),

    cancel: wrap(async (req, res) => {
      const result = await svc.cancelPurchase(req.params["businessId"] as string, req.params["purchaseId"] as string);
      res.json(result);
    }),

    listLifecycleEvents: wrap(async (req, res) => {
      const result = await svc.listLifecycleEvents(req.params["businessId"] as string, req.params["purchaseId"] as string);
      res.json(result);
    }),

    transitionLifecycle: wrap(async (req, res) => {
      await svc.transitionLifecycle(req.params["businessId"] as string, req.params["purchaseId"] as string, req.body);
      res.json({ ok: true });
    }),

    // Delivery pipeline
    getDeliveryPipeline: wrap(async (req, res) => {
      const result = await svc.getDeliveryPipeline(req.params["businessId"] as string);
      res.json(result);
    }),

    purchaseDispatch: wrap(async (req, res) => {
      const result = await svc.purchaseDispatch(req.params["businessId"] as string, req.params["purchaseId"] as string, req.body);
      res.json(result);
    }),

    purchaseArrive: wrap(async (req, res) => {
      const result = await svc.purchaseArrive(req.params["businessId"] as string, req.params["purchaseId"] as string, req.body);
      res.json(result);
    }),

    purchaseVerify: wrap(async (req, res) => {
      const result = await svc.purchaseVerify(req.params["businessId"] as string, req.params["purchaseId"] as string, req.body);
      res.json(result);
    }),

    patchDelivery: wrap(async (req, res) => {
      const result = await svc.patchDelivery(req.params["businessId"] as string, req.params["purchaseId"] as string, req.body);
      res.json(result);
    }),

    commitStock: wrap(async (req, res) => {
      const result = await svc.commitStock(req.params["businessId"] as string, req.params["purchaseId"] as string);
      res.json(result);
    }),

    autoCommitStock: wrap(async (req, res) => {
      const result = await svc.autoCommitStock(req.params["businessId"] as string, req.params["purchaseId"] as string);
      if (!result) { res.status(400).json({ error: "Auto-commit not available" }); return; }
      res.json(result);
    }),
  };
}
