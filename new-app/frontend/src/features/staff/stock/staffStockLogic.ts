/**
 * Staff stock FIELDS/BUTTONS helpers — stock_page empty titles · status chips ·
 * stock_period_utils sort/search rank + op filters (client; WIRE fills rows).
 */
import {
  STAFF_STOCK_EMPTY,
  STAFF_STOCK_EMPTY_FILTERED,
} from "./staffStockCopy";
import {
  itemMatchesOpFilters,
  type StaffStockOpFilters,
} from "./staffStockFilters";
import type { StaffStockStatus } from "./staffStockStatus";

export type StaffStockRow = Record<string, unknown>;

function asNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

/**
 * Status chip filter — mirrors API `status` query used by Low→shortage / Out / All.
 * Client-side for local catalog until WIRE; Low chip selects shortage (union low+critical).
 */
export function itemMatchesStockStatus(
  item: StaffStockRow,
  status: StaffStockStatus,
): boolean {
  if (status === "all") return true;
  const st = asStr(item.stock_status).toLowerCase();
  const cur = asNum(item.current_stock);
  if (status === "out") {
    return st === "out" || cur <= 0;
  }
  // shortage (Low chip): low ∪ critical ∪ shortage label
  if (st === "low" || st === "critical" || st === "shortage") return true;
  const reorder = asNum(item.reorder_level);
  if (reorder > 0 && cur > 0 && cur <= reorder) return true;
  return false;
}

/** Haystack for client search rank — name / item_code / barcode. */
export function itemStockSearchHaystack(item: StaffStockRow): string {
  return [
    asStr(item.name),
    asStr(item.item_code),
    asStr(item.barcode),
  ]
    .join(" ")
    .toLowerCase();
}

export function itemMatchesStockSearch(
  item: StaffStockRow,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return itemStockSearchHaystack(item).includes(q);
}

/** stock_period_utils `_stockNamePrefixRank` */
export function stockNamePrefixRank(
  item: StaffStockRow,
  query: string,
): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const name = asStr(item.name).toLowerCase();
  const code = asStr(item.item_code).toLowerCase();
  if (name.startsWith(q) || code.startsWith(q)) return 0;
  if (name.includes(q) || code.includes(q)) return 1;
  return 2;
}

export function filterStaffStockRows(
  items: readonly StaffStockRow[],
  args: {
    status: StaffStockStatus;
    query: string;
    op?: StaffStockOpFilters;
  },
): StaffStockRow[] {
  const q = args.query.trim().toLowerCase();
  return items.filter((it) => {
    if (!itemMatchesStockStatus(it, args.status)) return false;
    if (args.op && !itemMatchesOpFilters(it, args.op)) return false;
    if (q && !itemMatchesStockSearch(it, q)) return false;
    return true;
  });
}

/**
 * Empty title — stock_page HexaEmptyState (catalog / filters branch only).
 * Deferred: "Stock list did not load" (needs chip counts from WIRE).
 */
export function staffStockListEmptyTitle(args: {
  itemCount: number;
  status: StaffStockStatus;
  query: string;
  deliveryFilterActive?: boolean;
  advancedFilterCount?: number;
}): string | null {
  if (args.itemCount > 0) return null;
  const filtered =
    args.status !== "all" ||
    args.query.trim().length > 0 ||
    Boolean(args.deliveryFilterActive) ||
    (args.advancedFilterCount ?? 0) > 0;
  return filtered ? STAFF_STOCK_EMPTY_FILTERED : STAFF_STOCK_EMPTY;
}
