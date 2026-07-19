/**
 * user_stock_adjustments — GET …/users/:userId/stock-adjustments
 * Source: source-app/backend/app/routers/users.py:user_stock_adjustments
 *         schemas/users.py:StockAdjustmentOut
 */
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import { parseUsersListLimit50to200 } from "./usersQueryParams";

export type UserStockAdjustmentOut = {
  id: string;
  item_id: string;
  item_name: string | null;
  old_qty: number;
  new_qty: number;
  adjustment_type: string;
  reason: string | null;
  updated_at: string;
};

export const parseStockAdjustmentsLimit = parseUsersListLimit50to200;

function isoRequired(d: Date | null | undefined): string {
  if (d == null) return new Date(0).toISOString();
  return d instanceof Date ? d.toISOString() : String(d);
}

/**
 * Port of user_stock_adjustments — no membership 404; empty list OK.
 */
export async function listStockAdjustmentsForBusiness(
  businessUsers: BusinessUsersRepository,
  businessId: string,
  userId: string,
  limit: number,
): Promise<UserStockAdjustmentOut[]> {
  const rows = await businessUsers.listStockAdjustmentsByUser(
    businessId,
    userId,
    limit,
  );
  return rows.map((r) => ({
    id: r.id,
    item_id: r.item_id,
    item_name: r.item_name,
    old_qty: r.old_qty,
    new_qty: r.new_qty,
    adjustment_type: r.adjustment_type,
    reason: r.reason,
    updated_at: isoRequired(r.updated_at),
  }));
}
