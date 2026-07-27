/**
 * Staff low stock tree tabs — LowStockTreeTab + ?filter= aliases
 * low_stock_dashboard_page.dart `_tabOrder` / `_tabIndexFromFilter`.
 */

export type StaffLsTab =
  | "allLow"
  | "outOfStock"
  | "purchasedInPeriod"
  | "pendingOrder"
  | "pendingDelivery";

/** Visual tab order — segmented control */
export const STAFF_LS_TAB_ORDER: StaffLsTab[] = [
  "allLow",
  "outOfStock",
  "purchasedInPeriod",
  "pendingOrder",
  "pendingDelivery",
];

/**
 * GoRouter `?filter=` → tab index aliases.
 * Flutter: all|low → allLow; out; purchased|bought; pending; delivery|…
 */
export function staffLsTabFromFilter(raw: string | null): StaffLsTab {
  if (raw == null || raw.trim() === "") return "allLow";
  switch (raw.trim().toLowerCase()) {
    case "all":
    case "low":
      return "allLow";
    case "out":
      return "outOfStock";
    case "purchased":
    case "bought":
      return "purchasedInPeriod";
    case "pending":
      return "pendingOrder";
    case "delivery":
    case "pending_delivery":
    case "pending-delivery":
      return "pendingDelivery";
    case "delayed":
    case "verification":
    case "urgent":
    case "high_impact":
      return "allLow";
    default:
      return "allLow";
  }
}
