/**
 * user_created_items — GET …/users/:userId/created-items
 * Source: source-app/backend/app/routers/users.py:user_created_items
 *         schemas/users.py:CreatedItemOut
 */
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import { parseUsersListLimit50to200 } from "./usersQueryParams";

export type CreatedItemOut = {
  id: string;
  name: string | null;
  barcode: string | null;
  category: string | null;
  reorder_level: number | null;
  updated_at: string | null;
};

/** @deprecated use parseUsersListLimit50to200 — kept as alias for callers. */
export const parseCreatedItemsLimit = parseUsersListLimit50to200;

function isoOrNull(d: Date | null | undefined): string | null {
  if (d == null) return null;
  return d instanceof Date ? d.toISOString() : String(d);
}

/**
 * Port of user_created_items — no membership 404; empty list OK.
 */
export async function listCreatedItemsForBusiness(
  businessUsers: BusinessUsersRepository,
  businessId: string,
  userId: string,
  limit: number,
): Promise<CreatedItemOut[]> {
  const rows = await businessUsers.listCreatedItemsByUser(
    businessId,
    userId,
    limit,
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    barcode: r.item_code,
    category: r.category,
    reorder_level: r.reorder_level,
    updated_at: isoOrNull(r.updated_at),
  }));
}
