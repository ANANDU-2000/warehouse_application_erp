/**
 * Staff low stock FIELDS helpers —
 * low_stock_category_tree.dart filterLowStockGrouped / lowStockMatchesTab /
 * HexaEmptyState titles.
 */
import {
  STAFF_LS_EMPTY,
  STAFF_LS_EMPTY_SEARCH,
  STAFF_LS_EMPTY_SUB,
  STAFF_LS_SCOPE_ALL,
  STAFF_LS_SCOPE_CATEGORY,
  STAFF_LS_SCOPE_ITEM,
  STAFF_LS_SCOPE_SUBCATEGORY,
  STAFF_LS_SCOPE_SUPPLIER,
} from "./staffLowStockCopy";
import type { StaffLsSearchScope } from "./staffLowStockFilters";
import type { StaffLsTab } from "./staffLowStockTabs";

export type StaffLsItem = Record<string, unknown>;

/** category → subcategory → items */
export type StaffLsGrouped = Record<string, Record<string, StaffLsItem[]>>;

function asNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asNumNullable(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

export const STAFF_LS_SCOPE_LABEL: Record<StaffLsSearchScope, string> = {
  all: STAFF_LS_SCOPE_ALL,
  category: STAFF_LS_SCOPE_CATEGORY,
  subcategory: STAFF_LS_SCOPE_SUBCATEGORY,
  item: STAFF_LS_SCOPE_ITEM,
  supplier: STAFF_LS_SCOPE_SUPPLIER,
};

/** lowStockItemNeedsAttention */
export function lowStockItemNeedsAttention(item: StaffLsItem): boolean {
  const status = asStr(item.stock_status).toLowerCase();
  const stock = asNum(item.current_stock);
  const reorder = asNum(item.reorder_level);
  const pendingDel = asNumNullable(item.pending_delivery_qty) ?? 0;
  if (pendingDel > 0.001) return true;
  if (item.has_pending_order === true && item.last_purchase_delivered === false) {
    return true;
  }
  return (
    status === "low" ||
    status === "critical" ||
    status === "out" ||
    stock <= 0 ||
    (reorder > 0 && stock <= reorder)
  );
}

/** lowStockItemPendingDelivery */
export function lowStockItemPendingDelivery(item: StaffLsItem): boolean {
  const pendingDel = asNumNullable(item.pending_delivery_qty) ?? 0;
  if (pendingDel > 0.001) return true;
  return (
    item.has_pending_order === true && item.last_purchase_delivered === false
  );
}

/** lowStockMatchesTab */
export function lowStockMatchesTab(item: StaffLsItem, tab: StaffLsTab): boolean {
  const status = asStr(item.stock_status).toLowerCase();
  const stock = asNum(item.current_stock);
  const pending = item.has_pending_order === true;
  const purchasedQty = asNum(item.period_purchased_qty);
  switch (tab) {
    case "pendingOrder":
      return pending;
    case "outOfStock":
      return stock <= 0 || status === "out";
    case "purchasedInPeriod":
      return lowStockItemNeedsAttention(item) && (purchasedQty > 0 || pending);
    case "pendingDelivery":
      return lowStockItemPendingDelivery(item);
    case "allLow":
    default:
      return lowStockItemNeedsAttention(item);
  }
}

/** _itemSearchHay */
export function itemSearchHay(item: StaffLsItem): string {
  return [
    asStr(item.name),
    asStr(item.category_name),
    asStr(item.subcategory_name),
    asStr(item.item_code),
    asStr(item.supplier_name),
    asStr(item.last_purchase_human_id),
  ]
    .join(" ")
    .toLowerCase();
}

function itemMatchesSearch(
  it: StaffLsItem,
  cat: string,
  sub: string,
  q: string,
  searchScope: StaffLsSearchScope,
): boolean {
  if (!q) return true;
  const itemHay = itemSearchHay(it);
  switch (searchScope) {
    case "category":
      return cat.toLowerCase().includes(q) || itemHay.includes(q);
    case "subcategory":
      return sub.toLowerCase().includes(q) || itemHay.includes(q);
    case "item":
      return itemHay.includes(q);
    case "supplier":
      return (
        asStr(it.supplier_name).toLowerCase().includes(q) ||
        itemHay.includes(q)
      );
    case "all":
    default:
      return (
        cat.toLowerCase().includes(q) ||
        sub.toLowerCase().includes(q) ||
        itemHay.includes(q)
      );
  }
}

/** filterLowStockGrouped */
export function filterLowStockGrouped(opts: {
  grouped: StaffLsGrouped;
  tab: StaffLsTab;
  searchQuery: string;
  searchScope: StaffLsSearchScope;
  subcategoryFilter: string | null;
}): StaffLsGrouped {
  const q = opts.searchQuery.trim().toLowerCase();
  const subFilter = (opts.subcategoryFilter ?? "").trim().toLowerCase();
  const filtered: StaffLsGrouped = {};

  for (const [cat, subMap] of Object.entries(opts.grouped)) {
    if (
      q &&
      opts.searchScope === "category" &&
      !cat.toLowerCase().includes(q) &&
      !Object.values(subMap).some((items) =>
        items.some((it) => itemSearchHay(it).includes(q)),
      )
    ) {
      continue;
    }

    const nextSub: Record<string, StaffLsItem[]> = {};
    for (const [sub, items] of Object.entries(subMap)) {
      if (
        subFilter &&
        sub.toLowerCase() !== subFilter &&
        !sub.toLowerCase().includes(subFilter)
      ) {
        continue;
      }
      if (
        q &&
        opts.searchScope === "subcategory" &&
        !sub.toLowerCase().includes(q) &&
        !items.some((it) => itemSearchHay(it).includes(q))
      ) {
        continue;
      }

      const kept = items.filter(
        (it) =>
          lowStockMatchesTab(it, opts.tab) &&
          itemMatchesSearch(it, cat, sub, q, opts.searchScope),
      );
      if (kept.length > 0) nextSub[sub] = kept;
    }
    if (Object.keys(nextSub).length > 0) filtered[cat] = nextSub;
  }
  return filtered;
}

/** countLowStockForTab */
export function countLowStockForTab(
  grouped: StaffLsGrouped,
  tab: StaffLsTab,
): number {
  let n = 0;
  for (const subMap of Object.values(grouped)) {
    for (const items of Object.values(subMap)) {
      for (const item of items) {
        if (lowStockMatchesTab(item, tab)) n++;
      }
    }
  }
  return n;
}

/** flatten filtered count for empty title */
export function countFilteredItems(grouped: StaffLsGrouped): number {
  let n = 0;
  for (const subMap of Object.values(grouped)) {
    for (const items of Object.values(subMap)) {
      n += items.length;
    }
  }
  return n;
}

export function lowStockSubcategoryOptions(grouped: StaffLsGrouped): string[] {
  const subs = new Set<string>();
  for (const subMap of Object.values(grouped)) {
    for (const key of Object.keys(subMap)) {
      if (key.trim()) subs.add(key);
    }
  }
  return [...subs].sort((a, b) => a.localeCompare(b));
}

export function staffLsFiltersActive(opts: {
  searchScope: StaffLsSearchScope;
  subcategoryFilter: string | null;
}): boolean {
  return (
    opts.searchScope !== "all" ||
    !!(opts.subcategoryFilter && opts.subcategoryFilter.trim())
  );
}

/** Empty copy — tree empty / search / subcategory */
export function staffLsEmptyTitle(opts: {
  itemCount: number;
  query: string;
  subcategoryFilter: string | null;
}): string | null {
  if (opts.itemCount > 0) return null;
  if (opts.query.trim()) return STAFF_LS_EMPTY_SEARCH;
  if (opts.subcategoryFilter && opts.subcategoryFilter.trim()) {
    return STAFF_LS_EMPTY_SUB;
  }
  return STAFF_LS_EMPTY;
}
