import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import { createApp } from "../../src/app";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { UserRow } from "../../src/repositories/types";
import { JwtTokenIssuer } from "../../src/auth/jwtTokenIssuer";
import {
  createAccessToken,
  createRefreshToken,
  decodeAccessToken,
  decodeRefreshToken,
  getJwtSettings,
} from "../../src/services/jwtTokens.service";

function makeUser(overrides: Partial<UserRow> = {}): UserRow {
  const password_hash =
    overrides.password_hash !== undefined
      ? overrides.password_hash
      : bcrypt.hashSync("secure9pass", 12);
  return {
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    email: "admin@example.com",
    username: "admin",
    password_hash,
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

describe("POST /v1/auth/login", () => {
  let findByEmail: ReturnType<typeof vi.fn>;
  let findById: ReturnType<typeof vi.fn>;
  let users: UsersRepository;
  const issuer = new JwtTokenIssuer();

  beforeEach(() => {
    findByEmail = vi.fn();
    findById = vi.fn();
    users = {
      findById,
      findByEmail,
    } as unknown as UsersRepository;
  });

  function app() {
    return createApp({
      auth: {
        users,
        tokenIssuer: issuer,
      },
    });
  }

  it("returns 400 when email is missing/invalid", async () => {
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ password: "x" });
    expect(res.status).toBe(400);
    expect(res.body.detail).toBe(
      "Sign in with your email address and password",
    );
    expect(findByEmail).not.toHaveBeenCalled();
  });

  it("returns 401 when user not found", async () => {
    findByEmail.mockResolvedValue(null);
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ email: "nobody@example.com", password: "secure9pass" });
    expect(res.status).toBe(401);
    expect(res.body.detail).toBe("Invalid email or password");
  });

  it("returns 401 when password_hash is null (Google-only)", async () => {
    findByEmail.mockResolvedValue(makeUser({ password_hash: null }));
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ email: "admin@example.com", password: "secure9pass" });
    expect(res.status).toBe(401);
    expect(res.body.detail).toBe("Invalid email or password");
  });

  it("returns 401 when password is wrong", async () => {
    findByEmail.mockResolvedValue(makeUser());
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ email: "admin@example.com", password: "wrong9pass" });
    expect(res.status).toBe(401);
    expect(res.body.detail).toBe("Invalid email or password");
  });

  it("returns 403 when account is deleted", async () => {
    findByEmail.mockResolvedValue(makeUser({ deleted_at: new Date() }));
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ email: "admin@example.com", password: "secure9pass" });
    expect(res.status).toBe(403);
    expect(res.body.detail).toBe("Account is inactive");
  });

  it("returns 403 when account is blocked", async () => {
    findByEmail.mockResolvedValue(makeUser({ is_blocked: true }));
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ email: "admin@example.com", password: "secure9pass" });
    expect(res.status).toBe(403);
    expect(res.body.detail).toBe("Account is blocked");
  });

  it("returns 403 when account is inactive", async () => {
    findByEmail.mockResolvedValue(makeUser({ is_active: false }));
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ email: "admin@example.com", password: "secure9pass" });
    expect(res.status).toBe(403);
    expect(res.body.detail).toBe("Account is inactive");
  });

  it("returns 200 TokenPair when credentials are valid", async () => {
    const user = makeUser();
    findByEmail.mockResolvedValue(user);
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ email: "admin@example.com", password: "secure9pass" });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toEqual(expect.any(String));
    expect(res.body.refresh_token).toEqual(expect.any(String));
    expect(res.body.expires_in).toBe(getJwtSettings().accessTtlMinutes * 60);
    const claims = decodeAccessToken(res.body.access_token as string);
    expect(claims?.userId).toBe(user.id);
    expect(claims?.tokenVersion).toBe(0);
  });

  it("accepts identifier alias for email", async () => {
    findByEmail.mockResolvedValue(makeUser());
    const res = await request(app())
      .post("/v1/auth/login")
      .send({ identifier: "admin@example.com", password: "secure9pass" });
    expect(res.status).toBe(200);
    expect(findByEmail).toHaveBeenCalledWith("admin@example.com");
  });
});

describe("POST /v1/auth/refresh", () => {
  let findById: ReturnType<typeof vi.fn>;
  let users: UsersRepository;
  const issuer = new JwtTokenIssuer();

  beforeEach(() => {
    findById = vi.fn();
    users = {
      findById,
      findByEmail: vi.fn(),
    } as unknown as UsersRepository;
  });

  function app() {
    return createApp({
      auth: { users, tokenIssuer: issuer },
    });
  }

  it("returns 401 for invalid refresh token", async () => {
    const res = await request(app())
      .post("/v1/auth/refresh")
      .send({ refresh_token: "not-a-jwt" });
    expect(res.status).toBe(401);
    expect(res.body.detail).toBe("Invalid refresh token");
  });

  it("returns 401 when user not found", async () => {
    const user = makeUser();
    const refresh = createRefreshToken(user.id);
    findById.mockResolvedValue(null);
    const res = await request(app())
      .post("/v1/auth/refresh")
      .send({ refresh_token: refresh });
    expect(res.status).toBe(401);
    expect(res.body.detail).toBe("User not found");
  });

  it("returns 200 TokenPair for valid refresh", async () => {
    const user = makeUser({ token_version: 2 });
    const refresh = createRefreshToken(user.id);
    findById.mockResolvedValue(user);
    const res = await request(app())
      .post("/v1/auth/refresh")
      .send({ refresh_token: refresh });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toEqual(expect.any(String));
    expect(res.body.refresh_token).toEqual(expect.any(String));
    const claims = decodeAccessToken(res.body.access_token as string);
    expect(claims?.tokenVersion).toBe(2);
  });
});

describe("jwtTokens.service", () => {
  it("round-trips access and refresh; wrong typ returns null", () => {
    const userId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const access = createAccessToken(userId, getJwtSettings(), 3);
    const refresh = createRefreshToken(userId);
    expect(decodeAccessToken(access)?.tokenVersion).toBe(3);
    expect(decodeRefreshToken(refresh)).toBe(userId);
    expect(decodeAccessToken(refresh)).toBeNull();
    expect(decodeRefreshToken(access)).toBeNull();
  });
});

describe("POST /v1/auth stubs", () => {
  it("returns 501 for register", async () => {
    const res = await request(createApp()).post("/v1/auth/register").send({});
    expect(res.status).toBe(501);
    expect(res.body.detail).toMatch(/Not implemented/);
  });

  it("returns 501 for google (OAuth deferred)", async () => {
    const res = await request(createApp()).post("/v1/auth/google").send({});
    expect(res.status).toBe(501);
  });
});
