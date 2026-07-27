/**
 * Unified search API tests — search.py GET /search
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { SearchRepository } from "../../src/repositories/search.repository";
import type { UserRow, MembershipRow } from "../../src/repositories/types";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import { rankIdsByTokenSort, tokenSortRatio } from "../../src/services/fuzzyCatalog";
import {
  redactCatalogItems,
  shouldRedactFinancials,
} from "../../src/services/staffView";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";

function bearer(): string {
  return createAccessToken(USER_ID, getJwtSettings(), 0);
}

function makeUser(): UserRow {
  return {
    id: USER_ID,
    email: "staff@example.com",
    username: "staff",
    password_hash: "$2b$12$x",
    google_sub: null,
    phone: null,
    name: "Staff",
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
  };
}

function makeMembership(role = "staff"): MembershipRow {
  return {
    id: "99999999-8888-7777-6666-555555555555",
    user_id: USER_ID,
    business_id: BIZ_ID,
    role,
    permissions_json: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
  };
}

describe("fuzzyCatalog", () => {
  it("tokenSortRatio ranks identical sorted tokens high", () => {
    expect(tokenSortRatio("sugar bag", "bag sugar")).toBeGreaterThanOrEqual(90);
  });

  it("rankIdsByTokenSort respects cutoff and limit", () => {
    const ranked = rankIdsByTokenSort(
      "sugar",
      [
        { id: "1", name: "White Sugar" },
        { id: "2", name: "Cement" },
        { id: "3", name: "Brown Sugar Fine" },
      ],
      { limit: 2, scoreCutoff: 40 },
    );
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.length).toBeLessThanOrEqual(2);
    expect(ranked[0]!.score).toBeGreaterThanOrEqual(ranked[1]?.score ?? 0);
  });
});

describe("staffView redact", () => {
  it("shouldRedactFinancials only for staff", () => {
    expect(shouldRedactFinancials("staff")).toBe(true);
    expect(shouldRedactFinancials("owner")).toBe(false);
  });

  it("redactCatalogItems strips financial keys", () => {
    const out = redactCatalogItems([
      {
        id: "1",
        name: "X",
        last_purchase_price: 10,
        default_landing_cost: 1,
      },
    ]);
    expect(out[0]).not.toHaveProperty("last_purchase_price");
    expect(out[0]).not.toHaveProperty("default_landing_cost");
    expect(out[0]!.name).toBe("X");
  });
});

describe("GET /v1/businesses/:id/search", () => {
  it("returns UnifiedSearchOut from repository", async () => {
    const search: SearchRepository = {
      async unifiedSearch() {
        return {
          catalog_items: [{ id: "c1", name: "Rice" }],
          suppliers: [],
          brokers: [],
          entries: [],
          catalog_subcategories: [],
          recent_purchases: [],
          fuzzy_catalog_used: false,
          fuzzy_suppliers_used: false,
          fuzzy_brokers_used: false,
        };
      },
    };
    const users: UsersRepository = {
      findById: async () => makeUser(),
      findByEmail: async () => null,
      usernameExists: async () => false,
      emailExistsActive: async () => false,
      emailExistsActiveExcluding: async () => false,
      insert: async () => makeUser(),
      patchById: async () => makeUser(),
    } as unknown as UsersRepository;
    const memberships: MembershipsRepository = {
      findById: async () => makeMembership(),
      listByUserId: async () => [makeMembership()],
      findByUserAndBusiness: async () => makeMembership(),
      insert: async () => makeMembership(),
      updateRoleAndPermissions: async () => makeMembership(),
      updatePermissionsJson: async () => makeMembership(),
    } as unknown as MembershipsRepository;

    const app = createApp({ users, memberships, search });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/search`)
      .query({ q: "rice" })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body.catalog_items).toHaveLength(1);
    expect(res.body.catalog_items[0].name).toBe("Rice");
    expect(res.body.fuzzy_catalog_used).toBe(false);
  });

  it("rejects empty q", async () => {
    const search: SearchRepository = {
      async unifiedSearch() {
        return {
          catalog_items: [],
          suppliers: [],
          brokers: [],
          entries: [],
          catalog_subcategories: [],
          recent_purchases: [],
          fuzzy_catalog_used: false,
          fuzzy_suppliers_used: false,
          fuzzy_brokers_used: false,
        };
      },
    };
    const users: UsersRepository = {
      findById: async () => makeUser(),
    } as unknown as UsersRepository;
    const memberships: MembershipsRepository = {
      findByUserAndBusiness: async () => makeMembership(),
    } as unknown as MembershipsRepository;
    const app = createApp({ users, memberships, search });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/search`)
      .query({ q: "  " })
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
  });
});
