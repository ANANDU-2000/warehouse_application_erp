/**
 * Products Slice 3 — POST /catalog-items/batch + /from-scan
 * Formula source: catalog.py batch_create_catalog_items / create_catalog_item_from_scan
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

const USER_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-4333-8444-555555555555";
const CAT_ID = "33333333-4444-4555-8666-777777777777";
const TYPE_ID = "44444444-5555-4666-8777-888888888888";
const ITEM_ID = "22222222-3333-4444-8555-666666666666";
const SUP_ID = "66666666-7777-4888-8999-aaaaaaaaaaaa";

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
    name: "BATCH RICE",
    default_unit: "kg",
    default_kg_per_bag: null,
    default_items_per_box: null,
    default_weight_per_tin: null,
    default_purchase_unit: "kg",
    default_sale_unit: null,
    hsn_code: null,
    item_code: null,
    barcode: null,
    public_token: "tok",
    tax_percent: null,
    default_landing_cost: null,
    default_selling_cost: null,
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
    package_type: "LOOSE",
    package_size: null,
    package_measurement: null,
    conversion_factor: null,
    unit_confidence: null,
    validation_status: null,
    smart_classification: null,
    default_supplier_ids: [SUP_ID],
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
    listFuzzyNamePairs: async () => [],
    ...overrides,
  };
}

function appWith(catalogItems: CatalogItemsRepository) {
  return createApp({
    users: {
      findById: async () => makeUser(),
    } as unknown as UsersRepository,
    memberships: {
      findByUserAndBusiness: async () => makeMembership("owner"),
    } as unknown as MembershipsRepository,
    catalogItems,
    catalogWriteRunInTransaction: async <T>(
      fn: (tx: SqlClient) => Promise<T>,
    ) => fn({} as SqlClient),
    catalogWriteRepoForClient: () => catalogItems,
  });
}

describe("POST /catalog-items/batch", () => {
  it("creates lines and returns created/skipped", async () => {
    let inserts = 0;
    const catalogItems = baseRepo({
      insertItem: async () => {
        inserts += 1;
      },
      getById: async () => sampleItem({ name: "BATCH RICE" }),
    });
    const res = await request(appWith(catalogItems))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/batch`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        items: [
          {
            name: "BATCH RICE",
            type_id: TYPE_ID,
            default_unit: "kg",
            default_supplier_ids: [SUP_ID],
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.created).toBe(1);
    expect(res.body.skipped).toBe(0);
    expect(res.body.items).toHaveLength(1);
    expect(inserts).toBe(1);
  });

  it("skips unknown type_id without failing whole batch", async () => {
    const catalogItems = baseRepo({
      findTypeInBusiness: async () => null,
      insertItem: async () => {
        throw new Error("should not insert");
      },
    });
    const res = await request(appWith(catalogItems))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/batch`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        items: [
          {
            name: "SKIP ME",
            type_id: TYPE_ID,
            default_unit: "kg",
            default_supplier_ids: [SUP_ID],
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.created).toBe(0);
    expect(res.body.skipped).toBe(1);
    expect(res.body.items).toEqual([]);
  });
});

describe("POST /catalog-items/from-scan", () => {
  it("creates 201 with barcode and item_code", async () => {
    const created = sampleItem({
      name: "SCAN TEA",
      barcode: "890123",
      item_code: "SCAN-TEA",
    });
    const catalogItems = baseRepo({
      getById: async () => created,
    });
    const res = await request(appWith(catalogItems))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/from-scan`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        barcode: "890123",
        item_code: "scan-tea",
        name: "SCAN TEA",
        type_id: TYPE_ID,
        default_unit: "kg",
      });
    expect(res.status).toBe(201);
    expect(res.body.barcode).toBe("890123");
    expect(res.body.item_code).toBe("SCAN-TEA");
  });

  it("409 when barcode already exists", async () => {
    const { HttpError } = await import("../../src/errors/httpError");
    const catalogItems = baseRepo({
      assertUniqueBarcode: async () => {
        throw new HttpError(409, "Barcode already exists");
      },
    });
    const res = await request(appWith(catalogItems))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/from-scan`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        barcode: "890123",
        item_code: "SCAN-TEA",
        name: "SCAN TEA",
        type_id: TYPE_ID,
        default_unit: "kg",
      });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe("Barcode already exists");
  });

  it("409 on duplicate name for subcategory", async () => {
    const catalogItems = baseRepo({
      findDupItemId: async () => ITEM_ID,
    });
    const res = await request(appWith(catalogItems))
      .post(`/v1/businesses/${BIZ_ID}/catalog-items/from-scan`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        barcode: "890999",
        item_code: "OTHER",
        name: "DUP",
        type_id: TYPE_ID,
        default_unit: "kg",
      });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe(
      "An item with this name already exists for this subcategory",
    );
  });
});
