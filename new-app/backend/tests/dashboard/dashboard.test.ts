/**
 * Dashboard + home-overview Subagent 1 tests.
 * Source: dashboard.py, reports_trade.py, trade_query.py
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { DashboardRepository } from "../../src/repositories/dashboard.repository";
import type { HomeOverviewRepository } from "../../src/repositories/homeOverview.repository";
import type { UserRow, MembershipRow } from "../../src/repositories/types";
import { createAccessToken, getJwtSettings } from "../../src/services/jwtTokens.service";
import {
  pendingAmount,
  buildCategoriesFromItems,
  categoryKeyFromItemName,
} from "../../src/services/dashboard.service";
import { snapshotProfitFields } from "../../src/services/homeOverview.service";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";

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

describe("dashboard formulas", () => {
  it("pending = max(0, purchase - paid) — Formula source: dashboard.py", () => {
    expect(pendingAmount(100, 40)).toBe(60);
    expect(pendingAmount(40, 100)).toBe(0);
  });

  it("categoryKeyFromItemName splits on space — Formula source: dashboard.py cat_map", () => {
    expect(categoryKeyFromItemName("Rice 25kg")).toBe("Rice");
    expect(categoryKeyFromItemName("Plain")).toBe("General");
  });

  it("buildCategoriesFromItems rolls top items into ≤12 cats", () => {
    const cats = buildCategoriesFromItems([
      { name: "Rice A", amount: 50, profit: 10, total_qty: 2 },
      { name: "Rice B", amount: 30, profit: 5, total_qty: 1 },
      { name: "Oil X", amount: 20, profit: 2, total_qty: 1 },
    ]);
    expect(cats[0]?.name).toBe("Rice");
    expect(cats[0]?.amount).toBe(80);
  });
});

describe("home-overview profit formulas", () => {
  it("profit_percent — Formula source: reports_trade.py:_compute_trade_dashboard_snapshot_payload", () => {
    const a = snapshotProfitFields(200, 250);
    expect(a.total_landing).toBe(200);
    expect(a.total_profit).toBe(50);
    expect(a.profit_percent).toBe(25);

    const b = snapshotProfitFields(0, 10);
    expect(b.profit_percent).toBeNull();
  });
});

describe("GET /v1/businesses/:businessId/dashboard", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let dashboard: DashboardRepository;

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
    dashboard = {
      monthLineAgg: vi.fn().mockResolvedValue({
        line_total: 1000,
        purchase_count: 2,
      }),
      monthPaidTotal: vi.fn().mockResolvedValue(400),
      monthLineProfit: vi.fn().mockResolvedValue(150),
      topItemSpend: vi.fn().mockResolvedValue([
        { item_name: "Rice Bag", spend: 1000, pf: 150, tq: 10 },
      ]),
    } as unknown as DashboardRepository;
  });

  it("returns month DashboardOut", async () => {
    const app = createApp({ users, memberships, dashboard });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/dashboard`)
      .query({ month: "2026-01" })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      month: "2026-01",
      total_purchase: 1000,
      total_paid: 400,
      pending: 600,
      total_profit: 150,
      purchase_count: 2,
      degraded: false,
    });
    expect(res.body.items[0].name).toBe("Rice Bag");
    expect(res.body.categories[0].name).toBe("Rice");
  });

  it("422 when month missing/invalid", async () => {
    const app = createApp({ users, memberships, dashboard });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/dashboard`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
  });
});

describe("GET /v1/businesses/:businessId/reports/home-overview", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let homeOverview: HomeOverviewRepository;

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
    homeOverview = {
      snapshotSums: vi.fn().mockResolvedValue({
        deals: 3,
        total_purchase: 200,
        total_qty: 15,
        total_selling: 250,
      }),
      unitRollups: vi.fn().mockResolvedValue({
        total_bags: 5,
        total_boxes: 0,
        total_tins: 0,
        total_kg: 100,
      }),
      categoryNest: vi.fn().mockResolvedValue([
        {
          category_id: "_uncat",
          category_name: "Uncategorised",
          item_name: "Item",
          unit: "BAG",
          unit_type: "bag",
          amount: 200,
          qty: 15,
          catalog_item_id: null,
        },
      ]),
      pendingDeliveryCount: vi.fn().mockResolvedValue(1),
      supplierCount: vi.fn().mockResolvedValue(2),
      brokerCount: vi.fn().mockResolvedValue(0),
      receivedDeliveryCount: vi.fn().mockResolvedValue(1),
      negativeStockCount: vi.fn().mockResolvedValue(0),
      inventorySummary: vi.fn().mockResolvedValue({
        total_value_inr: 500,
        bags: 3,
        boxes: 0,
        tins: 0,
        kg: 0,
        item_count: 3,
      }),
    } as unknown as HomeOverviewRepository;
  });

  it("returns snapshot summary with profit fields", async () => {
    const app = createApp({ users, memberships, homeOverview });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/reports/home-overview`)
      .query({ from: "2026-01-01", to: "2026-01-31", compact: "true" })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body.summary).toMatchObject({
      deals: 3,
      total_purchase: 200,
      total_landing: 200,
      total_selling: 250,
      total_profit: 50,
      profit_percent: 25,
      pending_delivery_count: 1,
    });
    expect(res.headers["cache-control"]).toMatch(/max-age=60/);
  });

  it("422 when from > to", async () => {
    const app = createApp({ users, memberships, homeOverview });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/reports/home-overview`)
      .query({ from: "2026-02-01", to: "2026-01-01" })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
    expect(res.body.detail).toBe("from_must_not_exceed_to");
  });

  it("shell_bundle attaches stock_in_hand", async () => {
    const app = createApp({ users, memberships, homeOverview });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/reports/home-overview`)
      .query({
        from: "2026-01-01",
        to: "2026-01-31",
        shell_bundle: "true",
      })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body.stock_in_hand.item_count).toBe(3);
    expect(res.body.home_operational.delivery_pipeline.pending_count).toBe(1);
  });
});

describe("GET …/reports/trade-dashboard-snapshot", () => {
  it("allows owner role", async () => {
    const users = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
    } as unknown as UsersRepository;
    const memberships = {
      findByUserAndBusiness: vi.fn().mockResolvedValue(makeMembership()),
      listByUserId: vi.fn(),
      findById: vi.fn(),
    } as unknown as MembershipsRepository;
    const homeOverview = {
      snapshotSums: vi.fn().mockResolvedValue({
        deals: 0,
        total_purchase: 0,
        total_qty: 0,
        total_selling: 0,
      }),
      unitRollups: vi.fn().mockResolvedValue({
        total_bags: 0,
        total_boxes: 0,
        total_tins: 0,
        total_kg: 0,
      }),
      categoryNest: vi.fn().mockResolvedValue([]),
      pendingDeliveryCount: vi.fn().mockResolvedValue(0),
      supplierCount: vi.fn().mockResolvedValue(0),
      brokerCount: vi.fn().mockResolvedValue(0),
      receivedDeliveryCount: vi.fn().mockResolvedValue(0),
      negativeStockCount: vi.fn().mockResolvedValue(0),
      inventorySummary: vi.fn(),
    } as unknown as HomeOverviewRepository;

    const app = createApp({ users, memberships, homeOverview });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/reports/trade-dashboard-snapshot`)
      .query({ from: "2026-01-01", to: "2026-01-31" })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body.summary.deals).toBe(0);
  });
});
