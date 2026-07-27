/**
 * Users & Roles — GET …/users/:userId/credentials
 * Source: users.py:user_credentials
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

const CREDENTIALS_NOTE =
  "Passwords cannot be retrieved. Use reset-password to issue a new one.";

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
    ...overrides,
  };
}

describe("GET /v1/businesses/:businessId/users/:userId/credentials", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;

  beforeEach(() => {
    users = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
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

  it("200 returns username, login_email, phone, note — no password", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/credentials`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      username: "staff1",
      login_email: "staff@example.com",
      phone: "9876543210",
      note: CREDENTIALS_NOTE,
    });
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("password_hash");
    expect(res.body).not.toHaveProperty("new_password");
  });

  it("404 when missing", async () => {
    (
      businessUsers.findMemberForPatch as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/credentials`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("User not found");
  });

  it("403 manager", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/credentials`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("200 admin can read credentials", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "admin" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/credentials`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("staff1");
  });
});
