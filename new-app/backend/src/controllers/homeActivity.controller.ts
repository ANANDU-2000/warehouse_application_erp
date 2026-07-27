/**
 * Home activity WIRE controllers — list trade purchases, audit/recent, staff-purchases.
 */
import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { HomeActivityRepository } from "../repositories/homeActivity.repository";

export type HomeActivityControllerDeps = {
  homeActivity: HomeActivityRepository;
};

function businessIdParam(req: Request): string | null {
  const id = req.params.businessId;
  return typeof id === "string" ? id : null;
}

export function createHomeActivityController(deps: HomeActivityControllerDeps) {
  return {
    async listTradePurchases(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = businessIdParam(req);
        if (!businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const limit = Number(req.query.limit ?? 20) || 20;
        const offset = Number(req.query.offset ?? 0) || 0;
        const status =
          typeof req.query.status === "string" ? req.query.status : null;
        const purchaseFrom =
          typeof req.query.purchase_from === "string"
            ? req.query.purchase_from
            : null;
        const purchaseTo =
          typeof req.query.purchase_to === "string"
            ? req.query.purchase_to
            : null;
        res.json(
          await deps.homeActivity.listTradePurchases({
            businessId,
            limit,
            offset,
            status,
            purchaseFrom,
            purchaseTo,
          }),
        );
      } catch (e) {
        next(e);
      }
    },

    async auditRecent(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = businessIdParam(req);
        if (!businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const limit = Number(req.query.limit ?? 5) || 5;
        const on = typeof req.query.on === "string" ? req.query.on : null;
        res.json(
          await deps.homeActivity.auditRecent({ businessId, limit, on }),
        );
      } catch (e) {
        next(e);
      }
    },

    async listStaffPurchases(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = businessIdParam(req);
        if (!businessId) {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const limit = Number(req.query.limit ?? 100) || 100;
        const itemId =
          typeof req.query.item_id === "string" ? req.query.item_id : null;
        res.json(
          await deps.homeActivity.listStaffPurchases({
            businessId,
            limit,
            itemId,
          }),
        );
      } catch (e) {
        next(e);
      }
    },
  };
}

export type HomeActivityController = ReturnType<
  typeof createHomeActivityController
>;
