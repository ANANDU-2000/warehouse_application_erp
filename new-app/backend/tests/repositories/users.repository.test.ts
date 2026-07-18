import { describe, it, expect } from "vitest";
import { UsersRepository } from "../../src/repositories/users.repository";
import type { UserRow } from "../../src/repositories/types";
import { createMockPool } from "./mockPool";

const sampleUser: UserRow = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  email: "admin@example.com",
  username: "admin",
  password_hash: "$2b$12$hashed",
  google_sub: null,
  phone: null,
  name: "Admin",
  is_super_admin: true,
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

describe("UsersRepository", () => {
  it("findById returns a user row when present", async () => {
    const { pool, request, input, query } = createMockPool([sampleUser]);
    const repo = new UsersRepository(pool);

    const row = await repo.findById(sampleUser.id);

    expect(row).toEqual(sampleUser);
    expect(request).toHaveBeenCalledOnce();
    expect(input).toHaveBeenCalledWith("id", expect.anything(), sampleUser.id);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("FROM users WHERE id = @id"),
    );
  });

  it("findById returns null when absent", async () => {
    const { pool } = createMockPool([]);
    const repo = new UsersRepository(pool);
    expect(await repo.findById(sampleUser.id)).toBeNull();
  });

  it("findByEmail queries by email param", async () => {
    const { pool, input, query } = createMockPool([sampleUser]);
    const repo = new UsersRepository(pool);

    const row = await repo.findByEmail("admin@example.com");

    expect(row?.email).toBe("admin@example.com");
    expect(input).toHaveBeenCalledWith(
      "email",
      expect.anything(),
      "admin@example.com",
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("FROM users WHERE email = @email"),
    );
  });
});
