import { describe, it, expect } from "vitest";
import { assertAccountEligible } from "../../src/services/accountEligibility.service";
import {
  AccountBlockedError,
  AccountInactiveError,
} from "../../src/services/errors";
import type { UserRow } from "../../src/repositories/types";

function baseUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
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
    ...overrides,
  };
}

describe("accountEligibility.service (auth.py login gates)", () => {
  it("allows active, non-blocked, non-deleted user", () => {
    expect(() => assertAccountEligible(baseUser())).not.toThrow();
  });

  it("throws Account is inactive when deleted_at set", () => {
    expect(() =>
      assertAccountEligible(baseUser({ deleted_at: new Date() })),
    ).toThrow(AccountInactiveError);
    expect(() =>
      assertAccountEligible(baseUser({ deleted_at: new Date() })),
    ).toThrow("Account is inactive");
  });

  it("throws Account is blocked when is_blocked", () => {
    expect(() => assertAccountEligible(baseUser({ is_blocked: true }))).toThrow(
      AccountBlockedError,
    );
    expect(() => assertAccountEligible(baseUser({ is_blocked: true }))).toThrow(
      "Account is blocked",
    );
  });

  it("throws Account is inactive when !is_active", () => {
    expect(() => assertAccountEligible(baseUser({ is_active: false }))).toThrow(
      AccountInactiveError,
    );
    expect(() => assertAccountEligible(baseUser({ is_active: false }))).toThrow(
      "Account is inactive",
    );
  });

  it("checks deleted_at before is_blocked (same inactive message)", () => {
    expect(() =>
      assertAccountEligible(
        baseUser({ deleted_at: new Date(), is_blocked: true }),
      ),
    ).toThrow(AccountInactiveError);
  });
});
