/**
 * Categories Slice 1 — GET/POST item-categories + GET category-types-index
 * Formula source: catalog.py list/create/get item categories + types index
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type {
  CategoryTypeIndexRow,
  ItemCategoriesRepository,
  ItemCategoryRow,
} from "../../src/repositories/itemCategories.repository";
import type { UserRow, MembershipRow } from "../../src/repositories/types";
import type { SqlClient } from "../../src/repositories/sql";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import { GENERAL_TYPE_NAME } from "../../src/repositories/itemCategories.repository";

const USER_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-4333-8444-555555555555";
const CAT_ID = "33333333-4444-4555-8666-777777777777";
const TYPE_ID = "44444444-5555-4666-8777-888888888888";

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

function baseRepo(
  overrides: Partial<ItemCategoriesRepository> = {},
): ItemCategoriesRepository {
  const cat: ItemCategoryRow = { id: CAT_ID, name: "Grocery" };
  const typeIdx: CategoryTypeIndexRow = {
    id: TYPE_ID,
    category_id: CAT_ID,
    category_name: "Grocery",
    name: GENERAL_TYPE_NAME,
  };
  return {
    list: async () => [cat],
    getById: async () => cat,
    findDupCategoryId: async () => null,
    insertCategory: async () => undefined,
    insertType: async () => undefined,
    listTypesIndex: async () => [typeIdx],
    ...overrides,
  };
}

function appWith(categories: ItemCategoriesRepository) {
  return createApp({
    users: {
      findById: async () => makeUser(),
    } as unknown as UsersRepository,
    memberships: {
      findByUserAndBusiness: async () => makeMembership(),
    } as unknown as MembershipsRepository,
    itemCategories: categories,
    itemCategoriesRunInTransaction: async <T>(
      fn: (tx: SqlClient) => Promise<T>,
    ) => fn({} as SqlClient),
    itemCategoriesRepoForClient: () => categories,
  });
}

describe("GET /item-categories", () => {
  it("lists categories", async () => {
    const res = await request(appWith(baseRepo()))
      .get(`/v1/businesses/${BIZ_ID}/item-categories`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Grocery");
  });
});

describe("GET /item-categories/:id", () => {
  it("404 when missing", async () => {
    const res = await request(
      appWith(baseRepo({ getById: async () => null })),
    )
      .get(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("Category not found");
  });
});

describe("POST /item-categories", () => {
  it("creates category and seeds General type", async () => {
    let typeName = "";
    const categories = baseRepo({
      insertType: async (row) => {
        typeName = row.name;
      },
      getById: async () => ({ id: CAT_ID, name: "Spices" }),
    });
    const res = await request(appWith(categories))
      .post(`/v1/businesses/${BIZ_ID}/item-categories`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "Spices" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Spices");
    expect(typeName).toBe(GENERAL_TYPE_NAME);
  });

  it("409 on duplicate name", async () => {
    const res = await request(
      appWith(baseRepo({ findDupCategoryId: async () => CAT_ID })),
    )
      .post(`/v1/businesses/${BIZ_ID}/item-categories`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "Grocery" });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe("A category with this name already exists");
  });
});

describe("GET /category-types-index", () => {
  it("returns flat types with category_name", async () => {
    const res = await request(appWith(baseRepo()))
      .get(`/v1/businesses/${BIZ_ID}/category-types-index`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body[0].category_name).toBe("Grocery");
    expect(res.body[0].name).toBe(GENERAL_TYPE_NAME);
  });
});
