/**
 * Users & Roles — GET …/users/:userId/purchases
 * Source: users.py:user_purchases
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
import { normalizePurchaseDate } from "../../src/services/usersPurchases.service";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";
const TARGET_ID = "bbbbbbbb-cccc-dddd-eeee-ffffffffffff";
const PUR_ID = "ffffffff-0000-1111-2222-333333333333";

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

describe("normalizePurchaseDate", () => {
  it("date-only string → UTC midnight", () => {
    expect(normalizePurchaseDate("2025-06-15", null)).toBe(
      "2025-06-15T00:00:00.000Z",
    );
  });

  it("null purchase_date falls back to created_at", () => {
    expect(
      normalizePurchaseDate(null, new Date("2025-01-02T15:30:00Z")),
    ).toBe("2025-01-02T15:30:00.000Z");
  });

  it("Date (SQL DATE) → UTC midnight of calendar day", () => {
    expect(
      normalizePurchaseDate(new Date("2025-06-15T00:00:00.000Z"), null),
    ).toBe("2025-06-15T00:00:00.000Z");
  });
});

describe("GET /v1/businesses/:businessId/users/:userId/purchases", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let listPurchasesByUser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    listPurchasesByUser = vi.fn().mockResolvedValue([
      {
        id: PUR_ID,
        human_id: "PO-001",
        purchase_date: "2025-06-15",
        created_at: new Date("2025-06-16T10:00:00Z"),
        status: "completed",
        total_amount: 1250.5,
        supplier_name: "Acme Supply",
        item_count: 3,
      },
    ]);
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
      listPurchasesByUser,
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

  it("200 returns UserPurchaseBrief shape", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/purchases`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: PUR_ID,
        human_id: "PO-001",
        purchase_date: "2025-06-15T00:00:00.000Z",
        status: "completed",
        total_amount: 1250.5,
        supplier_name: "Acme Supply",
        item_count: 3,
      },
    ]);
    expect(listPurchasesByUser).toHaveBeenCalledWith(BIZ_ID, TARGET_ID, 50);
  });

  it("200 empty array", async () => {
    listPurchasesByUser.mockResolvedValue([]);
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/purchases`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("200 admin allowed", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "admin" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/purchases`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
  });

  it("200 manager allowed", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/purchases`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
  });

  it("403 staff", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "staff" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/purchases`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("passes limit=100", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/purchases?limit=100`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(listPurchasesByUser).toHaveBeenCalledWith(BIZ_ID, TARGET_ID, 100);
  });

  it("422 for limit=101", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/purchases?limit=101`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
  });
});
