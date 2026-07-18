/**
 * Resolve login email to a User row.
 * Source: source-app/backend/app/services/auth_login.py — port 1:1.
 */
import type { UsersRepository } from "../repositories/users.repository";
import type { UserRow } from "../repositories/types";

export function normalizeLoginEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}

/**
 * Load user by normalized email.
 * Empty or missing `@` → null (no repository call).
 */
export async function resolveUserByEmail(
  users: UsersRepository,
  email: string,
): Promise<UserRow | null> {
  const normalized = normalizeLoginEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return null;
  }
  return users.findByEmail(normalized);
}
