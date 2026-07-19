/**
 * Users & Roles — POST …/users/bulk
 * Source: users.py:bulk_users · schemas/users.py:UserBulkIn
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
const TARGET2_ID = "cccccccc-dddd-eeee-ffff-000000000002";
const MISSING_ID = "dddddddd-eeee-ffff-0000-111111111111";
const MEM_ID = "cccccccc-dddd-eeee-ffff-000000000001";
const MEM2_ID = "dddddddd-eeee-ffff-0000-111111111112";

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

function memberLoad(
  id: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id,
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
    ...overrides,
  };
}

describe("POST /v1/businesses/:businessId/users/bulk", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let patchById: ReturnType<typeof vi.fn>;
  let insertLog: ReturnType<typeof vi.fn>;
  let updateRoleAndPermissions: ReturnType<typeof vi.fn>;
  let findMemberForPatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    patchById = vi.fn().mockResolvedValue(undefined);
    insertLog = vi.fn().mockResolvedValue(undefined);
    updateRoleAndPermissions = vi.fn().mockResolvedValue(undefined);
    findMemberForPatch = vi.fn().mockImplementation(async (_b, uid: string) => {
      if (uid === TARGET_ID) return memberLoad(TARGET_ID);
      if (uid === TARGET2_ID) {
        return memberLoad(TARGET2_ID, {
          name: "Staff Two",
          email: "staff2@example.com",
          membership_id: MEM2_ID,
          token_version: 3,
        });
      }
      return null;
    });
    users = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
      patchById,
    } as unknown as UsersRepository;
    memberships = {
      findByUserAndBusiness: vi.fn().mockResolvedValue(makeMembership()),
      listByUserId: vi.fn(),
      findById: vi.fn(),
      updateRoleAndPermissions,
    } as unknown as MembershipsRepository;
    businesses = {
      findById: vi.fn(),
    } as unknown as BusinessesRepository;
    businessUsers = {
      findMemberForPatch,
      insertActivityLog: insertLog,
    } as unknown as BusinessUsersRepository;
  });

  function app() {
    return createApp({
      users,
      memberships,
      businesses,
      businessUsers,
      runBulkInTransaction: async (fn) =>
        fn({ users, memberships, businessUsers }),
    });
  }

  it("activate clears deleted_at + is_blocked", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "activate" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: 1, failed: [] });
    expect(patchById).toHaveBeenCalledWith(TARGET_ID, {
      is_active: true,
      deleted_at: null,
      is_blocked: false,
    });
    expect(insertLog).not.toHaveBeenCalled();
  });

  it("deactivate only sets is_active false", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "deactivate" });
    expect(res.status).toBe(200);
    expect(res.body.updated).toBe(1);
    expect(patchById).toHaveBeenCalledWith(TARGET_ID, { is_active: false });
    expect(insertLog).not.toHaveBeenCalled();
  });

  it("block revokes tokens and logs USER_BLOCK", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "block" });
    expect(res.status).toBe(200);
    expect(patchById).toHaveBeenCalledWith(TARGET_ID, {
      is_blocked: true,
      token_version: 2,
    });
    expect(insertLog).toHaveBeenCalledWith(
      expect.objectContaining({ action_type: "USER_BLOCK" }),
    );
  });

  it("unblock sets is_blocked false", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "unblock" });
    expect(res.status).toBe(200);
    expect(patchById).toHaveBeenCalledWith(TARGET_ID, { is_blocked: false });
    expect(insertLog).not.toHaveBeenCalled();
  });

  it("delete soft-deletes, revokes, logs USER_DELETE", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "delete" });
    expect(res.status).toBe(200);
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

  it("set_role applies ROLE_DEFAULTS", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        user_ids: [TARGET_ID],
        action: "set_role",
        role: "manager",
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: 1, failed: [] });
    expect(updateRoleAndPermissions).toHaveBeenCalledWith(
      MEM_ID,
      "manager",
      JSON.stringify({ ...ROLE_DEFAULTS.manager }),
    );
  });

  it("set_role without role fails that id", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "set_role" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: 0, failed: [TARGET_ID] });
    expect(updateRoleAndPermissions).not.toHaveBeenCalled();
  });

  it("missing membership goes to failed; others still update", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        user_ids: [MISSING_ID, TARGET_ID],
        action: "activate",
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      updated: 1,
      failed: [MISSING_ID],
    });
    expect(patchById).toHaveBeenCalledTimes(1);
  });

  it("self deactivate/delete/block goes to failed", async () => {
    findMemberForPatch.mockResolvedValue(
      memberLoad(USER_ID, { role: "owner", membership_id: MEM_ID }),
    );
    for (const action of ["deactivate", "delete", "block"] as const) {
      patchById.mockClear();
      const res = await request(app())
        .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
        .set("Authorization", `Bearer ${bearer()}`)
        .send({ user_ids: [USER_ID], action });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ updated: 0, failed: [USER_ID] });
      expect(patchById).not.toHaveBeenCalled();
    }
  });

  it("guard failure goes to failed (not 403)", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "admin" }));
    findMemberForPatch.mockResolvedValue(
      memberLoad(TARGET_ID, { role: "owner" }),
    );
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "deactivate" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: 0, failed: [TARGET_ID] });
  });

  it("403 manager", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "activate" });
    expect(res.status).toBe(403);
  });

  it("422 empty user_ids", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [], action: "activate" });
    expect(res.status).toBe(422);
  });

  it("422 invalid action", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ user_ids: [TARGET_ID], action: "freeze" });
    expect(res.status).toBe(422);
  });

  it("422 role owner not allowed on bulk body", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users/bulk`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        user_ids: [TARGET_ID],
        action: "set_role",
        role: "owner",
      });
    expect(res.status).toBe(422);
  });
});
