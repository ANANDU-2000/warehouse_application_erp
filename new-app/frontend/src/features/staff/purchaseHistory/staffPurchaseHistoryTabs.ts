/**
 * Staff purchase history period tabs — staff_purchase_history_page.dart
 * TabController indices → StaffPurchaseHistoryPeriod (+ low stock).
 */

export type StaffPhTab = "today" | "week" | "allTime" | "lowStock";

export const STAFF_PH_TAB_ORDER: StaffPhTab[] = [
  "today",
  "week",
  "allTime",
  "lowStock",
];

export const STAFF_PH_DEFAULT_TAB: StaffPhTab = "today";

/** Optional ?tab= deep-link (Flutter uses TabController only — aliases for SPA). */
export function staffPhTabFromQuery(raw: string | null): StaffPhTab {
  if (!raw) return STAFF_PH_DEFAULT_TAB;
  const v = raw.trim().toLowerCase();
  switch (v) {
    case "today":
      return "today";
    case "week":
      return "week";
    case "all":
    case "alltime":
    case "all_time":
      return "allTime";
    case "low":
    case "lowstock":
    case "low_stock":
      return "lowStock";
    default:
      return STAFF_PH_DEFAULT_TAB;
  }
}
