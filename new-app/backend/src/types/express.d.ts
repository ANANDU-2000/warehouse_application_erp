/**
 * Express request augmentation for Phase 3.6 authorization.
 * Source of behavior: source-app/backend/app/deps.py
 */
import type { UserRow, MembershipRow } from "../repositories/types";

declare global {
  namespace Express {
    interface Request {
      /** Set by createRequireAuth (get_current_user). */
      user?: UserRow;
      /** Set by createRequireMembership. */
      membership?: MembershipRow;
    }
  }
}

export {};
