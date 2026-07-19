/**
 * Unified search routes — GET /v1/businesses/:businessId/search
 * Source: search.py
 */
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { SearchController } from "../controllers/search.controller";

export function createSearchRoutes(
  search: SearchController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    (req, res, next) => void search.unifiedSearch(req, res, next),
  );
  return r;
}
