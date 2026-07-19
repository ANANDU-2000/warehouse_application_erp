/**
 * active_sessions — GET …/users/active-sessions
 * Source: source-app/backend/app/routers/users.py:active_sessions
 */
import type { BusinessesRepository } from "../repositories/businesses.repository";
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import {
  buildUserListOut,
  type UserListOut,
} from "./usersList.service";

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

/**
 * Port of active_sessions — UserListOut for users active within 5 minutes.
 */
export async function listActiveSessionsForBusiness(
  businessUsers: BusinessUsersRepository,
  businesses: BusinessesRepository,
  businessId: string,
  now: Date = new Date(),
): Promise<UserListOut[]> {
  const cutoff = new Date(now.getTime() - ACTIVE_WINDOW_MS);
  const members = await businessUsers.listActiveSessions(businessId, cutoff);
  const biz = await businesses.findById(businessId);
  const warehouseName = biz?.name ?? null;
  const out: UserListOut[] = [];
  for (const m of members) {
    out.push(
      await buildUserListOut(businessUsers, businessId, m, warehouseName),
    );
  }
  return out;
}
