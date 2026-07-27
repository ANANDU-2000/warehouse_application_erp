/**
 * Products Slice 5 — PATCH item-code / barcode · POST generate-code
 * Formula source: catalog.py patch_catalog_item_code / patch_catalog_item_barcode / generate_catalog_item_code
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
import { HttpError } from "../../src/errors/httpError";

const USER_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-4333-8444-555555555555";
const CAT_ID = "33333333-4444-4555-8666-777777777777";
const TYPE_ID = "44444444-5555-4666-8777-888888888888";
const ITEM_ID = "22222222-3333-4444-8555-666666666666";

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
    name: "SUGAR",
    default_unit: "kg",
    default_kg_per_bag: null,
    default_items_per_box: null,
    default_weight_per_tin: null,
    default_purchase_unit: null,
    default_sale_unit: null,
    hsn_code: null,
    item_code: null,
    barcode: null,
    public_token: "tok",
    tax_percent: null,
    default_landing_cost: 10,
    default_selling_cost: 12,
    last_purchase_price: null,
    last_selling_rate: null,
    last_supplier_id: null,
    last_broker_id: null,
    last_trade_purchase_id: null,
    last_line_qty: null,
    last_line_unit: null,
    last_line_weight_kg: null,
    selling_unit: "KG",
    stock_unit: "KG",
    display_unit: "KG",
    package_type: null,
    package_size: null,
    package_measurement: null,
    conversion_factor: null,
    unit_confidence: null,
    validation_status: null,
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

function baseRepo(
  overrides: Partial<CatalogItemsRepository> = {},
): CatalogItemsRepository {
  const item = sampleItem();
  return {
    list: async () => [],
    getById: async () => item,
    getActiveById: async () => item,
    categoryExists: async () => true,
    verifyTypeInCategory: async () => undefined,
    getOrCreateGeneralTypeId: async () => TYPE_ID,
    findDupItemId: async () => null,
    nextItemCode: async () => "ITM-0003",
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
    listFuzzyNamePairs: async () => [],
    updateItemCode: async () => undefined,
    updateBarcode: async () => undefined,
    bulkSoftDelete: async () => 0,
    bulkSetReorderLevel: async () => 0,
    ...overrides,
  };
}

function appWith(catalogItems: CatalogItemsRepository, role = "staff") {
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

describe("PATCH /catalog-items/:id/item-code", () => {
  it("updates item_code 200", async () => {
    let code = "";
    const catalogItems = baseRepo({
      updateItemCode: async (_b, _i, c) => {
        code = c;
      },
      getActiveById: async () => sampleItem({ item_code: "MY-CODE" }),
    });
    const res = await request(appWith(catalogItems))
      .patch(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/item-code`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ item_code: "my-code" });
    expect(res.status).toBe(200);
    expect(code).toBe("MY-CODE");
    expect(res.body.item_code).toBe("MY-CODE");
  });

  it("409 when code already exists", async () => {
    const catalogItems = baseRepo({
      assertUniqueItemCode: async () => {
        throw new HttpError(409, "Item code already exists");
      },
    });
    const res = await request(appWith(catalogItems))
      .patch(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/item-code`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ item_code: "TAKEN" });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe("Item code already exists");
  });
});

describe("PATCH /catalog-items/:id/barcode", () => {
  it("updates barcode when stock_edit allowed (staff)", async () => {
    let bc = "";
    const catalogItems = baseRepo({
      updateBarcode: async (_b, _i, b) => {
        bc = b;
      },
      getActiveById: async () => sampleItem({ barcode: "8901" }),
    });
    const res = await request(appWith(catalogItems, "staff"))
      .patch(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/barcode`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({ barcode: "8901" });
    expect(res.status).toBe(200);
    expect(bc).toBe("8901");
  });
});

describe("POST /catalog-items/:id/generate-code", () => {
  it("assigns next ITM code", async () => {
    let assigned = "";
    const catalogItems = baseRepo({
      getById: async () => sampleItem({ item_code: null }),
      nextItemCode: async () => "ITM-0009",
      updateItemCode: async (_b, _i, c) => {
        assigned = c;
      },
    });
    // After update, getById returns new code
    let calls = 0;
    catalogItems.getById = async () => {
      calls += 1;
      return sampleItem({
        item_code: calls === 1 ? null : "ITM-0009",
        default_landing_cost: 10,
      });
    };
    const res = await request(appWith(catalogItems, "owner"))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/generate-code`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(assigned).toBe("ITM-0009");
    expect(res.body.item_code).toBe("ITM-0009");
  });

  it("409 when item already has a code", async () => {
    const catalogItems = baseRepo({
      getById: async () => sampleItem({ item_code: "ITM-0001" }),
    });
    const res = await request(appWith(catalogItems))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}/generate-code`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(409);
    expect(res.body.detail).toEqual({
      message: "Item already has a code",
      item_code: "ITM-0001",
    });
  });
});
