/**
 * Catalog items controller — GET list + GET by id
 * Source: catalog.py list_catalog_items / get_catalog_item
 */
import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/httpError";
import { sendDetail } from "../http/sendDetail";
import type { CatalogItemsRepository } from "../repositories/catalogItems.repository";
import {
  mapCatalogItemsForRole,
  maybeRedactCatalogOut,
  toCatalogItemOut,
} from "../services/catalogItems.service";

export type CatalogItemsControllerDeps = {
  catalogItems: CatalogItemsRepository;
};

function parsePage(raw: unknown, fallback: number): number {
  const n = typeof raw === "string" ? Number(raw) : fallback;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

export function createCatalogItemsController(deps: CatalogItemsControllerDeps) {
  return {
    async list(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const page = parsePage(req.query.page, 1);
        let perPage = parsePage(req.query.per_page, 200);
        if (perPage < 1) perPage = 1;
        if (perPage > 500) perPage = 500;
        const categoryId =
          typeof req.query.category_id === "string"
            ? req.query.category_id
            : null;
        const typeId =
          typeof req.query.type_id === "string" ? req.query.type_id : null;
        const role = req.membership?.role ?? null;
        const rows = await deps.catalogItems.list({
          businessId,
          categoryId,
          typeId,
          page,
          perPage,
        });
        res.json(mapCatalogItemsForRole(rows, role));
      } catch (e) {
        next(e);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        const itemId = req.params.itemId;
        if (typeof businessId !== "string" || typeof itemId !== "string") {
          sendDetail(res, 400, "businessId and itemId required");
          return;
        }
        const row = await deps.catalogItems.getById(businessId, itemId);
        if (!row) {
          throw new HttpError(404, "Item not found");
        }
        const role = req.membership?.role ?? null;
        res.json(maybeRedactCatalogOut(toCatalogItemOut(row), role));
      } catch (e) {
        next(e);
      }
    },
  };
}

export type CatalogItemsController = ReturnType<
  typeof createCatalogItemsController
>;
