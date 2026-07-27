/**
 * Catalog controller — fuzzy-check + bulk-archive + bulk-reorder
 * Source: catalog.py
 */
import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import { sendDetail } from "../http/sendDetail";
import type { CatalogItemsRepository } from "../repositories/catalogItems.repository";
import { runCatalogFuzzyCheck } from "../services/catalogFuzzyCheck.service";
import {
  bulkItemIdsSchema,
  bulkReorderSchema,
} from "../validation/catalogBulk.schemas";
import { validateWithSchema } from "../validation/validate";

export type CatalogControllerDeps = {
  catalogItems: CatalogItemsRepository;
};

export function createCatalogController(deps: CatalogControllerDeps) {
  return {
    async fuzzyCheck(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const name =
          typeof req.query.name === "string" ? req.query.name.trim() : "";
        if (!name || name.length > 512) {
          sendDetail(res, 422, "name must be 1..512 characters");
          return;
        }
        const categoryId =
          typeof req.query.category_id === "string"
            ? req.query.category_id
            : null;
        const typeId =
          typeof req.query.type_id === "string" ? req.query.type_id : null;
        const supplierId =
          typeof req.query.supplier_id === "string"
            ? req.query.supplier_id
            : null;
        const out = await runCatalogFuzzyCheck(deps.catalogItems, {
          businessId,
          name,
          categoryId,
          typeId,
          supplierId,
        });
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    /** Formula source: catalog.py:bulk_archive_catalog_items */
    async bulkArchive(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const data = validateWithSchema(
          bulkItemIdsSchema,
          req.body,
          "Invalid bulk archive body",
        );
        await deps.catalogItems.bulkSoftDelete(businessId, data.item_ids);
        res.status(204).send();
      } catch (e) {
        next(e);
      }
    },

    /** Formula source: catalog.py:bulk_reorder_catalog_items */
    async bulkReorder(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const data = validateWithSchema(
          bulkReorderSchema,
          req.body,
          "Invalid bulk reorder body",
        );
        const updated = await deps.catalogItems.bulkSetReorderLevel(
          businessId,
          data.item_ids,
          data.reorder_level,
        );
        res.json({ updated });
      } catch (e) {
        next(e);
      }
    },

    async getItemInsights(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const fromDate = (req.query.from as string);
        const toDate = (req.query.to as string);
        if (!fromDate || !toDate) {
          res.status(400).json({ error: "from and to query params are required" });
          return;
        }
        const insights = await deps.catalogItems.getItemInsights(businessId, itemId, fromDate, toDate);
        res.json(insights);
      } catch (e) {
        next(e);
      }
    },

    async getItemLines(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId as string;
        const itemId = req.params.itemId as string;
        const fromDate = (req.query.from as string);
        const toDate = (req.query.to as string);
        if (!fromDate || !toDate) {
          res.status(400).json({ error: "from and to query params are required" });
          return;
        }
        const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
        const offset = Math.max(0, Number(req.query.offset ?? 0));
        const lines = await deps.catalogItems.getItemLines(businessId, itemId, fromDate, toDate, limit, offset);
        res.json(lines);
      } catch (e) {
        next(e);
      }
    },
  };
}

export type CatalogController = ReturnType<typeof createCatalogController>;

export function createCatalogRoutes(
  catalog: CatalogController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/fuzzy-check",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.fuzzyCheck(req, res, next),
  );
  r.post(
    "/items/bulk-archive",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireOwnerMembership,
    (req, res, next) => void catalog.bulkArchive(req, res, next),
  );
  r.patch(
    "/items/bulk-reorder",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireOwnerMembership,
    (req, res, next) => void catalog.bulkReorder(req, res, next),
  );
  return r;
}
