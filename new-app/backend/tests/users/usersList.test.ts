/**
 * Users & Roles — GET …/users list slice.
 * Source: source-app/backend/app/routers/users.py:list_users, _user_row
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
import { parseIncludeInactive } from "../../src/services/usersList.service";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";
const STAFF_ID = "bbbbbbbb-cccc-dddd-eeee-ffffffffffff";

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

function makeBusiness(overrides: Partial<BusinessRow> = {}): BusinessRow {
  return {
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
    ...overrides,
  };
}

describe("parseIncludeInactive", () => {
  it("defaults false — Query(False)", () => {
    expect(parseIncludeInactive(undefined)).toBe(false);
    expect(parseIncludeInactive("")).toBe(false);
  });

  it("accepts true/1 and false/0", () => {
    expect(parseIncludeInactive("true")).toBe(true);
    expect(parseIncludeInactive("1")).toBe(true);
    expect(parseIncludeInactive(true)).toBe(true);
    expect(parseIncludeInactive("false")).toBe(false);
    expect(parseIncludeInactive("0")).toBe(false);
  });

  it("rejects invalid", () => {
    expect(() => parseIncludeInactive("maybe")).toThrow();
  });
});

describe("GET /v1/businesses/:businessId/users", () => {
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
      findById: vi.fn().mockResolvedValue(makeBusiness()),
    } as unknown as BusinessesRepository;
    businessUsers = {
      listForBusiness: vi.fn().mockResolvedValue([
        {
          id: STAFF_ID,
          name: "Staff One",
          phone: "9876543210",
          email: "staff@example.com",
          username: "staff1",
          role: "staff",
          is_active: true,
          is_blocked: false,
          last_login_at: new Date("2026-07-01T10:00:00Z"),
          last_active_at: new Date("2026-07-18T08:00:00Z"),
          notes: "floor",
          created_at: new Date("2025-01-01T00:00:00Z"),
        },
      ]),
      todayStats: vi.fn().mockResolvedValue({
        scans: 3,
        stock_updates: 1,
        items_created: 0,
      }),
      activityCount7d: vi.fn().mockResolvedValue(12),
    } as unknown as BusinessUsersRepository;
  });

  it("returns UserListOut array with today_stats and warehouse_name", async () => {
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: STAFF_ID,
      name: "Staff One",
      email: "staff@example.com",
      username: "staff1",
      role: "staff",
      is_active: true,
      is_blocked: false,
      warehouse_name: "Main Warehouse",
      activity_count_7d: 12,
      notes: "floor",
      today_stats: { scans: 3, stock_updates: 1, items_created: 0 },
    });
    expect(res.body[0].last_login_at).toBe("2026-07-01T10:00:00.000Z");
    expect(businessUsers.listForBusiness).toHaveBeenCalledWith(BIZ_ID, false);
  });

  it("passes include_inactive=true to listForBusiness", async () => {
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users`)
      .query({ include_inactive: "true" })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(businessUsers.listForBusiness).toHaveBeenCalledWith(BIZ_ID, true);
  });

  it("403 when role is staff", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "staff" }));
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
    expect(res.body.detail).toContain("Required roles");
  });

  it("allows manager role", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
  });

  it("401 without auth", async () => {
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app).get(`/v1/businesses/${BIZ_ID}/users`);
    expect(res.status).toBe(401);
  });

  it("422 on invalid include_inactive", async () => {
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users`)
      .query({ include_inactive: "maybe" })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
  });
});
