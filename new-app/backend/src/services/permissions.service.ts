/**
 * Role templates and per-membership permission overrides.
 * Source: source-app/backend/app/services/permissions.py — port 1:1.
 * DDL stores permissions_json as NVARCHAR — parse JSON string when present.
 */
import type { MembershipRow } from "../repositories/types";

export const PERMISSION_KEYS = [
  "stock_edit",
  "purchase_create",
  "purchase_edit",
  "barcode_print",
  "reports_access",
  "export_access",
  "user_manage",
  "delete_access",
  "analytics_access",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionsMap = Record<PermissionKey, boolean>;

const OWNER_ADMIN: PermissionsMap = Object.fromEntries(
  PERMISSION_KEYS.map((k) => [k, true]),
) as PermissionsMap;

export const ROLE_DEFAULTS: Record<string, PermissionsMap> = {
  owner: { ...OWNER_ADMIN },
  admin: { ...OWNER_ADMIN },
  manager: {
    stock_edit: true,
    purchase_create: true,
    purchase_edit: true,
    reports_access: true,
    barcode_print: true,
    export_access: true,
    user_manage: false,
    delete_access: false,
    analytics_access: true,
  },
  staff: {
    stock_edit: true,
    purchase_create: true,
    purchase_edit: false,
    reports_access: false,
    barcode_print: true,
    export_access: false,
    user_manage: false,
    delete_access: false,
    analytics_access: false,
  },
};

export function effectivePermissions(
  role: string,
  overrides: Record<string, unknown> | null | undefined,
): PermissionsMap {
  const base: PermissionsMap = {
    ...(ROLE_DEFAULTS[role] ?? ROLE_DEFAULTS.staff),
  };
  if (overrides) {
    const merged: Record<string, unknown> = { ...overrides };
    if ("delete_items" in merged && !("delete_access" in merged)) {
      merged.delete_access = merged.delete_items;
    }
    for (const k of PERMISSION_KEYS) {
      if (k in merged && typeof merged[k] === "boolean") {
        base[k] = merged[k];
      }
    }
  }
  return base;
}

/** Parse membership.permissions_json (string | already object | null). */
export function parsePermissionsJson(
  raw: string | Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (raw == null || raw === "") {
    return null;
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return null;
    } catch {
      return null;
    }
  }
  return null;
}

export function membershipPermissions(membership: {
  role: string;
  permissions_json: MembershipRow["permissions_json"];
}): PermissionsMap {
  const raw = parsePermissionsJson(membership.permissions_json);
  return effectivePermissions(membership.role, raw);
}

/** Admin cannot modify owner memberships. */
export function actorCanManageTarget(actorRole: string, targetRole: string): boolean {
  if (targetRole === "owner" && actorRole === "admin") {
    return false;
  }
  return true;
}
