/**
 * Catalog items controller — list/get + Slice 2 create/patch/delete
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
import type { CatalogItemsWriteService } from "../services/catalogItemsWrite.service";

export type CatalogItemsControllerDeps = {
  catalogItems: CatalogItemsRepository;
  write?: CatalogItemsWriteService;
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

    async create(req: Request, res: Response, next: NextFunction) {
      try {
        if (!deps.write) {
          sendDetail(res, 503, "Catalog writes unavailable");
          return;
        }
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const role = req.membership?.role ?? null;
        const out = await deps.write.create(businessId, req.body, role);
        res.status(201).json(out);
      } catch (e) {
        next(e);
      }
    },

    async update(req: Request, res: Response, next: NextFunction) {
      try {
        if (!deps.write) {
          sendDetail(res, 503, "Catalog writes unavailable");
          return;
        }
        const businessId = req.params.businessId;
        const itemId = req.params.itemId;
        if (typeof businessId !== "string" || typeof itemId !== "string") {
          sendDetail(res, 400, "businessId and itemId required");
          return;
        }
        const role = req.membership?.role ?? null;
        const out = await deps.write.update(
          businessId,
          itemId,
          req.body,
          role,
        );
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
      try {
        if (!deps.write) {
          sendDetail(res, 503, "Catalog writes unavailable");
          return;
        }
        const businessId = req.params.businessId;
        const itemId = req.params.itemId;
        if (typeof businessId !== "string" || typeof itemId !== "string") {
          sendDetail(res, 400, "businessId and itemId required");
          return;
        }
        await deps.write.remove(businessId, itemId);
        res.status(204).send();
      } catch (e) {
        next(e);
      }
    },

    async batchCreate(req: Request, res: Response, next: NextFunction) {
      try {
        if (!deps.write) {
          sendDetail(res, 503, "Catalog writes unavailable");
          return;
        }
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const out = await deps.write.batchCreate(businessId, req.body);
        res.json(out);
      } catch (e) {
        next(e);
      }
    },

    async createFromScan(req: Request, res: Response, next: NextFunction) {
      try {
        if (!deps.write) {
          sendDetail(res, 503, "Catalog writes unavailable");
          return;
        }
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const out = await deps.write.createFromScan(businessId, req.body);
        res.status(201).json(out);
      } catch (e) {
        next(e);
      }
    },
  };
}

export type CatalogItemsController = ReturnType<
  typeof createCatalogItemsController
>;
