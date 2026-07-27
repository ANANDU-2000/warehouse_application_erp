/**
 * Staff stock operational filters — StockOperationalFilters +
 * countWarehouseActiveFilters (stock_warehouse_filter_sheet.dart).
 */
import type { StaffStockStatus } from "./staffStockStatus";

export type StaffStockOpFilters = {
  missingBarcodeOnly: boolean;
  missingItemCodeOnly: boolean;
  reorderOnly: boolean;
  purchasedInPeriodOnly: boolean;
  unit: string;
  subcategory: string;
};

export const STAFF_STOCK_OP_FILTERS_EMPTY: StaffStockOpFilters = {
  missingBarcodeOnly: false,
  missingItemCodeOnly: false,
  reorderOnly: false,
  purchasedInPeriodOnly: false,
  unit: "",
  subcategory: "",
};

/** countWarehouseActiveFilters — excludes purchasedInPeriod (Flutter count too). */
export function countWarehouseActiveFilters(
  status: StaffStockStatus,
  op: StaffStockOpFilters,
): number {
  let n = 0;
  if (op.subcategory.trim()) n++;
  if (status !== "all") n++;
  if (op.missingBarcodeOnly) n++;
  if (op.missingItemCodeOnly) n++;
  if (op.reorderOnly) n++;
  if (op.unit.trim()) n++;
  return n;
}

function asNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** filterStockListClient — stock_period_utils.dart */
export function itemMatchesOpFilters(
  item: Record<string, unknown>,
  op: StaffStockOpFilters,
): boolean {
  if (op.missingBarcodeOnly && item.missing_barcode !== true) return false;
  if (op.missingItemCodeOnly && item.missing_item_code !== true) return false;
  if (op.reorderOnly) {
    const ro = asNum(item.reorder_level);
    const cur = asNum(item.current_stock);
    if (ro <= 0 || cur > ro) return false;
  }
  if (op.unit.trim()) {
    const u = String(item.unit ?? item.stock_unit ?? "")
      .trim()
      .toLowerCase();
    if (u !== op.unit.trim().toLowerCase()) return false;
  }
  if (op.purchasedInPeriodOnly) {
    const purchased = asNum(item.period_purchased_qty);
    if (purchased <= 0) return false;
  }
  if (op.subcategory.trim()) {
    const sub = String(item.subcategory_name ?? item.subcategory ?? "")
      .trim()
      .toLowerCase();
    if (sub !== op.subcategory.trim().toLowerCase()) return false;
  }
  return true;
}
