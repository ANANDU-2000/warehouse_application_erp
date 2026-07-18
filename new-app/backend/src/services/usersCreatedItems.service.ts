/**
 * user_created_items — GET …/users/:userId/created-items
 * Source: source-app/backend/app/routers/users.py:user_created_items
 *         schemas/users.py:CreatedItemOut
 */
import { HttpError } from "../errors/httpError";
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";

export type CreatedItemOut = {
  id: string;
  name: string | null;
  barcode: string | null;
  category: string | null;
  reorder_level: number | null;
  updated_at: string | null;
};

/**
 * Parse FastAPI Query(limit=50, ge=1, le=200).
 * Missing / empty → 50. Invalid → 422.
 */
export function parseCreatedItemsLimit(raw: unknown): number {
  if (raw === undefined || raw === null || raw === "") {
    return 50;
  }
  const s = Array.isArray(raw) ? String(raw[0]) : String(raw);
  if (!/^\d+$/.test(s)) {
    throw new HttpError(422, "limit must be an integer between 1 and 200");
  }
  const n = Number(s);
  if (!Number.isInteger(n) || n < 1 || n > 200) {
    throw new HttpError(422, "limit must be an integer between 1 and 200");
  }
  return n;
}

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
