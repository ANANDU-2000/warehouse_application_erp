/**
 * get_permissions / patch_permissions — …/users/:userId/permissions
 * Source: source-app/backend/app/routers/users.py:get_permissions, patch_permissions
 */
import { HttpError } from "../errors/httpError";
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import type { MembershipsRepository } from "../repositories/memberships.repository";
import {
  membershipPermissions,
  parsePermissionsJson,
  PERMISSION_KEYS,
  type PermissionsMap,
} from "./permissions.service";

export type PermissionsOut = {
  role: string;
  permissions: PermissionsMap;
};

export type PermissionsPatchIn = {
  permissions: Record<string, boolean>;
};

/**
 * Port of get_permissions — no guardActorTarget.
 */
export async function getPermissionsForBusiness(
  businessUsers: BusinessUsersRepository,
  businessId: string,
  userId: string,
): Promise<PermissionsOut> {
  const loaded = await businessUsers.findMemberForPatch(businessId, userId);
  if (!loaded) {
    throw new HttpError(404, "User not found");
  }
  return {
    role: loaded.role,
    permissions: membershipPermissions({
      role: loaded.role,
      permissions_json: loaded.permissions_json,
    }),
  };
}

/**
 * Port of patch_permissions — merge PERMISSION_KEYS into sparse overrides JSON.
 */
export async function patchPermissionsForBusiness(
  businessUsers: BusinessUsersRepository,
  memberships: MembershipsRepository,
  businessId: string,
  userId: string,
  body: PermissionsPatchIn,
): Promise<PermissionsOut> {
  const loaded = await businessUsers.findMemberForPatch(businessId, userId);
  if (!loaded) {
    throw new HttpError(404, "User not found");
  }

  const current = parsePermissionsJson(loaded.permissions_json) ?? {};
  const merged: Record<string, unknown> = { ...current };
  for (const k of PERMISSION_KEYS) {
    if (k in body.permissions) {
      merged[k] = Boolean(body.permissions[k]);
    }
  }

  const permissions_json = JSON.stringify(merged);
  await memberships.updatePermissionsJson(
    loaded.membership_id,
    permissions_json,
  );

  return {
    role: loaded.role,
    permissions: membershipPermissions({
      role: loaded.role,
      permissions_json,
    }),
  };
}
