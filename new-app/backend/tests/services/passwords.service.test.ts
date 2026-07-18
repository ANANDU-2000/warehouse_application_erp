import { describe, it, expect } from "vitest";
import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
} from "../../src/services/passwords.service";
import { PasswordStrengthError } from "../../src/services/errors";

describe("passwords.service (passwords.py)", () => {
  it("rejects password shorter than 8", () => {
    expect(() => validatePasswordStrength("abc12")).toThrow(PasswordStrengthError);
    expect(() => validatePasswordStrength("abc12")).toThrow(
      /at least 8 characters/,
    );
  });

  it("rejects password without a digit", () => {
    expect(() => validatePasswordStrength("abcdefgh")).toThrow(
      /at least one number/,
    );
  });

  it("rejects common passwords", () => {
    expect(() => validatePasswordStrength("password123")).toThrow(
      /stronger password/,
    );
  });

  it("accepts a strong password and round-trips hash/verify", () => {
    validatePasswordStrength("secure9pass");
    const hash = hashPassword("secure9pass");
    expect(hash.length).toBeGreaterThan(20);
    expect(verifyPassword("secure9pass", hash)).toBe(true);
    expect(verifyPassword("wrong9pass", hash)).toBe(false);
  });

  it("verifyPassword returns false for invalid hash (no throw)", () => {
    expect(verifyPassword("anything1", "not-a-valid-bcrypt-hash")).toBe(false);
  });
});
