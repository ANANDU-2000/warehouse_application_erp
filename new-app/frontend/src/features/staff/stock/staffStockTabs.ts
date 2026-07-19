/**
 * Staff stock tab from `?tab=` — stock_page.dart `_tabIndex`.
 * Source: StockPage initialTab; redirect `/staff/stock/changes` → `?tab=changes`.
 */

export type StaffStockTab = "stock" | "activity";

export const STAFF_STOCK_DEFAULT_TAB: StaffStockTab = "stock";

export const STAFF_STOCK_TAB_ORDER: StaffStockTab[] = ["stock", "activity"];

/** Legacy: changes | movement | today | activity → Activity tab. */
export function staffStockTabFromQuery(raw: string | null): StaffStockTab {
  const t = (raw ?? "").trim().toLowerCase();
  switch (t) {
    case "changes":
    case "movement":
    case "today":
    case "activity":
      return "activity";
    default:
      return STAFF_STOCK_DEFAULT_TAB;
  }
}
