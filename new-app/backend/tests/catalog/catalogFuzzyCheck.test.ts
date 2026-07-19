/**
 * Products Slice 4 — GET /catalog/fuzzy-check
 * Formula source: catalog.py:catalog_fuzzy_check + fuzzy_catalog.py
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { CatalogItemsRepository } from "../../src/repositories/catalogItems.repository";
import type { UserRow, MembershipRow } from "../../src/repositories/types";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import {
  tokenSortRatio,
  rankIdsByTokenSort,
} from "../../src/services/fuzzyCatalog.service";

const USER_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-4333-8444-555555555555";
const ID_A = "22222222-3333-4444-8555-666666666666";
const ID_B = "33333333-4444-4555-8666-777777777777";
const ID_C = "44444444-5555-4666-8777-888888888888";

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

function makeMembership(): MembershipRow {
  return {
    id: "99999999-8888-4777-8666-555555555555",
    user_id: USER_ID,
    business_id: BIZ_ID,
    role: "staff",
    permissions_json: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
  };
}

describe("fuzzyCatalog token_sort_ratio (RapidFuzz parity)", () => {
  it("matches known RapidFuzz scores", () => {
    expect(tokenSortRatio("sugar loose", "loose sugar")).toBe(100);
    expect(tokenSortRatio("tea", "tea bag")).toBe(60);
    expect(tokenSortRatio("xyz", "abc")).toBe(0);
    expect(tokenSortRatio("a b c", "c b a")).toBe(100);
    // RapidFuzz ~83.33
    expect(Math.trunc(tokenSortRatio("sugar rice", "rice sugar bag"))).toBe(83);
  });

  it("rankIdsByTokenSort respects cutoff and limit", () => {
    const ranked = rankIdsByTokenSort(
      "sugar loose",
      [
        { id: ID_A, name: "LOOSE SUGAR" },
        { id: ID_B, name: "TEA BAG" },
        { id: ID_C, name: "Sugar Loose 50kg" },
      ],
      { limit: 12, scoreCutoff: 55 },
    );
    expect(ranked[0]?.id).toBe(ID_A);
    expect(ranked[0]?.score).toBe(100);
    expect(ranked.every((r) => r.score >= 55)).toBe(true);
    expect(ranked.find((r) => r.id === ID_B)).toBeUndefined();
  });
});

describe("GET /catalog/fuzzy-check", () => {
  it("returns hits with score 0..1", async () => {
    const catalogItems = {
      listFuzzyNamePairs: async () => [
        { id: ID_A, name: "LOOSE SUGAR" },
        { id: ID_B, name: "TEA BAG" },
      ],
    } as unknown as CatalogItemsRepository;

    const app = createApp({
      users: {
        findById: async () => makeUser(),
      } as unknown as UsersRepository,
      memberships: {
        findByUserAndBusiness: async () => makeMembership(),
      } as unknown as MembershipsRepository,
      catalogItems,
    });

    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/catalog/fuzzy-check`)
      .query({ name: "sugar loose" })
      .set("Authorization", `Bearer ${bearer()}`);

    expect(res.status).toBe(200);
    expect(res.body.hits.length).toBeGreaterThanOrEqual(1);
    expect(res.body.hits[0].id).toBe(ID_A);
    expect(res.body.hits[0].name).toBe("LOOSE SUGAR");
    expect(res.body.hits[0].score).toBe(1);
  });

  it("422 when name missing", async () => {
    const app = createApp({
      users: {
        findById: async () => makeUser(),
      } as unknown as UsersRepository,
      memberships: {
        findByUserAndBusiness: async () => makeMembership(),
      } as unknown as MembershipsRepository,
      catalogItems: {
        listFuzzyNamePairs: async () => [],
      } as unknown as CatalogItemsRepository,
    });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/catalog/fuzzy-check`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(422);
  });
});
