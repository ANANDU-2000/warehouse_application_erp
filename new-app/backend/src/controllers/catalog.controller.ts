/**
 * Catalog hub routes — fuzzy-check (not under catalog-items)
 * Source: catalog.py GET /catalog/fuzzy-check
 */
import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import { sendDetail } from "../http/sendDetail";
import type { CatalogItemsRepository } from "../repositories/catalogItems.repository";
import { runCatalogFuzzyCheck } from "../services/catalogFuzzyCheck.service";

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
  return r;
}
