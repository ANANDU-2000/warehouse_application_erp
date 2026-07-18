/**
 * Membership / role / permission gates — port of deps.py require_* helpers.
 * Source: source-app/backend/app/deps.py
 */
import type { NextFunction, Request, Response } from "express";
import type { MembershipsRepository } from "../repositories/memberships.repository";
import {
  membershipPermissions,
  requirePermissionKey,
} from "../services/permissions.service";
import { PermissionDeniedError } from "../services/errors";
import { sendAuthzDetail } from "./authzHttp";

/** Python `f"Access denied. Required roles: {list(roles)}"` → `['owner', 'admin']`. */
export function formatRequiredRolesDetail(roles: string[]): string {
  const inner = roles.map((r) => `'${r}'`).join(", ");
  return `Access denied. Required roles: [${inner}]`;
}

/**
 * Require membership for `req.params.businessId` + `req.user`.
 * Must run after createRequireAuth.
 */
export function createRequireMembership(memberships: MembershipsRepository) {
  return async function requireMembership(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendAuthzDetail(res, 401, "Not authenticated");
        return;
      }

      const businessId = req.params.businessId;
      if (!businessId || typeof businessId !== "string") {
        sendAuthzDetail(res, 403, "Not a member of this business");
        return;
      }

      const membership = await memberships.findByUserAndBusiness(
        user.id,
        businessId,
      );
      if (!membership) {
        sendAuthzDetail(res, 403, "Not a member of this business");
        return;
      }

      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Owner role required — after createRequireMembership. */
export function requireOwnerMembership(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const membership = req.membership;
  if (!membership) {
    sendAuthzDetail(res, 403, "Not a member of this business");
    return;
  }
  if (membership.role !== "owner") {
    sendAuthzDetail(res, 403, "Owner role required");
    return;
  }
  next();
}

/**
 * RBAC: membership.role must be one of roles (or user is super_admin).
 * After createRequireAuth + createRequireMembership.
 */
export function createRequireRole(...roles: string[]) {
  return function requireRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const user = req.user;
    const membership = req.membership;
    if (!user || !membership) {
      sendAuthzDetail(res, 401, "Not authenticated");
      return;
    }
    if (user.is_super_admin) {
      next();
      return;
    }
    if (!roles.includes(membership.role)) {
      sendAuthzDetail(res, 403, formatRequiredRolesDetail(roles));
      return;
    }
    next();
  };
}

/**
 * RBAC: membership must have permission key (super_admin bypasses).
 * After createRequireAuth + createRequireMembership.
 */
export function createRequirePermission(permission: string) {
  return function requirePermission(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const user = req.user;
    const membership = req.membership;
    if (!user || !membership) {
      sendAuthzDetail(res, 401, "Not authenticated");
      return;
    }
    if (user.is_super_admin) {
      next();
      return;
    }
    try {
      const perms = membershipPermissions(membership);
      requirePermissionKey(permission, perms);
      next();
    } catch (e) {
      if (e instanceof PermissionDeniedError) {
        sendAuthzDetail(res, 403, e.message);
        return;
      }
      throw e;
    }
  };
}
