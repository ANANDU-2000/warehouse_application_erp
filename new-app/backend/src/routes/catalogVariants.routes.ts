/**
 * Nested variants under catalog-items — GET/POST …/catalog-items/:itemId/variants
 */
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { CatalogVariantsController } from "../controllers/catalogVariants.controller";

export function createCatalogItemVariantsRoutes(
  variants: CatalogVariantsController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void variants.list(req, res, next),
  );
  r.post(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void variants.create(req, res, next),
  );
  return r;
}

/**
 * Top-level catalog-variants — PATCH/DELETE …/catalog-variants/:variantId
 */
export function createCatalogVariantsRoutes(
  variants: CatalogVariantsController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.patch(
    "/:variantId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void variants.update(req, res, next),
  );
  r.delete(
    "/:variantId",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireOwnerMembership,
    (req, res, next) => void variants.remove(req, res, next),
  );
  return r;
}
