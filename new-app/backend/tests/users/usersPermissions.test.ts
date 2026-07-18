/**
 * Users & Roles — GET/PATCH …/users/:userId/permissions
 * Source: users.py:get_permissions, patch_permissions
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { BusinessesRepository } from "../../src/repositories/businesses.repository";
import type { BusinessUsersRepository } from "../../src/repositories/businessUsers.repository";
import type { UserRow, MembershipRow } from "../../src/repositories/types";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import { ROLE_DEFAULTS } from "../../src/services/permissions.service";

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

function makeTarget(overrides: Record<string, unknown> = {}) {
  return {
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
    token_version: 1,
    permissions_json: null,
    ...overrides,
  };
}

describe("GET/PATCH /v1/businesses/:businessId/users/:userId/permissions", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let updatePermissionsJson: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    updatePermissionsJson = vi.fn().mockResolvedValue(undefined);
    users = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
    } as unknown as UsersRepository;
    memberships = {
      findByUserAndBusiness: vi.fn().mockResolvedValue(makeMembership()),
      listByUserId: vi.fn(),
      findById: vi.fn(),
      updatePermissionsJson,
    } as unknown as MembershipsRepository;
    businesses = {
      findById: vi.fn(),
    } as unknown as BusinessesRepository;
    businessUsers = {
      findMemberForPatch: vi.fn().mockResolvedValue(makeTarget()),
    } as unknown as BusinessUsersRepository;
  });

  function app() {
    return createApp({
      users,
      memberships,
      businesses,
      businessUsers,
    });
  }

  it("GET 200 returns role + staff defaults when permissions_json null", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/permissions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("staff");
    expect(res.body.permissions).toEqual(ROLE_DEFAULTS.staff);
  });

  it("GET 200 applies override from permissions_json", async () => {
    (
      businessUsers.findMemberForPatch as ReturnType<typeof vi.fn>
    ).mockResolvedValue(
      makeTarget({
        permissions_json: JSON.stringify({ purchase_edit: true }),
      }),
    );
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/permissions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body.permissions.purchase_edit).toBe(true);
    expect(res.body.permissions.user_manage).toBe(false);
  });

  it("GET 404 when missing", async () => {
    (
      businessUsers.findMemberForPatch as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/permissions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("User not found");
  });

  it("GET 403 manager", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/permissions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("PATCH 200 merges known keys and persists sparse JSON", async () => {
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/permissions`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        permissions: {
          purchase_edit: true,
          unknown_key: true,
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("staff");
    expect(res.body.permissions.purchase_edit).toBe(true);
    expect(updatePermissionsJson).toHaveBeenCalledWith(
      MEM_ID,
      expect.any(String),
    );
    const stored = JSON.parse(
      updatePermissionsJson.mock.calls[0]?.[1] as string,
    ) as Record<string, boolean>;
    expect(stored.purchase_edit).toBe(true);
    expect(stored).not.toHaveProperty("unknown_key");
  });

  it("PATCH 200 empty body is no-op merge still returns effective", async () => {
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/permissions`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.permissions).toEqual(ROLE_DEFAULTS.staff);
    expect(updatePermissionsJson).toHaveBeenCalledWith(MEM_ID, "{}");
  });

  it("PATCH admin can update owner target (no guardActorTarget)", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "admin" }));
    (
      businessUsers.findMemberForPatch as ReturnType<typeof vi.fn>
    ).mockResolvedValue(
      makeTarget({ role: "owner", name: "Biz Owner" }),
    );
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/permissions`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ permissions: { export_access: false } });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("owner");
    expect(res.body.permissions.export_access).toBe(false);
  });

  it("PATCH 403 manager", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .patch(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/permissions`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ permissions: { stock_edit: false } });
    expect(res.status).toBe(403);
  });
});
