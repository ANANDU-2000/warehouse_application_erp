/**
 * Catalog items routes — GET /catalog-items, GET /catalog-items/:itemId
 * Source: catalog.py prefix /v1/businesses/{business_id}
 */
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { CatalogItemsController } from "../controllers/catalogItems.controller";

export function createCatalogItemsRoutes(
  catalog: CatalogItemsController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.list(req, res, next),
  );
  r.get(
    "/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.getById(req, res, next),
  );
  return r;
}
