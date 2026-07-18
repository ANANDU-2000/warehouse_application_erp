/**
 * get_user profile — GET …/users/:userId
 * Source: source-app/backend/app/routers/users.py:get_user, _user_row(profile=True)
 */
import { HttpError } from "../errors/httpError";
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import {
  buildUserListOut,
  type UserListOut,
} from "./usersList.service";

export type ProfileStatsOut = {
  stock_edits_total: number;
  purchases_total: number;
  scans_total: number;
  items_created_total: number;
};

/** FastAPI UserProfileOut JSON shape. */
export type UserProfileOut = UserListOut & {
  login_email: string | null;
  purchases_7d: number;
  stock_updates_7d: number;
  stats: ProfileStatsOut | null;
};

/**
 * Port of get_user + _user_row(..., profile=True).
 * Throws HttpError 404 when member not found / soft-deleted.
 */
export async function getUserProfileForBusiness(
  businessUsers: BusinessUsersRepository,
  businesses: BusinessesRepository,
  businessId: string,
  userId: string,
): Promise<UserProfileOut> {
  const member = await businessUsers.findMemberByUserId(businessId, userId);
  if (!member) {
    throw new HttpError(404, "User not found");
  }
  const biz = await businesses.findById(businessId);
  const warehouseName = biz?.name ?? null;
  const base = await buildUserListOut(
    businessUsers,
    businessId,
    member,
    warehouseName,
  );
  const [purchases_7d, stock_updates_7d, stats] = await Promise.all([
    businessUsers.purchases7d(businessId, userId),
    businessUsers.stockUpdates7d(businessId, userId),
    businessUsers.profileStats(businessId, userId),
  ]);
  return {
    ...base,
    login_email: member.email,
    purchases_7d,
    stock_updates_7d,
    stats: {
      stock_edits_total: stats.stock_edits_total,
      purchases_total: stats.purchases_total,
      scans_total: stats.scans_total,
      items_created_total: stats.items_created_total,
    },
  };
}
