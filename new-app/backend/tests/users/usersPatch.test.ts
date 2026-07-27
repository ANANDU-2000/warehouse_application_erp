/**
 * Users & Roles — PATCH …/users/:userId
 * Source: users.py:patch_user, _guard_actor_target
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { BusinessesRepository } from "../../src/repositories/businesses.repository";
import type { BusinessUsersRepository } from "../../src/repositories/businessUsers.repository";
import type {
  UserRow,
  MembershipRow,
  BusinessRow,
} from "../../src/repositories/types";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import { ROLE_DEFAULTS } from "../../src/services/permissions.service";
import { guardActorTarget } from "../../src/services/usersPatch.service";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";
const TARGET_ID = "bbbbbbbb-cccc-dddd-eeee-ffffffffffff";
const MEM_ID = "cccccccc-dddd-eeee-ffff-000000000001";

function bearer(): string {
  return createAccessToken(USER_ID, getJwtSettings(), 0);
}

function makeUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: USER_ID,
    email: "owner@example.com",
    username: "owner",
    password_hash: "$2b$12$x",
    google_sub: null,
    phone: null,
    name: "Owner",
    is_super_admin: false,
    ai_monthly_token_budget: null,
    ai_tokens_used_month: 0,
    is_active: true,
    is_blocked: false,
    token_version: 0,
    last_login_at: null,
    last_active_at: null,
    device_info: null,
    created_by: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
    deleted_at: null,
    notes: null,
    ...overrides,
  };
}

function makeMembership(overrides: Partial<MembershipRow> = {}): MembershipRow {
  return {
    id: "99999999-8888-7777-6666-555555555555",
    user_id: USER_ID,
    business_id: BIZ_ID,
    role: "owner",
    permissions_json: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("guardActorTarget", () => {
  it("blocks admin modifying owner", () => {
    expect(() =>
      guardActorTarget({
        actorRole: "admin",
        targetRole: "owner",
        actorIsSuperAdmin: false,
      }),
    ).toThrow(/cannot modify|protected/i);
  });

  it("super_admin bypasses", () => {
    expect(() =>
      guardActorTarget({
        actorRole: "admin",
        targetRole: "owner",
        actorIsSuperAdmin: true,
      }),
    ).not.toThrow();
  });
});

describe("PATCH /v1/businesses/:businessId/users/:userId", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let patchById: ReturnType<typeof vi.fn>;
  let updateRole: ReturnType<typeof vi.fn>;
  let insertLog: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    patchById = vi.fn().mockResolvedValue(undefined);
    updateRole = vi.fn().mockResolvedValue(undefined);
    insertLog = vi.fn().mockResolvedValue(undefined);
    users = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
      emailExistsActiveExcluding: vi.fn().mockResolvedValue(false),
      patchById,
    } as unknown as UsersRepository;
    memberships = {
      findByUserAndBusiness: vi.fn().mockResolvedValue(makeMembership()),
      listByUserId: vi.fn(),
      findById: vi.fn(),
      updateRoleAndPermissions: updateRole,
    } as unknown as MembershipsRepository;
    businesses = {
      findById: vi.fn().mockResolvedValue({
        id: BIZ_ID,
        name: "Main Warehouse",
        branding_title: null,
        branding_logo_url: null,
        gst_number: null,
        address: null,
        phone: null,
        contact_email: null,
        default_currency: "INR",
        created_at: new Date("2024-01-01T00:00:00Z"),
      } satisfies BusinessRow),
    } as unknown as BusinessesRepository;
    businessUsers = {
      findMemberForPatch: vi.fn().mockResolvedValue({
        id: TARGET_ID,
        name: "Staff One",
        phone: "9876543210",
        email: "staff@example.com",
        username: "staff1",
        role: "staff",
        is_active: true,
        is_blocked: false,
        last_login_at: null,
        last_active_at: null,
        notes: null,
        created_at: new Date("2025-01-01T00:00:00Z"),
        membership_id: MEM_ID,
        token_version: 2,
      }),
      todayStats: vi.fn().mockResolvedValue({
        scans: 0,
        stock_updates: 0,
        items_created: 0,
      }),
      activityCount7d: vi.fn().mockResolvedValue(0),
      insertActivityLog: insertLog,
      listForBusiness: vi.fn(),
      findMemberByUserId: vi.fn(),
    } as unknown as BusinessUsersRepository;
  });

  function app() {
    return createApp({
      users,
      memberships,
      businesses,
      businessUsers,
      runPatchInTransaction: async (fn) =>
        fn({ users, memberships, businessUsers }),
    });
  }

  it("200 updates name and returns UserListOut", async () => {
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ full_name: "Staff Renamed" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Staff Renamed");
    expect(res.body.warehouse_name).toBe("Main Warehouse");
    expect(patchById).toHaveBeenCalledWith(
      TARGET_ID,
      expect.objectContaining({ name: "Staff Renamed" }),
    );
  });

  it("role change resets permissions to ROLE_DEFAULTS", async () => {
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ role: "manager" });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("manager");
    expect(updateRole).toHaveBeenCalledWith(
      MEM_ID,
      "manager",
      JSON.stringify({ ...ROLE_DEFAULTS.manager }),
    );
  });

  it("block bumps token_version and logs USER_BLOCK", async () => {
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ is_blocked: true });
    expect(res.status).toBe(200);
    expect(patchById).toHaveBeenCalledWith(
      TARGET_ID,
      expect.objectContaining({ is_blocked: true, token_version: 3 }),
    );
    expect(insertLog).toHaveBeenCalledWith(
      expect.objectContaining({ action_type: "USER_BLOCK" }),
    );
  });

  it("409 email conflict", async () => {
    (
      users.emailExistsActiveExcluding as ReturnType<typeof vi.fn>
    ).mockResolvedValue(true);
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ email: "taken@example.com" });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe("Email already registered");
  });

  it("404 when target missing", async () => {
    (
      businessUsers.findMemberForPatch as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ full_name: "X" });
    expect(res.status).toBe(404);
  });

  it("403 manager cannot patch", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ full_name: "X" });
    expect(res.status).toBe(403);
  });

  it("403 admin cannot modify owner target", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "admin" }));
    (
      businessUsers.findMemberForPatch as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: TARGET_ID,
      name: "Biz Owner",
      phone: null,
      email: "bizowner@example.com",
      username: "bizowner",
      role: "owner",
      is_active: true,
      is_blocked: false,
      last_login_at: null,
      last_active_at: null,
      notes: null,
      created_at: new Date("2025-01-01T00:00:00Z"),
      membership_id: MEM_ID,
      token_version: 0,
    });
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ full_name: "Nope" });
    expect(res.status).toBe(403);
    expect(res.body.detail).toMatch(/cannot modify|protected/i);
  });
});
