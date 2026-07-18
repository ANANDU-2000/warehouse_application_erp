/**
 * Authz middleware factories for DI — Phase 3.6.
 * Built when UsersRepository / MembershipsRepository are available.
 */
import type { UsersRepository } from "../repositories/users.repository";
import type { MembershipsRepository } from "../repositories/memberships.repository";
import { createRequireAuth, requireSuperAdmin } from "./auth";
import {
  createRequireMembership,
  requireOwnerMembership,
  createRequireRole,
  createRequirePermission,
} from "./membership";

export type AuthzMiddleware = {
  requireAuth: ReturnType<typeof createRequireAuth>;
  requireMembership: ReturnType<typeof createRequireMembership>;
  requireOwnerMembership: typeof requireOwnerMembership;
  requireSuperAdmin: typeof requireSuperAdmin;
  requireRole: typeof createRequireRole;
  requirePermission: typeof createRequirePermission;
};

export function createAuthzMiddleware(
  users: UsersRepository,
  memberships: MembershipsRepository,
): AuthzMiddleware {
  return {
    requireAuth: createRequireAuth(users),
    requireMembership: createRequireMembership(memberships),
    requireOwnerMembership,
    requireSuperAdmin,
    requireRole: createRequireRole,
    requirePermission: createRequirePermission,
  };
}
