/**
 * Exact `/home/activity` copy — home_warehouse_activity_page.dart
 */
import type { HomePeriod } from "./homePeriod";

export const HOME_ACTIVITY_APPBAR_TITLE = "Warehouse activity";

export const HOME_ACTIVITY_PERIOD_CAPTION =
  "Applies to purchase center and warehouse activity";

/** Table header columns — _ActivityTableHeader */
export const HOME_ACTIVITY_COL_BILL = "Bill · Entered by";
export const HOME_ACTIVITY_COL_QTY = "Qty · Bags · Tins";
export const HOME_ACTIVITY_COL_VERIFIED = "Verified by";

/** Flutter `_periodTitle` — card section title by period. */
export function homeActivityPeriodTitle(period: HomePeriod): string {
  switch (period) {
    case "today":
      return "Recent activity (today)";
    case "week":
      return "Recent activity (week)";
    case "month":
      return "Recent activity (month)";
    case "year":
      return "Recent activity (year)";
    case "allTime":
      return "Recent activity (all time)";
    case "custom":
      return "Recent activity (custom range)";
  }
}

export const HOME_ACTIVITY_CUSTOM_RANGE_ERROR =
  "From date must be on or before To date";

/** STATES — FriendlyLoadError message (fixed; never raw exception). */
export const HOME_ACTIVITY_LOAD_ERROR = "Could not load activity";

/**
 * Full-page HexaEmptyState — home_warehouse_activity_page.dart
 * (subtitle differs from compact home feed in homeLoadCopy.ts)
 */
export const HOME_ACTIVITY_EMPTY_TITLE = "No activity in this period";

export const HOME_ACTIVITY_EMPTY_SUBTITLE =
  "Deliveries, purchases, and stock updates appear here.";
