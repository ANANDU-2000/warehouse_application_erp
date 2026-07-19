/**
 * Item categories controller + routes
 * Source: catalog.py item-categories / category-types-index
 */
import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import { sendDetail } from "../http/sendDetail";
import type { ItemCategoriesService } from "../services/itemCategories.service";

export type ItemCategoriesControllerDeps = {
  categories: ItemCategoriesService;
};

export function createItemCategoriesController(
  deps: ItemCategoriesControllerDeps,
) {
  return {
    async list(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        res.json(await deps.categories.list(businessId));
      } catch (e) {
        next(e);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        const categoryId = req.params.categoryId;
        if (typeof businessId !== "string" || typeof categoryId !== "string") {
          sendDetail(res, 400, "businessId and categoryId required");
          return;
        }
        res.json(await deps.categories.getById(businessId, categoryId));
      } catch (e) {
        next(e);
      }
    },

    async create(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const out = await deps.categories.create(businessId, req.body);
        res.status(201).json(out);
      } catch (e) {
        next(e);
      }
    },

    async listTypesIndex(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        res.json(await deps.categories.listTypesIndex(businessId));
      } catch (e) {
        next(e);
      }
    },
  };
}

export type ItemCategoriesController = ReturnType<
  typeof createItemCategoriesController
>;

export function createItemCategoriesRoutes(
  catalog: ItemCategoriesController,
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
  r.get(
    "/:categoryId",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.getById(req, res, next),
  );
  return r;
}

/** GET /category-types-index at business root */
export function createCategoryTypesIndexRoutes(
  catalog: ItemCategoriesController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void catalog.listTypesIndex(req, res, next),
  );
  return r;
}
