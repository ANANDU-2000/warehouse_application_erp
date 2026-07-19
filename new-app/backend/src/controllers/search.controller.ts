/**
 * Unified search controller — search.py unified_search
 */
import type { Request, Response, NextFunction } from "express";
import { sendDetail } from "../http/sendDetail";
import type { SearchRepository } from "../repositories/search.repository";

export type SearchControllerDeps = {
  search: SearchRepository;
};

export function createSearchController(deps: SearchControllerDeps) {
  return {
    async unifiedSearch(req: Request, res: Response, next: NextFunction) {
      try {
        const businessId = req.params.businessId;
        if (typeof businessId !== "string") {
          sendDetail(res, 400, "businessId required");
          return;
        }
        const q = typeof req.query.q === "string" ? req.query.q : "";
        if (!q.trim() || q.trim().length > 200) {
          sendDetail(res, 422, "q must be 1..200 characters");
          return;
        }
        const supplierId =
          typeof req.query.supplier_id === "string"
            ? req.query.supplier_id
            : null;
        const role = req.membership?.role ?? null;
        res.json(
          await deps.search.unifiedSearch({
            businessId,
            q,
            role,
            supplierId,
          }),
        );
      } catch (e) {
        next(e);
      }
    },
  };
}

export type SearchController = ReturnType<typeof createSearchController>;
