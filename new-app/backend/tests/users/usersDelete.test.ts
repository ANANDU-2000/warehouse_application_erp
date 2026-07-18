/**
 * Users & Roles — DELETE …/users/:userId
 * Source: users.py:delete_user
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

describe("DELETE /v1/businesses/:businessId/users/:userId", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let patchById: ReturnType<typeof vi.fn>;
  let insertLog: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    patchById = vi.fn().mockResolvedValue(undefined);
    insertLog = vi.fn().mockResolvedValue(undefined);
    users = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
      patchById,
    } as unknown as UsersRepository;
    memberships = {
      findByUserAndBusiness: vi.fn().mockResolvedValue(makeMembership()),
      listByUserId: vi.fn(),
      findById: vi.fn(),
    } as unknown as MembershipsRepository;
    businesses = {
      findById: vi.fn(),
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
        token_version: 1,
      }),
      insertActivityLog: insertLog,
    } as unknown as BusinessUsersRepository;
  });

  function app() {
    return createApp({
      users,
      memberships,
      businesses,
      businessUsers,
      runDeleteInTransaction: async (fn) => fn({ users, businessUsers }),
    });
  }

  it("204 soft-deletes, revokes tokens, logs USER_DELETE", async () => {
    const res = await request(app())
      .delete(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(patchById).toHaveBeenCalledWith(
      TARGET_ID,
      expect.objectContaining({
        is_active: false,
        token_version: 2,
      }),
    );
    const arg = patchById.mock.calls[0]?.[1] as { deleted_at?: Date };
    expect(arg.deleted_at).toBeInstanceOf(Date);
    expect(insertLog).toHaveBeenCalledWith(
      expect.objectContaining({ action_type: "USER_DELETE" }),
    );
  });

  it("400 cannot delete self", async () => {
    (
      businessUsers.findMemberForPatch as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: USER_ID,
      name: "Owner",
      phone: null,
      email: "owner@example.com",
      username: "owner",
      role: "owner",
      is_active: true,
      is_blocked: false,
      last_login_at: null,
      last_active_at: null,
      notes: null,
      created_at: new Date("2024-01-01T00:00:00Z"),
      membership_id: MEM_ID,
      token_version: 0,
    });
    const res = await request(app())
      .delete(`/v1/businesses/${BIZ_ID}/users/${USER_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(400);
    expect(res.body.detail).toBe("Cannot delete your own account");
  });

  it("404 when missing", async () => {
    (
      businessUsers.findMemberForPatch as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const res = await request(app())
      .delete(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(404);
  });

  it("403 manager", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .delete(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("403 admin cannot delete owner", async () => {
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
      .delete(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });
});
