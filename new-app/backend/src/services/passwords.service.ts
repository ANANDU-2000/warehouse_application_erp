/**
 * Bcrypt password hashing.
 * Source: source-app/backend/app/services/passwords.py — port 1:1.
 */
import bcrypt from "bcrypt";
import { PasswordStrengthError } from "./errors";

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "qwerty123",
  "admin123",
  "12345678",
  "123456789",
  "letmein",
  "welcome123",
]);

/** Raises PasswordStrengthError if weak (legacy: ValueError). */
export function validatePasswordStrength(plain: string): void {
  const pwd = (plain || "").trim();
  if (pwd.length < 8) {
    throw new PasswordStrengthError("Password must be at least 8 characters");
  }
  if (!/\d/.test(pwd)) {
    throw new PasswordStrengthError("Password must include at least one number");
  }
  if (COMMON_PASSWORDS.has(pwd.toLowerCase())) {
    throw new PasswordStrengthError("Choose a stronger password");
  }
}

export function hashPassword(plain: string): string {
  validatePasswordStrength(plain);
  // Python bcrypt.gensalt() default cost is 12
  return bcrypt.hashSync(plain, bcrypt.genSaltSync(12));
}

/**
 * Verify plaintext against stored hash.
 * Invalid hash → false (no throw) — matches passwords.py ValueError → False.
 */
export function verifyPassword(plain: string, passwordHash: string): boolean {
  try {
    return bcrypt.compareSync(plain, passwordHash);
  } catch {
    return false;
  }
}
