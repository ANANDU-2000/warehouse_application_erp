/**
 * Users & Roles — GET …/users/active-sessions
 * Source: users.py:active_sessions
 * Roles: owner, manager, super_admin — admin intentionally excluded.
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
const NOW = new Date("2025-06-15T12:00:00.000Z");
const EXPECTED_CUTOFF = new Date(NOW.getTime() - 5 * 60 * 1000);

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

function makeMemberRow() {
  return {
    id: TARGET_ID,
    name: "Staff One",
    phone: "9876543210",
    email: "staff@example.com",
    username: "staff1",
    role: "staff",
    is_active: true,
    is_blocked: false,
    last_login_at: new Date("2025-06-15T11:58:00Z"),
    last_active_at: new Date("2025-06-15T11:58:00Z"),
    notes: null,
    created_at: new Date("2025-01-01T00:00:00Z"),
  };
}

describe("GET /v1/businesses/:businessId/users/active-sessions", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let listActiveSessions: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    listActiveSessions = vi.fn().mockResolvedValue([makeMemberRow()]);
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
      findById: vi.fn().mockResolvedValue({
        id: BIZ_ID,
        name: "Warehouse A",
      }),
    } as unknown as BusinessesRepository;
    businessUsers = {
      listActiveSessions,
      todayStats: vi.fn().mockResolvedValue({
        scans: 1,
        stock_updates: 0,
        items_created: 0,
      }),
      activityCount7d: vi.fn().mockResolvedValue(2),
    } as unknown as BusinessUsersRepository;
  });

  function app() {
    return createApp({
      users,
      memberships,
      businesses,
      businessUsers,
      activeSessionsNow: NOW,
    });
  }

  it("200 returns UserListOut and passes cutoff = now - 5m", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/active-sessions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(TARGET_ID);
    expect(res.body[0].warehouse_name).toBe("Warehouse A");
    expect(res.body[0].today_stats.scans).toBe(1);
    expect(res.body[0].activity_count_7d).toBe(2);
    expect(listActiveSessions).toHaveBeenCalledWith(BIZ_ID, EXPECTED_CUTOFF);
  });

  it("200 empty", async () => {
    listActiveSessions.mockResolvedValue([]);
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/active-sessions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("200 manager allowed", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/active-sessions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
  });

  it("403 admin excluded (legacy asymmetry)", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "admin" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/active-sessions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("403 staff", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "staff" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/active-sessions`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });
});
