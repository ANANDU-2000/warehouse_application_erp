/**
 * Business-scoped users routes — list slice.
 * Prefix mounted at /v1/businesses/:businessId/users
 * Source: source-app/backend/app/routers/users.py
 */
import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import { createRequireRole } from "../middleware/membership";
import type { createUsersController } from "../controllers/users.controller";

export function createUsersRoutes(
  controller: ReturnType<typeof createUsersController>,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });

  r.get(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "manager", "super_admin"),
    (req, res, next) => void controller.list(req, res, next),
  );

  return r;
}
