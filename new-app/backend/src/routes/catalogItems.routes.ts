/**
 * Catalog items routes — GET/POST/PATCH/DELETE + batch + from-scan
 * Source: catalog.py
 * Static paths (batch, from-scan) MUST register before /:itemId.
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
  r.post(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.create(req, res, next),
  );
  r.post(
    "/batch",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.batchCreate(req, res, next),
  );
  r.post(
    "/from-scan",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.createFromScan(req, res, next),
  );
  r.get(
    "/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.getById(req, res, next),
  );
  r.patch(
    "/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.update(req, res, next),
  );
  r.delete(
    "/:itemId",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireOwnerMembership,
    (req, res, next) => void catalog.remove(req, res, next),
  );
  return r;
}
