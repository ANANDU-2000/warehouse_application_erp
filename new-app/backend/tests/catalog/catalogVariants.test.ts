/**
 * Products Slice 6 — catalog variants CRUD
 * Formula source: catalog.py list/create/update/delete variants
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type {
  CatalogVariantRow,
  CatalogVariantsRepository,
} from "../../src/repositories/catalogVariants.repository";
import type { UserRow, MembershipRow } from "../../src/repositories/types";
import type { SqlClient } from "../../src/repositories/sql";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";

const USER_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-4333-8444-555555555555";
const ITEM_ID = "22222222-3333-4444-8555-666666666666";
const VAR_ID = "33333333-4444-4555-8666-777777777777";

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

function sampleVariant(
  overrides: Partial<CatalogVariantRow> = {},
): CatalogVariantRow {
  return {
    id: VAR_ID,
    catalog_item_id: ITEM_ID,
    name: "50KG",
    default_kg_per_bag: 50,
    ...overrides,
  };
}

function baseRepo(
  overrides: Partial<CatalogVariantsRepository> = {},
): CatalogVariantsRepository {
  return {
    listByItem: async () => [sampleVariant()],
    getById: async () => sampleVariant(),
    catalogItemExists: async () => true,
    findDupVariantId: async () => null,
    insert: async () => undefined,
    patch: async () => undefined,
    countArchivedEntryLines: async () => 0,
    delete: async () => undefined,
    ...overrides,
  };
}

function appWith(variants: CatalogVariantsRepository, role = "owner") {
  return createApp({
    users: {
      findById: async () => makeUser(),
    } as unknown as UsersRepository,
    memberships: {
      findByUserAndBusiness: async () => makeMembership(role),
    } as unknown as MembershipsRepository,
    catalogVariants: variants,
    catalogVariantsRunInTransaction: async <T>(
      fn: (tx: SqlClient) => Promise<T>,
    ) => fn({} as SqlClient),
    catalogVariantsRepoForClient: () => variants,
  });
}

describe("GET /catalog-items/:itemId/variants", () => {
  it("lists variants ordered", async () => {
    const res = await request(appWith(baseRepo()))
      .get(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/variants`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("50KG");
  });
});

describe("POST /catalog-items/:itemId/variants", () => {
  it("creates 201", async () => {
    let inserted = false;
    const variants = baseRepo({
      insert: async () => {
        inserted = true;
      },
      getById: async () => sampleVariant({ name: "25KG", default_kg_per_bag: 25 }),
    });
    const res = await request(appWith(variants))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/variants`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "25KG", default_kg_per_bag: 25 });
    expect(res.status).toBe(201);
    expect(inserted).toBe(true);
    expect(res.body.name).toBe("25KG");
  });

  it("409 on duplicate name", async () => {
    const variants = baseRepo({
      findDupVariantId: async () => VAR_ID,
    });
    const res = await request(appWith(variants))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/variants`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "50KG" });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe(
      "A variant with this name already exists for this item",
    );
  });

  it("404 when catalog item missing", async () => {
    const variants = baseRepo({
      catalogItemExists: async () => false,
    });
    const res = await request(appWith(variants))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/variants`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "X" });
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("Catalog item not found");
  });
});

describe("PATCH /catalog-variants/:variantId", () => {
  it("patches name 200", async () => {
    const variants = baseRepo({
      getById: async () => sampleVariant({ name: "60KG" }),
    });
    const res = await request(appWith(variants))
      .patch(`/v1/businesses/${BIZ_ID}/catalog-variants/${VAR_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "60KG" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("60KG");
  });
});

describe("DELETE /catalog-variants/:variantId", () => {
  it("owner deletes 204", async () => {
    let deleted = false;
    const variants = baseRepo({
      delete: async () => {
        deleted = true;
      },
    });
    const res = await request(appWith(variants, "owner"))
      .delete(`/v1/businesses/${BIZ_ID}/catalog-variants/${VAR_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(204);
    expect(deleted).toBe(true);
  });

  it("staff forbidden 403", async () => {
    const res = await request(appWith(baseRepo(), "staff"))
      .delete(`/v1/businesses/${BIZ_ID}/catalog-variants/${VAR_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("400 when linked to archived entry lines", async () => {
    const variants = baseRepo({
      countArchivedEntryLines: async () => 1,
    });
    const res = await request(appWith(variants, "owner"))
      .delete(`/v1/businesses/${BIZ_ID}/catalog-variants/${VAR_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(400);
    expect(res.body.detail).toBe(
      "Cannot delete a variant that is linked to purchase entry lines",
    );
  });
});
