/**
 * Products Slice 7 — POST bulk-archive · PATCH bulk-reorder
 * Formula source: catalog.py bulk_archive_catalog_items / bulk_reorder_catalog_items
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

const USER_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-4333-8444-555555555555";
const ID_A = "22222222-3333-4444-8555-666666666666";
const ID_B = "33333333-4444-4555-8666-777777777777";

function bearer(): string {
  return createAccessToken(USER_ID, getJwtSettings(), 0);
}

function makeUser(): UserRow {
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
  };
}

function makeMembership(role = "owner"): MembershipRow {
  return {
    id: "99999999-8888-4777-8666-555555555555",
    user_id: USER_ID,
    business_id: BIZ_ID,
    role,
    permissions_json: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
  };
}

function appWith(
  catalogItems: Partial<CatalogItemsRepository>,
  role = "owner",
) {
  return createApp({
    users: {
      findById: async () => makeUser(),
    } as unknown as UsersRepository,
    memberships: {
      findByUserAndBusiness: async () => makeMembership(role),
    } as unknown as MembershipsRepository,
    catalogItems: catalogItems as CatalogItemsRepository,
  });
}

describe("POST /catalog/items/bulk-archive", () => {
  it("owner archives 204", async () => {
    let archived: string[] = [];
    const res = await request(
      appWith({
        bulkSoftDelete: async (_b, ids) => {
          archived = ids;
          return ids.length;
        },
      }),
    )
      .post(`/v1/businesses/${BIZ_ID}/catalog/items/bulk-archive`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ item_ids: [ID_A, ID_B] });
    expect(res.status).toBe(204);
    expect(archived).toEqual([ID_A, ID_B]);
  });

  it("staff forbidden 403", async () => {
    const res = await request(
      appWith(
        {
          bulkSoftDelete: async () => {
            throw new Error("should not run");
          },
        },
        "staff",
      ),
    )
      .post(`/v1/businesses/${BIZ_ID}/catalog/items/bulk-archive`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ item_ids: [ID_A] });
    expect(res.status).toBe(403);
  });
});

describe("PATCH /catalog/items/bulk-reorder", () => {
  it("owner sets reorder_level and returns updated count", async () => {
    let level = -1;
    const res = await request(
      appWith({
        bulkSetReorderLevel: async (_b, ids, rl) => {
          level = rl;
          return ids.length;
        },
      }),
    )
      .patch(`/v1/businesses/${BIZ_ID}/catalog/items/bulk-reorder`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ item_ids: [ID_A], reorder_level: 12 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: 1 });
    expect(level).toBe(12);
  });
});
