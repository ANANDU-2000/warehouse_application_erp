/**
 * Products Slice 2 — POST/PATCH/DELETE catalog-items
 * Formula source: catalog.py create_catalog_item / update_catalog_item / delete_catalog_item
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type {
  CatalogItemEnriched,
  CatalogItemsRepository,
} from "../../src/repositories/catalogItems.repository";
import type { UserRow, MembershipRow } from "../../src/repositories/types";
import type { SqlClient } from "../../src/repositories/sql";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import { applyCanonicalUnitProfile } from "../../src/services/catalogItemsWrite.service";
import {
  coerceBoxItemsPerBox,
  parseKgFromItemName,
} from "../../src/validation/catalogItems.schemas";

const USER_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-4333-8444-555555555555";
const CAT_ID = "33333333-4444-4555-8666-777777777777";
const TYPE_ID = "44444444-5555-4666-8777-888888888888";
const ITEM_ID = "22222222-3333-4444-8555-666666666666";
const DUP_ID = "55555555-6666-4777-8888-999999999999";

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

function sampleItem(overrides: Partial<CatalogItemEnriched> = {}): CatalogItemEnriched {
  return {
    id: ITEM_ID,
    category_id: CAT_ID,
    type_id: TYPE_ID,
    type_name: "General",
    category_name: "Grocery",
    name: "SUGAR 50KG",
    default_unit: "bag",
    default_kg_per_bag: 50,
    default_items_per_box: null,
    default_weight_per_tin: null,
    default_purchase_unit: "bag",
    default_sale_unit: null,
    hsn_code: null,
    item_code: "ITM-0001",
    barcode: "ITM-0001",
    public_token: "tok",
    tax_percent: null,
    default_landing_cost: 100,
    default_selling_cost: 120,
    last_purchase_price: null,
    last_selling_rate: null,
    last_supplier_id: null,
    last_broker_id: null,
    last_trade_purchase_id: null,
    last_line_qty: null,
    last_line_unit: null,
    last_line_weight_kg: null,
    selling_unit: "BAG",
    stock_unit: "BAG",
    display_unit: "BAG",
    package_type: "SACK",
    package_size: 50,
    package_measurement: "KG",
    conversion_factor: null,
    unit_confidence: null,
    validation_status: "unit_profile_verified",
    smart_classification: null,
    default_supplier_ids: [],
    default_broker_ids: [],
    last_supplier_name: null,
    last_broker_name: null,
    last_purchase_date: null,
    last_purchase_delivered: null,
    ...overrides,
  };
}

function failWrite(): never {
  throw new Error("unexpected write call");
}

function baseRepo(
  overrides: Partial<CatalogItemsRepository> = {},
): CatalogItemsRepository {
  return {
    list: async () => [],
    getById: async () => sampleItem(),
    categoryExists: async () => true,
    verifyTypeInCategory: async () => undefined,
    getOrCreateGeneralTypeId: async () => TYPE_ID,
    findDupItemId: async () => null,
    nextItemCode: async () => "ITM-0002",
    assertSupplierIdsInBusiness: async () => undefined,
    assertBrokerIdsInBusiness: async () => undefined,
    getCategoryName: async () => "Grocery",
    insertItem: async () => undefined,
    updateSmartFields: async () => undefined,
    replaceDefaultSuppliers: async () => undefined,
    replaceDefaultBrokers: async () => undefined,
    seedSupplierItemDefaults: async () => undefined,
    patchItem: async () => undefined,
    countTradeLines: async () => 0,
    listVariantIds: async () => [],
    countArchivedEntryLinesForVariants: async () => 0,
    deleteItem: async () => undefined,
    findTypeInBusiness: async () => ({ typeId: TYPE_ID, categoryId: CAT_ID }),
    assertUniqueBarcode: async () => undefined,
    assertUniqueItemCode: async () => undefined,
    ...overrides,
  };
}

function appWith(
  catalogItems: CatalogItemsRepository,
  role = "owner",
) {
  return createApp({
    users: {
      findById: async () => makeUser(),
    } as unknown as UsersRepository,
    memberships: {
      findByUserAndBusiness: async () => makeMembership(role),
    } as unknown as MembershipsRepository,
    catalogItems,
    catalogWriteRunInTransaction: async <T>(
      fn: (tx: SqlClient) => Promise<T>,
    ) => fn({} as SqlClient),
    catalogWriteRepoForClient: () => catalogItems,
  });
}

describe("catalog write helpers", () => {
  it("parseKgFromItemName extracts weight", () => {
    expect(parseKgFromItemName("SUGAR 50KG")).toBe(50);
    expect(parseKgFromItemName("LOOSE")).toBeNull();
  });

  it("coerceBoxItemsPerBox defaults to 1", () => {
    expect(coerceBoxItemsPerBox(null)).toBe(1);
    expect(coerceBoxItemsPerBox(12)).toBe(12);
  });

  it("applyCanonicalUnitProfile bag", () => {
    const draft = {
      name: "x",
      package_type: null as string | null,
      selling_unit: null as string | null,
      stock_unit: null as string | null,
      display_unit: null as string | null,
      package_size: null as number | null,
      package_measurement: null as string | null,
      conversion_factor: null as number | null,
      unit_confidence: null as number | null,
      validation_status: null as string | null,
      smart_classification: null as string | null,
      default_kg_per_bag: 50,
    };
    applyCanonicalUnitProfile(draft, "bag");
    expect(draft.stock_unit).toBe("BAG");
    expect(draft.package_size).toBe(50);
    expect(draft.validation_status).toBe("unit_profile_verified");
  });
});

describe("POST /catalog-items", () => {
  it("creates item 201 and returns body", async () => {
    let inserted = false;
    const created = sampleItem({ id: "aaaaaaaa-1111-4222-8333-444444444444", name: "RICE 25KG" });
    const catalogItems = baseRepo({
      insertItem: async () => {
        inserted = true;
      },
      getById: async () => created,
    });
    const res = await request(appWith(catalogItems))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        category_id: CAT_ID,
        name: "RICE 25KG",
        default_unit: "bag",
        default_kg_per_bag: 25,
      });
    expect(res.status).toBe(201);
    expect(inserted).toBe(true);
    expect(res.body.name).toBe("RICE 25KG");
    expect(res.body.default_landing_cost).toBe(100);
  });

  it("409 on duplicate name with existing_item_id object detail", async () => {
    const catalogItems = baseRepo({
      findDupItemId: async () => DUP_ID,
      insertItem: failWrite,
    });
    const res = await request(appWith(catalogItems))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        category_id: CAT_ID,
        name: "SUGAR 50KG",
        default_unit: "bag",
        default_kg_per_bag: 50,
      });
    expect(res.status).toBe(409);
    expect(res.body.detail).toEqual({
      message:
        "An item with this name already exists for this category and type",
      existing_item_id: DUP_ID,
    });
  });

  it("redacts financials for staff on create", async () => {
    const created = sampleItem({ default_landing_cost: 99 });
    const catalogItems = baseRepo({
      getById: async () => created,
    });
    const res = await request(appWith(catalogItems, "staff"))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        category_id: CAT_ID,
        name: "TEA 1KG",
        default_unit: "bag",
        default_kg_per_bag: 1,
      });
    expect(res.status).toBe(201);
    expect(res.body.default_landing_cost).toBeNull();
  });
});

describe("PATCH /catalog-items/:itemId", () => {
  it("patches name 200", async () => {
    let patched = false;
    const catalogItems = baseRepo({
      patchItem: async () => {
        patched = true;
      },
      getById: async () => sampleItem({ name: "SUGAR 60KG" }),
    });
    const res = await request(appWith(catalogItems))
      .patch(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ name: "SUGAR 60KG" });
    expect(res.status).toBe(200);
    expect(patched).toBe(true);
    expect(res.body.name).toBe("SUGAR 60KG");
  });

  it("400 when default_supplier_ids empty on update", async () => {
    const catalogItems = baseRepo({
      patchItem: failWrite,
    });
    const res = await request(appWith(catalogItems))
      .patch(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ default_supplier_ids: [] });
    expect(res.status).toBe(400);
    expect(res.body.detail).toBe(
      "At least one default_supplier_ids entry is required when updating defaults",
    );
  });
});

describe("DELETE /catalog-items/:itemId", () => {
  it("owner deletes 204", async () => {
    let deleted = false;
    const catalogItems = baseRepo({
      deleteItem: async () => {
        deleted = true;
      },
    });
    const res = await request(appWith(catalogItems, "owner"))
      .delete(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(204);
    expect(deleted).toBe(true);
  });

  it("staff forbidden 403", async () => {
    const catalogItems = baseRepo({
      deleteItem: failWrite,
    });
    const res = await request(appWith(catalogItems, "staff"))
      .delete(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(403);
  });

  it("400 when linked to trade lines", async () => {
    const catalogItems = baseRepo({
      countTradeLines: async () => 2,
      deleteItem: failWrite,
    });
    const res = await request(appWith(catalogItems, "owner"))
      .delete(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(400);
    expect(res.body.detail).toBe(
      "Cannot delete a catalog item that is linked to wholesale purchase lines",
    );
  });
});
