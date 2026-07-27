/**
 * Staff purchase history FIELDS helpers —
 * staff_purchase_history_page.dart `_filterPurchases` / `_filterLowStock` / `_emptyMessage`.
 */
import {
  STAFF_PH_EMPTY_LOW,
  STAFF_PH_EMPTY_LOW_SEARCH,
  STAFF_PH_EMPTY_PERIOD,
  STAFF_PH_EMPTY_SEARCH,
} from "./staffPurchaseHistoryCopy";
import type {
  StaffPhLowFilter,
  StaffPhStatusFilter,
} from "./staffPurchaseHistoryFilters";

export type StaffPhPurchaseRow = Record<string, unknown>;
export type StaffPhLowStockRow = Record<string, unknown>;

function asNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

/** TradePurchase.isDelivered / JSON is_delivered */
export function purchaseIsDelivered(p: StaffPhPurchaseRow): boolean {
  if (typeof p.isDelivered === "boolean") return p.isDelivered;
  if (typeof p.is_delivered === "boolean") return p.is_delivered;
  return false;
}

/** Haystack — humanId + supplierName + line item names */
export function purchaseSearchHaystack(p: StaffPhPurchaseRow): string {
  const lines = Array.isArray(p.lines) ? p.lines : [];
  const lineNames = lines.map((l) => {
    if (l && typeof l === "object") {
      return asStr((l as Record<string, unknown>).itemName) ||
        asStr((l as Record<string, unknown>).item_name);
    }
    return "";
  });
  return [
    asStr(p.humanId) || asStr(p.human_id),
    asStr(p.supplierName) || asStr(p.supplier_name),
    ...lineNames,
  ]
    .join(" ")
    .toLowerCase();
}

export function purchaseMatchesSearch(
  p: StaffPhPurchaseRow,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return purchaseSearchHaystack(p).includes(q);
}

export function purchaseMatchesStatus(
  p: StaffPhPurchaseRow,
  status: StaffPhStatusFilter,
): boolean {
  if (status === "all") return true;
  const delivered = purchaseIsDelivered(p);
  if (status === "pending") return !delivered;
  if (status === "delivered") return delivered;
  return true;
}

/** `_filterPurchases` */
export function filterStaffPhPurchases(
  rows: StaffPhPurchaseRow[],
  opts: { status: StaffPhStatusFilter; query: string },
): StaffPhPurchaseRow[] {
  return rows.filter(
    (p) =>
      purchaseMatchesStatus(p, opts.status) &&
      purchaseMatchesSearch(p, opts.query),
  );
}

/** Critical: reorder > 0 && cur <= reorder * 0.5 */
export function lowStockIsCritical(item: StaffPhLowStockRow): boolean {
  const cur = asNum(item.current_stock);
  const reorder = asNum(item.reorder_level);
  return reorder > 0 && cur <= reorder * 0.5;
}

export function lowStockMatchesFilter(
  item: StaffPhLowStockRow,
  low: StaffPhLowFilter,
): boolean {
  if (low === "all") return true;
  return lowStockIsCritical(item);
}

export function lowStockMatchesSearch(
  item: StaffPhLowStockRow,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return asStr(item.name).toLowerCase().includes(q);
}

/** `_filterLowStock` */
export function filterStaffPhLowStock(
  rows: StaffPhLowStockRow[],
  opts: { low: StaffPhLowFilter; query: string },
): StaffPhLowStockRow[] {
  return rows.filter(
    (item) =>
      lowStockMatchesFilter(item, opts.low) &&
      lowStockMatchesSearch(item, opts.query),
  );
}

export function staffPhPurchasesEmptyTitle(opts: {
  itemCount: number;
  query: string;
}): string | null {
  if (opts.itemCount > 0) return null;
  return opts.query.trim()
    ? STAFF_PH_EMPTY_SEARCH
    : STAFF_PH_EMPTY_PERIOD;
}

export function staffPhLowEmptyTitle(opts: {
  itemCount: number;
  query: string;
}): string | null {
  if (opts.itemCount > 0) return null;
  return opts.query.trim()
    ? STAFF_PH_EMPTY_LOW_SEARCH
    : STAFF_PH_EMPTY_LOW;
}

/** formatStockQtyNumber — unit_utils.dart (low-stock meta line) */
export function formatStaffPhQtyNumber(n: number): string {
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) < 0.001) {
    return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const s = n.toFixed(2);
  return s.endsWith("0") ? s.slice(0, -1) : s;
}

export function lowStockMetaLine(item: StaffPhLowStockRow): string {
  const cur = asNum(item.current_stock);
  const reorder = asNum(item.reorder_level);
  const unit = asStr(item.unit);
  return `${formatStaffPhQtyNumber(cur)} / ${formatStaffPhQtyNumber(reorder)}${unit ? ` ${unit}` : ""}`;
}

export function lowStockName(item: StaffPhLowStockRow): string {
  return asStr(item.name) || "—";
}
