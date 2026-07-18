/**
 * Business-scoped users routes — list + create + profile + patch + delete + reset + credentials.
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

  r.post(
    "/",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "super_admin"),
    (req, res, next) => void controller.create(req, res, next),
  );

  r.post(
    "/:userId/reset-password",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "super_admin"),
    (req, res, next) => void controller.resetPassword(req, res, next),
  );

  r.get(
    "/:userId/credentials",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "super_admin"),
    (req, res, next) => void controller.credentials(req, res, next),
  );

  r.get(
    "/:userId/permissions",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "super_admin"),
    (req, res, next) => void controller.getPermissions(req, res, next),
  );

  r.patch(
    "/:userId/permissions",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "super_admin"),
    (req, res, next) => void controller.patchPermissions(req, res, next),
  );

  r.get(
    "/:userId/created-items",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "manager", "super_admin"),
    (req, res, next) => void controller.createdItems(req, res, next),
  );

  r.get(
    "/:userId",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "manager", "super_admin"),
    (req, res, next) => void controller.get(req, res, next),
  );

  r.patch(
    "/:userId",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "super_admin"),
    (req, res, next) => void controller.patch(req, res, next),
  );

  r.delete(
    "/:userId",
    authz.requireAuth,
    authz.requireMembership,
    createRequireRole("owner", "admin", "super_admin"),
    (req, res, next) => void controller.remove(req, res, next),
  );

  return r;
}
