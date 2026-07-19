/**
 * user_purchases — GET …/users/:userId/purchases
 * Source: source-app/backend/app/routers/users.py:user_purchases
 *         schemas/users.py:UserPurchaseBrief
 */
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import { parseUsersListLimit50to100 } from "./usersQueryParams";

export type UserPurchaseBriefOut = {
  id: string;
  human_id: string | null;
  purchase_date: string | null;
  status: string | null;
  total_amount: number | null;
  supplier_name: string | null;
  item_count: number | null;
};

export const parsePurchasesLimit = parseUsersListLimit50to100;

function isoOrNull(d: Date | string | null | undefined): string | null {
  if (d == null) return null;
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

/**
 * Port of purchase_date normalization in user_purchases:
 * - bare date → UTC midnight
 * - datetime → as-is
 * - else → created_at
 */
export function normalizePurchaseDate(
  purchaseDate: Date | string | null | undefined,
  createdAt: Date | string | null | undefined,
): string | null {
  if (purchaseDate == null) {
    return isoOrNull(createdAt);
  }
  if (typeof purchaseDate === "string") {
    const dayOnly = purchaseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dayOnly) {
      return `${dayOnly[1]}-${dayOnly[2]}-${dayOnly[3]}T00:00:00.000Z`;
    }
    const parsed = new Date(purchaseDate);
    if (Number.isNaN(parsed.getTime())) {
      return isoOrNull(createdAt);
    }
    // SQL DATE often arrives as midnight; treat midnight UTC as date-only.
    if (
      parsed.getUTCHours() === 0 &&
      parsed.getUTCMinutes() === 0 &&
      parsed.getUTCSeconds() === 0 &&
      parsed.getUTCMilliseconds() === 0
    ) {
      return new Date(
        Date.UTC(
          parsed.getUTCFullYear(),
          parsed.getUTCMonth(),
          parsed.getUTCDate(),
        ),
      ).toISOString();
    }
    return parsed.toISOString();
  }
  if (purchaseDate instanceof Date) {
    if (Number.isNaN(purchaseDate.getTime())) {
      return isoOrNull(createdAt);
    }
    // DDL purchase_date is DATE — emit UTC midnight of calendar day.
    return new Date(
      Date.UTC(
        purchaseDate.getUTCFullYear(),
        purchaseDate.getUTCMonth(),
        purchaseDate.getUTCDate(),
      ),
    ).toISOString();
  }
  return isoOrNull(createdAt);
}

/**
 * Port of user_purchases — no membership 404; empty list OK.
 */
export async function listPurchasesForBusiness(
  businessUsers: BusinessUsersRepository,
  businessId: string,
  userId: string,
  limit: number,
): Promise<UserPurchaseBriefOut[]> {
  const rows = await businessUsers.listPurchasesByUser(
    businessId,
    userId,
    limit,
  );
  return rows.map((r) => ({
    id: r.id,
    human_id: r.human_id,
    purchase_date: normalizePurchaseDate(r.purchase_date, r.created_at),
    status: r.status,
    total_amount: r.total_amount,
    supplier_name: r.supplier_name,
    item_count: r.item_count,
  }));
}
