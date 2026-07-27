/**
 * Owner stock operational filters — StockOperationalFilters +
 * countWarehouseActiveFilters (stock_warehouse_filter_sheet.dart).
 */
import type { StockStatus } from "./stockStatus";

export type StockOpFilters = {
  missingBarcodeOnly: boolean;
  missingItemCodeOnly: boolean;
  reorderOnly: boolean;
  purchasedInPeriodOnly: boolean;
  unit: string;
  subcategory: string;
  supplier: string;
};

export const STOCK_OP_FILTERS_EMPTY: StockOpFilters = {
  missingBarcodeOnly: false,
  missingItemCodeOnly: false,
  reorderOnly: false,
  purchasedInPeriodOnly: false,
  unit: "",
  subcategory: "",
  supplier: "",
};

/** countWarehouseActiveFilters — excludes purchasedInPeriod (Flutter count too). */
export function countWarehouseActiveFilters(
  status: StockStatus,
  op: StockOpFilters,
): number {
  let n = 0;
  if (op.subcategory.trim()) n++;
  if (status !== "all") n++;
  if (op.missingBarcodeOnly) n++;
  if (op.missingItemCodeOnly) n++;
  if (op.reorderOnly) n++;
  if (op.unit.trim()) n++;
  if (op.supplier.trim()) n++;
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
  op: StockOpFilters,
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
  if (op.supplier.trim()) {
    const sup = String(item.supplier_name ?? "")
      .trim()
      .toLowerCase();
    if (sup !== op.supplier.trim().toLowerCase()) return false;
  }
  return true;
}
