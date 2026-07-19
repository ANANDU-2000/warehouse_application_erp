/**
 * Users & Roles — GET …/users/:userId/stock-adjustments
 * Source: users.py:user_stock_adjustments
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
const LOG_ID = "eeeeeeee-ffff-0000-1111-222222222222";
const ITEM_ID = "dddddddd-eeee-ffff-0000-111111111111";

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

describe("GET /v1/businesses/:businessId/users/:userId/stock-adjustments", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let listStockAdjustmentsByUser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    listStockAdjustmentsByUser = vi.fn().mockResolvedValue([
      {
        id: LOG_ID,
        item_id: ITEM_ID,
        item_name: "Rice 25kg",
        old_qty: 10,
        new_qty: 8.5,
        adjustment_type: "manual",
        reason: "damage",
        updated_at: new Date("2025-06-01T12:00:00Z"),
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
      listStockAdjustmentsByUser,
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

  it("200 returns StockAdjustmentOut shape", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/stock-adjustments`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: LOG_ID,
        item_id: ITEM_ID,
        item_name: "Rice 25kg",
        old_qty: 10,
        new_qty: 8.5,
        adjustment_type: "manual",
        reason: "damage",
        updated_at: "2025-06-01T12:00:00.000Z",
      },
    ]);
    expect(listStockAdjustmentsByUser).toHaveBeenCalledWith(
      BIZ_ID,
      TARGET_ID,
      50,
    );
  });

  it("200 empty array", async () => {
    listStockAdjustmentsByUser.mockResolvedValue([]);
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/stock-adjustments`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("200 manager allowed", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/stock-adjustments`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
  });

  it("403 admin excluded (legacy asymmetry)", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "admin" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/stock-adjustments`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("403 staff", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "staff" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/stock-adjustments`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("passes custom limit", async () => {
    const res = await request(app())
      .get(
        `/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/stock-adjustments?limit=25`,
      )
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(listStockAdjustmentsByUser).toHaveBeenCalledWith(
      BIZ_ID,
      TARGET_ID,
      25,
    );
  });

  it("422 for limit=0", async () => {
    const res = await request(app())
      .get(
        `/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/stock-adjustments?limit=0`,
      )
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
  });
});
