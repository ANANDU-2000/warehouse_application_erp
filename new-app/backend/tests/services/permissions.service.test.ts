import { describe, it, expect } from "vitest";
import {
  ROLE_DEFAULTS,
  effectivePermissions,
  membershipPermissions,
  actorCanManageTarget,
  parsePermissionsJson,
} from "../../src/services/permissions.service";

describe("permissions.service (permissions.py)", () => {
  it("owner and admin get all keys true", () => {
    expect(ROLE_DEFAULTS.owner?.user_manage).toBe(true);
    expect(ROLE_DEFAULTS.admin?.delete_access).toBe(true);
    expect(ROLE_DEFAULTS.staff?.reports_access).toBe(false);
    expect(ROLE_DEFAULTS.manager?.analytics_access).toBe(true);
    expect(ROLE_DEFAULTS.manager?.user_manage).toBe(false);
  });

  it("unknown role falls back to staff defaults", () => {
    const perms = effectivePermissions("unknown_role", null);
    expect(perms).toEqual(ROLE_DEFAULTS.staff);
  });

  it("applies boolean overrides", () => {
    const perms = effectivePermissions("staff", { reports_access: true });
    expect(perms.reports_access).toBe(true);
    expect(perms.user_manage).toBe(false);
  });

  it("maps delete_items alias to delete_access when delete_access absent", () => {
    const perms = effectivePermissions("staff", { delete_items: true });
    expect(perms.delete_access).toBe(true);
  });

  it("does not override delete_access when both present", () => {
    const perms = effectivePermissions("staff", {
      delete_items: true,
      delete_access: false,
    });
    expect(perms.delete_access).toBe(false);
  });

  it("membershipPermissions parses JSON string from DDL column", () => {
    const perms = membershipPermissions({
      role: "staff",
      permissions_json: JSON.stringify({ export_access: true }),
    });
    expect(perms.export_access).toBe(true);
  });

  it("parsePermissionsJson returns null for invalid JSON", () => {
    expect(parsePermissionsJson("{not-json")).toBeNull();
    expect(parsePermissionsJson(null)).toBeNull();
  });

  it("actorCanManageTarget: admin cannot manage owner", () => {
    expect(actorCanManageTarget("admin", "owner")).toBe(false);
    expect(actorCanManageTarget("owner", "admin")).toBe(true);
    expect(actorCanManageTarget("admin", "staff")).toBe(true);
  });
});
