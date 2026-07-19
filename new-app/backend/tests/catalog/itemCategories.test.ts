/**
 * Categories Slice 1–2 — item-categories CRUD + nested category-types
 * Formula source: catalog.py item-categories / category-types
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type {
  CategoryTypeIndexRow,
  CategoryTypeRow,
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

function makeMembership(role: string): MembershipRow {
  return {
    id: "99999999-8888-4777-8666-555555555555",
    user_id: USER_ID,
    business_id: BIZ_ID,
    role,
    permissions_json: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
  };
}

function baseRepo(
  overrides: Partial<ItemCategoriesRepository> = {},
): ItemCategoriesRepository {
  const cat: ItemCategoryRow = { id: CAT_ID, name: "Grocery" };
  const typeRow: CategoryTypeRow = {
    id: TYPE_ID,
    category_id: CAT_ID,
    name: GENERAL_TYPE_NAME,
  };
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
    updateCategoryName: async () => undefined,
    countCatalogItemsByCategory: async () => 0,
    deleteCategory: async () => undefined,
    insertType: async () => undefined,
    listTypes: async () => [typeRow],
    getTypeById: async () => typeRow,
    findDupTypeId: async () => null,
    updateTypeName: async () => undefined,
    countCatalogItemsByType: async () => 0,
    deleteType: async () => undefined,
    listTypesIndex: async () => [typeIdx],
    ...overrides,
  };
}

function appWith(
  categories: ItemCategoriesRepository,
  role: string = "staff",
) {
  return createApp({
    users: {
      findById: async () => makeUser(),
    } as unknown as UsersRepository,
    memberships: {
      findByUserAndBusiness: async () => makeMembership(role),
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

describe("PATCH /item-categories/:id", () => {
  it("renames category", async () => {
    let newName = "";
    const categories = baseRepo({
      updateCategoryName: async (_b, _c, name) => {
        newName = name;
      },
      getById: async () => ({ id: CAT_ID, name: "Renamed" }),
    });
    const res = await request(appWith(categories))
      .patch(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "Renamed" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Renamed");
    expect(newName).toBe("Renamed");
  });

  it("409 on rename dup", async () => {
    const res = await request(
      appWith(baseRepo({ findDupCategoryId: async () => "other-id" })),
    )
      .patch(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "Taken" });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe("A category with this name already exists");
  });
});

describe("DELETE /item-categories/:id", () => {
  it("owner deletes 204", async () => {
    let deleted = false;
    const categories = baseRepo({
      deleteCategory: async () => {
        deleted = true;
      },
    });
    const res = await request(appWith(categories, "owner"))
      .delete(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(204);
    expect(deleted).toBe(true);
  });

  it("staff forbidden 403", async () => {
    const res = await request(appWith(baseRepo(), "staff"))
      .delete(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("400 when category has items", async () => {
    const res = await request(
      appWith(
        baseRepo({ countCatalogItemsByCategory: async () => 2 }),
        "owner",
      ),
    )
      .delete(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(400);
    expect(res.body.detail).toBe(
      "Cannot delete a category that still has catalog items — delete or move items first",
    );
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

describe("GET …/category-types", () => {
  it("lists types for category", async () => {
    const res = await request(appWith(baseRepo()))
      .get(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe(GENERAL_TYPE_NAME);
  });

  it("404 when category missing", async () => {
    const res = await request(
      appWith(baseRepo({ getById: async () => null })),
    )
      .get(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("Category not found");
  });
});

describe("POST …/category-types", () => {
  it("creates type 201", async () => {
    const categories = baseRepo({
      getTypeById: async () => ({
        id: TYPE_ID,
        category_id: CAT_ID,
        name: "Organic",
      }),
    });
    const res = await request(appWith(categories))
      .post(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "Organic" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Organic");
  });

  it("409 on dup type name", async () => {
    const res = await request(
      appWith(baseRepo({ findDupTypeId: async () => TYPE_ID })),
    )
      .post(`/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "General" });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe(
      "A type with this name already exists in this category",
    );
  });
});

describe("PATCH …/category-types/:typeId", () => {
  it("renames type", async () => {
    const categories = baseRepo({
      getTypeById: async () => ({
        id: TYPE_ID,
        category_id: CAT_ID,
        name: "Premium",
      }),
    });
    const res = await request(appWith(categories))
      .patch(
        `/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types/${TYPE_ID}`,
      )
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "Premium" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Premium");
  });

  it("404 when type missing", async () => {
    const res = await request(
      appWith(baseRepo({ getTypeById: async () => null })),
    )
      .patch(
        `/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types/${TYPE_ID}`,
      )
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "X" });
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("Type not found");
  });
});

describe("DELETE …/category-types/:typeId", () => {
  it("owner deletes 204", async () => {
    let deleted = false;
    const categories = baseRepo({
      deleteType: async () => {
        deleted = true;
      },
    });
    const res = await request(appWith(categories, "owner"))
      .delete(
        `/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types/${TYPE_ID}`,
      )
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(204);
    expect(deleted).toBe(true);
  });

  it("staff forbidden 403", async () => {
    const res = await request(appWith(baseRepo(), "staff"))
      .delete(
        `/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types/${TYPE_ID}`,
      )
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("400 when type has items", async () => {
    const res = await request(
      appWith(
        baseRepo({ countCatalogItemsByType: async () => 1 }),
        "owner",
      ),
    )
      .delete(
        `/v1/businesses/${BIZ_ID}/item-categories/${CAT_ID}/category-types/${TYPE_ID}`,
      )
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(400);
    expect(res.body.detail).toBe(
      "Cannot delete a type that still has catalog items — move or delete items first",
    );
  });
});
