/**
 * Products Slice 1 — GET /catalog-items list + detail
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
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import {
  resolveFromText,
  resolveForCatalogItem,
} from "../../src/services/unitResolution.service";
import {
  toCatalogItemOut,
  maybeRedactCatalogOut,
} from "../../src/services/catalogItems.service";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";
const ITEM_ID = "22222222-3333-4444-5555-666666666666";

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

function sampleItem(): CatalogItemEnriched {
  return {
    id: ITEM_ID,
    category_id: "33333333-4444-5555-6666-777777777777",
    type_id: null,
    type_name: null,
    category_name: "Grocery",
    name: "LOOSE SUGAR",
    default_unit: "KG",
    default_kg_per_bag: null,
    default_items_per_box: null,
    default_weight_per_tin: null,
    default_purchase_unit: null,
    default_sale_unit: null,
    hsn_code: null,
    item_code: "ITM-1",
    barcode: null,
    public_token: "tok",
    tax_percent: null,
    default_landing_cost: 10,
    default_selling_cost: 12,
    last_purchase_price: 11,
    last_selling_rate: 13,
    last_supplier_id: null,
    last_broker_id: null,
    last_trade_purchase_id: null,
    last_line_qty: null,
    last_line_unit: null,
    last_line_weight_kg: null,
    selling_unit: null,
    stock_unit: null,
    display_unit: null,
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
  };
}

describe("unitResolution", () => {
  it("resolveFromText LOOSE → KG", () => {
    const ur = resolveFromText("LOOSE RICE");
    expect(ur.selling_unit).toBe("KG");
    expect(ur.rule_id).toBe("loose");
  });

  it("resolveFromText fallback PCS when category does not match", () => {
    const ur = resolveFromText("UNKNOWN WIDGET XYZ", {
      categoryName: "___no_such_category_zzz___",
    });
    expect(ur.selling_unit).toBe("PCS");
    expect(ur.rule_id).toBe("fallback_pcs");
  });

  it("resolveForCatalogItem prefers row selling_unit", () => {
    const ur = resolveForCatalogItem(
      { name: "Sugar", selling_unit: "BAG", package_size: 50, package_measurement: "KG", package_type: "SACK", stock_unit: "KG", conversion_factor: 50, unit_confidence: 95 },
      { itemName: "Sugar" },
    );
    expect(ur.rule_id).toBe("catalog_item_row");
    expect(ur.selling_unit).toBe("BAG");
  });
});

describe("catalogItems Out map", () => {
  it("includes unit_resolution and nulls financials for staff", () => {
    const out = toCatalogItemOut(sampleItem());
    expect(out.unit_resolution).toBeTruthy();
    expect((out.unit_resolution as { selling_unit: string }).selling_unit).toBe(
      "KG",
    );
    const redacted = maybeRedactCatalogOut(out, "staff");
    expect(redacted.default_landing_cost).toBeNull();
    expect(redacted.last_purchase_price).toBeNull();
    expect(redacted.name).toBe("LOOSE SUGAR");
  });
});

describe("GET /catalog-items", () => {
  it("lists items for membership", async () => {
    const item = sampleItem();
    const catalogItems: CatalogItemsRepository = {
      list: async () => [item],
      getById: async () => item,
    };
    const app = createApp({
      users: {
        findById: async () => makeUser(),
      } as unknown as UsersRepository,
      memberships: {
        findByUserAndBusiness: async () => makeMembership("owner"),
      } as unknown as MembershipsRepository,
      catalogItems,
    });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/catalog-items`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(ITEM_ID);
    expect(res.body[0].default_landing_cost).toBe(10);
  });

  it("redacts financials for staff", async () => {
    const item = sampleItem();
    const app = createApp({
      users: {
        findById: async () => makeUser(),
      } as unknown as UsersRepository,
      memberships: {
        findByUserAndBusiness: async () => makeMembership("staff"),
      } as unknown as MembershipsRepository,
      catalogItems: {
        list: async () => [item],
        getById: async () => item,
      },
    });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/catalog-items`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body[0].default_landing_cost).toBeNull();
  });

  it("getById 404", async () => {
    const app = createApp({
      users: {
        findById: async () => makeUser(),
      } as unknown as UsersRepository,
      memberships: {
        findByUserAndBusiness: async () => makeMembership("owner"),
      } as unknown as MembershipsRepository,
      catalogItems: {
        list: async () => [],
        getById: async () => null,
      },
    });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("Item not found");
  });

  it("getById 200", async () => {
    const item = sampleItem();
    const app = createApp({
      users: {
        findById: async () => makeUser(),
      } as unknown as UsersRepository,
      memberships: {
        findByUserAndBusiness: async () => makeMembership("owner"),
      } as unknown as MembershipsRepository,
      catalogItems: {
        list: async () => [],
        getById: async () => item,
      },
    });
    const res = await request(app)
      .get(`/v1/businesses/${BIZ_ID}/catalog-items/${ITEM_ID}`)
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ITEM_ID);
    expect(res.body.unit_resolution).toBeTruthy();
  });
});
