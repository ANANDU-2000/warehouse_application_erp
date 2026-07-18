/**
 * GET /v1/me/businesses — Login E2E Slice L1.
 * Source: source-app/backend/app/routers/me.py
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { BusinessesRepository } from "../../src/repositories/businesses.repository";
import type {
  UserRow,
  MembershipRow,
  BusinessRow,
} from "../../src/repositories/types";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import { ROLE_DEFAULTS } from "../../src/services/permissions.service";
import { listMyBusinesses } from "../../src/services/meBusinesses.service";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";
const BIZ_ID_2 = "22222222-3333-4444-5555-666666666666";

function makeUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: USER_ID,
    email: "admin@example.com",
    username: "admin",
    password_hash: "$2b$12$x",
    google_sub: null,
    phone: null,
    name: "Admin",
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
    ...overrides,
  };
}

function makeMembership(overrides: Partial<MembershipRow> = {}): MembershipRow {
  return {
    id: "99999999-8888-7777-6666-555555555555",
    user_id: USER_ID,
    business_id: BIZ_ID,
    role: "owner",
    permissions_json: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeBusiness(overrides: Partial<BusinessRow> = {}): BusinessRow {
  return {
    id: BIZ_ID,
    name: "Harisree Agency",
    branding_title: "Warehouse",
    branding_logo_url: null,
    gst_number: "29AAAAA0000A1Z5",
    address: "Line 1",
    phone: "9999999999",
    contact_email: "biz@example.com",
    default_currency: "INR",
    created_at: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("listMyBusinesses service", () => {
  it("returns BusinessBrief with role permissions", async () => {
    const memberships = {
      listByUserId: vi.fn().mockResolvedValue([makeMembership({ role: "staff" })]),
    } as unknown as MembershipsRepository;
    const businesses = {
      findById: vi.fn().mockResolvedValue(makeBusiness()),
    } as unknown as BusinessesRepository;

    const out = await listMyBusinesses({ memberships, businesses }, USER_ID);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: BIZ_ID,
      name: "Harisree Agency",
      role: "staff",
      branding_title: "Warehouse",
      gst_number: "29AAAAA0000A1Z5",
      contact_email: "biz@example.com",
    });
    expect(out[0].permissions).toEqual(ROLE_DEFAULTS.staff);
  });

  it("skips memberships whose business is missing", async () => {
    const memberships = {
      listByUserId: vi
        .fn()
        .mockResolvedValue([
          makeMembership(),
          makeMembership({
            id: "aaaaaaaa-0000-0000-0000-000000000001",
            business_id: BIZ_ID_2,
          }),
        ]),
    } as unknown as MembershipsRepository;
    const businesses = {
      findById: vi.fn().mockImplementation(async (id: string) => {
        if (id === BIZ_ID) return makeBusiness();
        return null;
      }),
    } as unknown as BusinessesRepository;

    const out = await listMyBusinesses({ memberships, businesses }, USER_ID);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe(BIZ_ID);
  });

  it("returns empty array when user has no memberships", async () => {
    const memberships = {
      listByUserId: vi.fn().mockResolvedValue([]),
    } as unknown as MembershipsRepository;
    const businesses = {
      findById: vi.fn(),
    } as unknown as BusinessesRepository;

    const out = await listMyBusinesses({ memberships, businesses }, USER_ID);
    expect(out).toEqual([]);
    expect(businesses.findById).not.toHaveBeenCalled();
  });
});

describe("GET /v1/me/businesses", () => {
  let findById: ReturnType<typeof vi.fn>;
  let listByUserId: ReturnType<typeof vi.fn>;
  let findBusinessById: ReturnType<typeof vi.fn>;
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;

  beforeEach(() => {
    findById = vi.fn();
    listByUserId = vi.fn();
    findBusinessById = vi.fn();
    users = {
      findById,
      findByEmail: vi.fn(),
    } as unknown as UsersRepository;
    memberships = {
      findById: vi.fn(),
      listByUserId,
      findByUserAndBusiness: vi.fn(),
    } as unknown as MembershipsRepository;
    businesses = {
      findById: findBusinessById,
    } as unknown as BusinessesRepository;
  });

  function app() {
    return createApp({ users, memberships, businesses });
  }

  function bearer(): string {
    return createAccessToken(USER_ID, getJwtSettings(), 0);
  }

  it("returns 401 without Bearer", async () => {
    const res = await request(app()).get("/v1/me/businesses");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ detail: "Not authenticated" });
  });

  it("returns 200 empty list when no memberships", async () => {
    findById.mockResolvedValue(makeUser());
    listByUserId.mockResolvedValue([]);
    const res = await request(app())
      .get("/v1/me/businesses")
      .set("Authorization", `Bearer ${bearer()}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 200 BusinessBrief array with permissions map", async () => {
    findById.mockResolvedValue(makeUser());
    listByUserId.mockResolvedValue([makeMembership({ role: "owner" })]);
    findBusinessById.mockResolvedValue(makeBusiness());

    const res = await request(app())
      .get("/v1/me/businesses")
      .set("Authorization", `Bearer ${bearer()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toEqual({
      id: BIZ_ID,
      name: "Harisree Agency",
      role: "owner",
      permissions: ROLE_DEFAULTS.owner,
      branding_title: "Warehouse",
      branding_logo_url: null,
      gst_number: "29AAAAA0000A1Z5",
      address: "Line 1",
      phone: "9999999999",
      contact_email: "biz@example.com",
    });
  });
});
