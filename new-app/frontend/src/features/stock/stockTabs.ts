/**
 * Owner stock tab from `?tab=` — stock_page.dart `_tabIndex`.
 * Source: StockPage initialTab; matches staff pattern.
 */

export type StockTab = "stock" | "activity";

export const STOCK_DEFAULT_TAB: StockTab = "stock";

export const STOCK_TAB_ORDER: StockTab[] = ["stock", "activity"];

export const STOCK_TAB_LABEL: Record<StockTab, string> = {
  stock: "Stock",
  activity: "Activity",
};

/** Legacy: changes | movement | today | activity → Activity tab. */
export function stockTabFromQuery(raw: string | null): StockTab {
  const t = (raw ?? "").trim().toLowerCase();
  switch (t) {
    case "changes":
    case "movement":
    case "today":
    case "activity":
      return "activity";
    default:
      return STOCK_DEFAULT_TAB;
  }
}
