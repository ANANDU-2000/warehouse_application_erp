/**
 * Users & Roles — POST …/users create slice.
 * Source: users.py:create_user
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { BusinessesRepository } from "../../src/repositories/businesses.repository";
import type { BusinessUsersRepository } from "../../src/repositories/businessUsers.repository";
import type {
  UserRow,
  MembershipRow,
  BusinessRow,
} from "../../src/repositories/types";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import { userCreateInSchema } from "../../src/validation/users.schemas";
import { generateReadablePassword } from "../../src/services/readablePassword.service";
import {
  allocateUsername,
  slugFromName,
} from "../../src/services/userUsername.service";
import { validateWithSchema } from "../../src/validation/validate";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const BIZ_ID = "11111111-2222-3333-4444-555555555555";

function bearer(): string {
  return createAccessToken(USER_ID, getJwtSettings(), 0);
}

function makeUser(overrides: Partial<UserRow> = {}): UserRow {
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

function makeBusiness(): BusinessRow {
  return {
    id: BIZ_ID,
    name: "Main Warehouse",
    branding_title: null,
    branding_logo_url: null,
    gst_number: null,
    address: null,
    phone: null,
    contact_email: null,
    default_currency: "INR",
    created_at: new Date("2024-01-01T00:00:00Z"),
  };
}

describe("userCreateInSchema", () => {
  it("resolves email from phone digits when email omitted", () => {
    const body = validateWithSchema(userCreateInSchema, {
      full_name: "Staff One",
      phone: "98765-43210",
      role: "staff",
    });
    expect(body.email).toBe("9876543210@staff.harisree.local");
  });

  it("lowercases provided email", () => {
    const body = validateWithSchema(userCreateInSchema, {
      full_name: "A",
      phone: "9876543210",
      email: "  Admin@Example.COM ",
      role: "manager",
    });
    expect(body.email).toBe("admin@example.com");
  });
});

describe("username + password helpers", () => {
  it("slugFromName mirrors Python", () => {
    expect(slugFromName("Staff One")).toBe("staff_one");
  });

  it("allocateUsername uses name slug when free", async () => {
    const u = await allocateUsername(
      { usernameExists: async () => false },
      { requested: null, phoneDigits: "9876543210", fullName: "Krishna" },
    );
    expect(u).toBe("krishna");
  });

  it("generateReadablePassword uses first name + @digits", () => {
    const p = generateReadablePassword("Krishna Kumar");
    expect(p).toMatch(/^krishna@\d{3}$/);
  });
});

describe("POST /v1/businesses/:businessId/users", () => {
  let users: UsersRepository;
  let memberships: MembershipsRepository;
  let businesses: BusinessesRepository;
  let businessUsers: BusinessUsersRepository;
  let insertUser: ReturnType<typeof vi.fn>;
  let insertMem: ReturnType<typeof vi.fn>;
  let insertLog: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    users = {
      findById: vi.fn().mockResolvedValue(makeUser()),
      findByEmail: vi.fn(),
      usernameExists: vi.fn().mockResolvedValue(false),
      emailExistsActive: vi.fn().mockResolvedValue(false),
      insert: vi.fn().mockResolvedValue(undefined),
    } as unknown as UsersRepository;
    insertUser = users.insert as ReturnType<typeof vi.fn>;
    memberships = {
      findByUserAndBusiness: vi.fn().mockResolvedValue(makeMembership()),
      listByUserId: vi.fn(),
      findById: vi.fn(),
      insert: vi.fn().mockResolvedValue(undefined),
    } as unknown as MembershipsRepository;
    insertMem = memberships.insert as ReturnType<typeof vi.fn>;
    businesses = {
      findById: vi.fn().mockResolvedValue(makeBusiness()),
    } as unknown as BusinessesRepository;
    businessUsers = {
      listForBusiness: vi.fn(),
      todayStats: vi.fn().mockResolvedValue({
        scans: 0,
        stock_updates: 0,
        items_created: 0,
      }),
      activityCount7d: vi.fn().mockResolvedValue(0),
      insertActivityLog: vi.fn().mockResolvedValue(undefined),
    } as unknown as BusinessUsersRepository;
    insertLog = businessUsers.insertActivityLog as ReturnType<typeof vi.fn>;
  });

  function app() {
    return createApp({
      users,
      memberships,
      businesses,
      businessUsers,
      runInTransaction: async (fn) =>
        fn({
          users,
          memberships,
          businessUsers,
        }),
    });
  }

  it("201 UserCreateOut with generated_password when password omitted", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        full_name: "Staff One",
        phone: "9876543210",
        role: "staff",
      });
    expect(res.status).toBe(201);
    expect(res.body.login_email).toBe("9876543210@staff.harisree.local");
    expect(res.body.generated_password).toMatch(/^staff@\d{3}$/);
    expect(res.body.user).toMatchObject({
      name: "Staff One",
      role: "staff",
      email: "9876543210@staff.harisree.local",
      warehouse_name: "Main Warehouse",
      is_blocked: false,
    });
    expect(insertUser).toHaveBeenCalled();
    expect(insertMem).toHaveBeenCalled();
    expect(insertLog).toHaveBeenCalledWith(
      expect.objectContaining({ action_type: "USER_CREATE" }),
    );
  });

  it("generated_password null when password provided", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        full_name: "Staff Two",
        phone: "9123456789",
        role: "staff",
        password: "Secret123",
        email: "staff2@example.com",
      });
    expect(res.status).toBe(201);
    expect(res.body.generated_password).toBeNull();
    expect(res.body.login_email).toBe("staff2@example.com");
  });

  it("403 when manager", async () => {
    (
      memberships.findByUserAndBusiness as ReturnType<typeof vi.fn>
    ).mockResolvedValue(makeMembership({ role: "manager" }));
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        full_name: "X",
        phone: "9876543210",
        role: "staff",
      });
    expect(res.status).toBe(403);
  });

  it("409 when email already registered", async () => {
    (
      users.emailExistsActive as ReturnType<typeof vi.fn>
    ).mockResolvedValue(true);
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        full_name: "X",
        phone: "9876543210",
        role: "staff",
        email: "taken@example.com",
      });
    expect(res.status).toBe(409);
    expect(res.body.detail).toBe("Email already registered");
  });

  it("400 Invalid phone when digits < 6 after strip", async () => {
    // phone string length >= 6 but digits < 6 (e.g. "------")
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users`)
      .set("Authorization", `Bearer ${bearer()}`)
      .send({
        full_name: "X",
        phone: "------",
        role: "staff",
        email: "x@example.com",
      });
    expect(res.status).toBe(400);
    expect(res.body.detail).toBe("Invalid phone");
  });

  it("401 without auth", async () => {
    const res = await request(app())
      .post(`/v1/businesses/${BIZ_ID}/users`)
      .send({
        full_name: "X",
        phone: "9876543210",
        role: "staff",
      });
    expect(res.status).toBe(401);
  });
});
