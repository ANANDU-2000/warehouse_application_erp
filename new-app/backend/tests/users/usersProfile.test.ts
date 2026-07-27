/**
 * Users & Roles — GET …/users/:userId profile slice.
 * Source: users.py:get_user, _user_row(profile=True)
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

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";
const TARGET_ID = "bbbbbbbb-cccc-dddd-eeee-ffffffffffff";

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

describe("GET /v1/businesses/:businessId/users/:userId", () => {
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
      findMemberByUserId: vi.fn().mockResolvedValue({
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
      }),
      todayStats: vi.fn().mockResolvedValue({
        scans: 1,
        stock_updates: 2,
        items_created: 0,
      }),
      activityCount7d: vi.fn().mockResolvedValue(5),
      purchases7d: vi.fn().mockResolvedValue(3),
      stockUpdates7d: vi.fn().mockResolvedValue(4),
      profileStats: vi.fn().mockResolvedValue({
        stock_edits_total: 10,
        purchases_total: 8,
        scans_total: 20,
        items_created_total: 2,
      }),
      listForBusiness: vi.fn(),
      insertActivityLog: vi.fn(),
    } as unknown as BusinessUsersRepository;
  });

  it("returns UserProfileOut with stats and 7d fields", async () => {
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: TARGET_ID,
      name: "Staff One",
      email: "staff@example.com",
      login_email: "staff@example.com",
      role: "staff",
      warehouse_name: "Main Warehouse",
      activity_count_7d: 5,
      purchases_7d: 3,
      stock_updates_7d: 4,
      today_stats: { scans: 1, stock_updates: 2, items_created: 0 },
      stats: {
        stock_edits_total: 10,
        purchases_total: 8,
        scans_total: 20,
        items_created_total: 2,
      },
    });
  });

  it("404 User not found", async () => {
    (
      businessUsers.findMemberByUserId as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("User not found");
  });

  it("allows manager", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
  });

  it("403 for staff role", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "staff" }));
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("401 without auth", async () => {
    const app = createApp({ users, memberships, businesses, businessUsers });
    const res = await request(app).get(
      `/v1/businesses/${BIZ_ID}/users/${TARGET_ID}`,
    );
    expect(res.status).toBe(401);
  });
});
