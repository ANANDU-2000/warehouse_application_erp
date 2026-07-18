/**
 * Account eligibility gates extracted from login router.
 * Source: source-app/backend/app/routers/auth.py lines 213–218.
 * Detail strings must stay identical for Phase 3.4 HTTP mapping.
 */
import type { UserRow } from "../repositories/types";
import { AccountBlockedError, AccountInactiveError } from "./errors";

/**
 * Throws AccountInactiveError / AccountBlockedError when user cannot sign in.
 * Order matches legacy: deleted_at → is_blocked → !is_active.
 */
export function assertAccountEligible(user: UserRow): void {
  if (user.deleted_at != null) {
    throw new AccountInactiveError("Account is inactive");
  }
  if (user.is_blocked) {
    throw new AccountBlockedError("Account is blocked");
  }
  if (!user.is_active) {
    throw new AccountInactiveError("Account is inactive");
  }
}
