/**
 * Users & Roles — GET …/users/:userId/ledger
 * Source: users.py:user_ledger
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
import {
  buildLedgerEntries,
  groupLedgerEntries,
} from "../../src/services/usersLedger.service";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";
const TARGET_ID = "bbbbbbbb-cccc-dddd-eeee-ffffffffffff";
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

describe("buildLedgerEntries / groupLedgerEntries", () => {
  const now = new Date("2025-06-15T15:00:00.000Z");

  it("merges, sorts desc, trims to limit", () => {
    const trimmed = buildLedgerEntries(
      [
        {
          created_at: new Date("2025-06-15T10:00:00Z"),
          action_type: "SCAN",
          item_name: "A",
          details: '{"x":1}',
        },
      ],
      [
        {
          updated_at: new Date("2025-06-15T12:00:00Z"),
          item_name: "Rice",
          old_qty: 1,
          new_qty: 2,
        },
      ],
      1,
    );
    expect(trimmed).toHaveLength(1);
    expect(trimmed[0]!.kind).toBe("stock");
    expect(trimmed[0]!.title).toBe("STOCK_UPDATE");
  });

  it("grouped buckets drop older than week", () => {
    const entries = buildLedgerEntries(
      [
        {
          created_at: new Date("2025-06-15T10:00:00Z"),
          action_type: "LOGIN",
          item_name: null,
          details: null,
        },
        {
          created_at: new Date("2025-06-14T10:00:00Z"),
          action_type: "SCAN",
          item_name: "B",
          details: null,
        },
        {
          created_at: new Date("2025-06-10T10:00:00Z"),
          action_type: "OLD",
          item_name: null,
          details: null,
        },
        {
          created_at: new Date("2025-06-01T10:00:00Z"),
          action_type: "TOO_OLD",
          item_name: null,
          details: null,
        },
      ],
      [],
      80,
    );
    const g = groupLedgerEntries(entries, now);
    expect(g.today.map((e) => e.title)).toEqual(["LOGIN"]);
    expect(g.yesterday.map((e) => e.title)).toEqual(["SCAN"]);
    expect(g.this_week.map((e) => e.title)).toEqual(["OLD"]);
  });
});

describe("GET /v1/businesses/:businessId/users/:userId/ledger", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let listActivityLogByUser: ReturnType<typeof vi.fn>;
  let listStockAdjustmentsByUser: ReturnType<typeof vi.fn>;
  const ledgerNow = new Date("2025-06-15T15:00:00.000Z");

  beforeEach(() => {
    listActivityLogByUser = vi.fn().mockResolvedValue([
      {
        created_at: new Date("2025-06-15T10:00:00Z"),
        action_type: "SCAN",
        item_name: "Item A",
        details: '{"k":"v"}',
      },
    ]);
    listStockAdjustmentsByUser = vi.fn().mockResolvedValue([
      {
        id: "eeeeeeee-ffff-0000-1111-222222222222",
        item_id: ITEM_ID,
        item_name: "Rice",
        old_qty: 5,
        new_qty: 3,
        adjustment_type: "manual",
        reason: null,
        updated_at: new Date("2025-06-15T12:00:00Z"),
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
      listActivityLogByUser,
      listStockAdjustmentsByUser,
    } as unknown as BusinessUsersRepository;
  });

  function app() {
    return createApp({
      users,
      memberships,
      businesses,
      businessUsers,
      ledgerNow,
    });
  }

  it("200 flat array merges activity+stock sorted", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/ledger`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].kind).toBe("stock");
    expect(res.body[0].title).toBe("STOCK_UPDATE");
    expect(res.body[0].details).toEqual({ old_qty: 5, new_qty: 3 });
    expect(res.body[1].kind).toBe("activity");
    expect(res.body[1].title).toBe("SCAN");
    expect(res.body[1].details).toEqual({ k: "v" });
    expect(listActivityLogByUser).toHaveBeenCalledWith(BIZ_ID, TARGET_ID, 80);
    expect(listStockAdjustmentsByUser).toHaveBeenCalledWith(
      BIZ_ID,
      TARGET_ID,
      80,
    );
  });

  it("200 empty array", async () => {
    listActivityLogByUser.mockResolvedValue([]);
    listStockAdjustmentsByUser.mockResolvedValue([]);
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/ledger`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("200 grouped shape", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/ledger?grouped=true`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(false);
    expect(res.body).toHaveProperty("today");
    expect(res.body).toHaveProperty("yesterday");
    expect(res.body).toHaveProperty("this_week");
    expect(res.body.today).toHaveLength(2);
  });

  it("200 admin and manager", async () => {
    for (const role of ["admin", "manager"] as const) {
      (
        memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
      ).mockResolvedValue(makeMembership({ role }));
      const res = await request(app())
        .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/ledger`)
        .set("Authorization", `Bearer ${bearer()}`);
      expect(res.status).toBe(200);
    }
  });

  it("403 staff", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "staff" }));
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/ledger`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("422 for limit=0", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/ledger?limit=0`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
  });

  it("422 for invalid grouped", async () => {
    const res = await request(app())
      .get(`/v1/businesses/${BIZ_ID}/users/${TARGET_ID}/ledger?grouped=maybe`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
  });
});
