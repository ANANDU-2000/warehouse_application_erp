import { Router } from "express";
import type { AuthzMiddleware } from "../middleware/authz";
import type { SettingsController } from "../controllers/settings.controller";

export function createBrandingRoutes(
  settings: SettingsController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.patch(
    "/branding",
    authz.requireAuth,
    authz.requireMembership,
    authz.requireRole("owner", "manager", "super_admin"),
    (req, res, next) => void settings.patchBranding(req, res, next),
  );
  return r;
}

export function createExportsRoutes(
  settings: SettingsController,
  authz: AuthzMiddleware,
): Router {
  const r = Router({ mergeParams: true });
  r.post(
    "/backup",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("export_access"),
    (req, res, next) => void settings.exportZip(req, res, next),
  );
  r.get(
    "/stock-inventory.xlsx",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("export_access"),
    (req, res, next) => void settings.exportStockXlsx(req, res, next),
  );
  r.get(
    "/purchases-month.pdf",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("export_access"),
    (req, res, next) => void settings.exportPurchasesPdf(req, res, next),
  );
  r.get(
    "/backup/export",
    authz.requireAuth,
    authz.requireMembership,
    authz.requirePermission("export_access"),
    (req, res, next) => void settings.exportJson(req, res, next),
  );
  return r;
}
