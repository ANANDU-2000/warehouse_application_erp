/**
 * Catalog variants controller — nested under catalog-items + top-level catalog-variants
 */
import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { CatalogVariantsService } from "../services/catalogVariants.service";

export type CatalogVariantsControllerDeps = {
  variants: CatalogVariantsService;
};

export function createCatalogVariantsController(
  deps: CatalogVariantsControllerDeps,
) {
  return {
    async list(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        const itemId = req.params.itemId;
        if (typeof businessId !== "string" || typeof itemId !== "string") {
          sendDetail(res, 400, "businessId and itemId required");
          return;
        }
        const out = await deps.variants.list(businessId, itemId);
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async create(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        const itemId = req.params.itemId;
        if (typeof businessId !== "string" || typeof itemId !== "string") {
          sendDetail(res, 400, "businessId and itemId required");
          return;
        }
        const out = await deps.variants.create(businessId, itemId, req.body);
        res.status(201).json(out);
      } catch (e) {
        next(e);
      }
    },

    async update(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        const variantId = req.params.variantId;
        if (typeof businessId !== "string" || typeof variantId !== "string") {
          sendDetail(res, 400, "businessId and variantId required");
          return;
        }
        const out = await deps.variants.update(
          businessId,
          variantId,
          req.body,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        const variantId = req.params.variantId;
        if (typeof businessId !== "string" || typeof variantId !== "string") {
          sendDetail(res, 400, "businessId and variantId required");
          return;
        }
        await deps.variants.remove(businessId, variantId);
        res.status(204).send();
      } catch (e) {
        next(e);
      }
    },
  };
}

export type CatalogVariantsController = ReturnType<
  typeof createCatalogVariantsController
>;
