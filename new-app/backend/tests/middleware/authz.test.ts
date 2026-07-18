import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { createRequireAuth, requireSuperAdmin } from "../../src/middleware/auth";
import {
  createRequireMembership,
  requireOwnerMembership,
  createRequireRole,
  createRequirePermission,
  formatRequiredRolesDetail,
} from "../../src/middleware/membership";
import { requirePermissionKey } from "../../src/services/permissions.service";
import { PermissionDeniedError } from "../../src/services/errors";
import {
  createAccessToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { MembershipsRepository } from "../../src/repositories/memberships.repository";
import type { UserRow, MembershipRow } from "../../src/repositories/types";

function makeUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
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
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    business_id: "11111111-2222-3333-4444-555555555555",
    role: "staff",
    permissions_json: null,
    created_at: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  };
}

function mockRes(): Response & { statusCode: number; body: unknown } {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

describe("createRequireAuth (get_current_user)", () => {
  let findById: ReturnType<typeof vi.fn>;
  let users: UsersRepository;
  let requireAuth: ReturnType<typeof createRequireAuth>;

  beforeEach(() => {
    findById = vi.fn();
    users = { findById, findByEmail: vi.fn() } as unknown as UsersRepository;
    requireAuth = createRequireAuth(users);
  });

  it("returns 401 Not authenticated without Bearer", async () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ detail: "Not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 Invalid token for garbage Bearer", async () => {
    const req = {
      headers: { authorization: "Bearer not-a-jwt" },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    await requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ detail: "Invalid token" });
  });

  it("returns 401 User not found", async () => {
    const user = makeUser();
    const token = createAccessToken(user.id, getJwtSettings(), 0);
    findById.mockResolvedValue(null);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = mockRes();
    await requireAuth(req, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ detail: "User not found" });
  });

  it("returns 401 Token revoked when tv mismatches", async () => {
    const user = makeUser({ token_version: 2 });
    const token = createAccessToken(user.id, getJwtSettings(), 0);
    findById.mockResolvedValue(user);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = mockRes();
    await requireAuth(req, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ detail: "Token revoked" });
  });

  it("returns 403 when blocked", async () => {
    const user = makeUser({ is_blocked: true });
    const token = createAccessToken(user.id, getJwtSettings(), 0);
    findById.mockResolvedValue(user);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = mockRes();
    await requireAuth(req, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ detail: "Account is blocked" });
  });

  it("sets req.user and calls next on success", async () => {
    const user = makeUser();
    const token = createAccessToken(user.id, getJwtSettings(), 0);
    findById.mockResolvedValue(user);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual(user);
  });
});

describe("requireSuperAdmin", () => {
  it("403 when not super admin", () => {
    const req = { user: makeUser({ is_super_admin: false }) } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    requireSuperAdmin(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ detail: "Super admin only" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when super admin", () => {
    const req = { user: makeUser({ is_super_admin: true }) } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;
    requireSuperAdmin(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("createRequireMembership", () => {
  it("403 when not a member", async () => {
    const findByUserAndBusiness = vi.fn().mockResolvedValue(null);
    const memberships = {
      findByUserAndBusiness,
    } as unknown as MembershipsRepository;
    const mw = createRequireMembership(memberships);
    const req = {
      user: makeUser(),
      params: { businessId: "11111111-2222-3333-4444-555555555555" },
    } as unknown as Request;
    const res = mockRes();
    await mw(req, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ detail: "Not a member of this business" });
  });

  it("sets req.membership on success", async () => {
    const mem = makeMembership();
    const findByUserAndBusiness = vi.fn().mockResolvedValue(mem);
    const memberships = {
      findByUserAndBusiness,
    } as unknown as MembershipsRepository;
    const mw = createRequireMembership(memberships);
    const req = {
      user: makeUser(),
      params: { businessId: mem.business_id },
    } as unknown as Request;
    const next = vi.fn() as NextFunction;
    await mw(req, mockRes(), next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.membership).toEqual(mem);
  });
});

describe("requireOwnerMembership / createRequireRole / createRequirePermission", () => {
  it("owner gate denies staff", () => {
    const req = {
      membership: makeMembership({ role: "staff" }),
    } as Request;
    const res = mockRes();
    requireOwnerMembership(req, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ detail: "Owner role required" });
  });

  it("role gate denies with Python-style detail", () => {
    const req = {
      user: makeUser(),
      membership: makeMembership({ role: "staff" }),
    } as Request;
    const res = mockRes();
    createRequireRole("owner", "admin")(req, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      detail: formatRequiredRolesDetail(["owner", "admin"]),
    });
  });

  it("role gate allows super_admin bypass", () => {
    const req = {
      user: makeUser({ is_super_admin: true }),
      membership: makeMembership({ role: "staff" }),
    } as Request;
    const next = vi.fn() as NextFunction;
    createRequireRole("owner")(req, mockRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("permission gate denies staff reports_access", () => {
    const req = {
      user: makeUser(),
      membership: makeMembership({ role: "staff" }),
    } as Request;
    const res = mockRes();
    createRequirePermission("reports_access")(req, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ detail: "Permission denied: reports_access" });
  });

  it("permission gate allows owner", () => {
    const req = {
      user: makeUser(),
      membership: makeMembership({ role: "owner" }),
    } as Request;
    const next = vi.fn() as NextFunction;
    createRequirePermission("reports_access")(req, mockRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("requirePermissionKey", () => {
  it("throws PermissionDeniedError", () => {
    expect(() => requirePermissionKey("user_manage", { user_manage: false })).toThrow(
      PermissionDeniedError,
    );
  });
});
