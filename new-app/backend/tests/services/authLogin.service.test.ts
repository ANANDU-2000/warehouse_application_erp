import { describe, it, expect, vi } from "vitest";
import {
  normalizeLoginEmail,
  resolveUserByEmail,
} from "../../src/services/authLogin.service";
import type { UsersRepository } from "../../src/repositories/users.repository";
import type { UserRow } from "../../src/repositories/types";

const sampleUser: UserRow = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  email: "admin@example.com",
  username: "admin",
  password_hash: "$2b$12$hashed",
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
};

describe("authLogin.service (auth_login.py)", () => {
  it("normalizeLoginEmail strips and lowercases", () => {
    expect(normalizeLoginEmail("  Admin@Example.COM ")).toBe("admin@example.com");
    expect(normalizeLoginEmail("")).toBe("");
  });

  it("resolveUserByEmail returns null without repo call when no @", async () => {
    const findByEmail = vi.fn();
    const users = { findByEmail } as unknown as UsersRepository;

    expect(await resolveUserByEmail(users, "notanemail")).toBeNull();
    expect(await resolveUserByEmail(users, "")).toBeNull();
    expect(await resolveUserByEmail(users, "   ")).toBeNull();
    expect(findByEmail).not.toHaveBeenCalled();
  });

  it("resolveUserByEmail calls findByEmail with normalized email", async () => {
    const findByEmail = vi.fn().mockResolvedValue(sampleUser);
    const users = { findByEmail } as unknown as UsersRepository;

    const row = await resolveUserByEmail(users, "  Admin@Example.COM ");

    expect(row).toEqual(sampleUser);
    expect(findByEmail).toHaveBeenCalledExactlyOnceWith("admin@example.com");
  });
});
