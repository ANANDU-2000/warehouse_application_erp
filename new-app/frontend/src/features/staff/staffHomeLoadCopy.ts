/**
 * Exact staff-home STATES copy from Flutter source.
 * Smoke asserts these literals — do not paraphrase.
 *
 * Sources:
 * - staff_home_dashboard_widgets.dart — Could not load floor counts; activity empty/error
 * - section_inline_error.dart — Retry
 * - friendly_load_error.dart — Tap to retry.
 * - staff_purchase_history_page.dart — Session expired — sign in again
 */

export const STAFF_HOME_FLOOR_LOAD_ERROR = "Could not load floor counts";

export const STAFF_HOME_RETRY_LABEL = "Retry";

export const STAFF_HOME_RETRY_SUBTITLE = "Tap to retry.";

/** staff_purchase_history_page.dart session message (staff surfaces). */
export const STAFF_HOME_SESSION_EXPIRED = "Session expired — sign in again";

export const STAFF_HOME_NO_CONNECTION = "No connection";

/** StaffHomeRecentActivitySection empty. */
export const STAFF_HOME_ACTIVITY_EMPTY =
  "No activity yet today — tap Scan above.";

/** StaffHomeRecentActivitySection error. */
export const STAFF_HOME_ACTIVITY_ERROR = "Could not load recent activity.";

/** StaffHomeRecentActivitySection TextButton. */
export const STAFF_HOME_ACTIVITY_FULL_LOG = "Full activity log";

/** Inner header inside StaffHomeRecentActivitySection (Flutter double header). */
export const STAFF_HOME_ACTIVITY_INNER_TITLE = "Recent activity";
export const STAFF_HOME_ACTIVITY_INNER_SUBTITLE =
  "Scans, stock updates, and purchases today";

/** StaffHomeShiftSnapshotStrip empty title. */
export const STAFF_HOME_SHIFT_EMPTY = "No activity today";

/** StaffHomeShiftSnapshotStrip empty subtitle. */
export const STAFF_HOME_SHIFT_EMPTY_SUBTITLE =
  "Tap Stock or Scan to log work";

export const STAFF_HOME_SHIFT_TILE_LABELS = {
  scans: "Scans",
  stock: "Stock",
  purchases: "Purchases",
  deliveries: "Deliveries",
} as const;

/** Pending delivery cards — staff_home_pending_delivery_cards.dart */
export const STAFF_HOME_MARK_ARRIVED = "Mark arrived";
export const STAFF_HOME_VERIFY = "Verify";
export function staffHomeViewAllDeliveries(count: number): string {
  return `View all ${count} deliveries`;
}

/** StaffHomeWarehousePurchaseStats — SectionInlineError messages. */
export const STAFF_HOME_WAREHOUSE_STATS_ERROR = "Warehouse stats unavailable";
export const STAFF_HOME_PURCHASE_STATS_ERROR = "Purchase stats unavailable";

/** Stats box chrome — staff_home_dashboard_widgets.dart */
export const STAFF_HOME_STATS_WAREHOUSE_TITLE = "Warehouse";
export const STAFF_HOME_STATS_WAREHOUSE_SUBTITLE = "On hand now";
export const STAFF_HOME_STATS_PURCHASES_TITLE = "Purchases";
export const STAFF_HOME_STATS_PURCHASES_SUBTITLE = "This month";
export const STAFF_HOME_STATS_UNIT_LABELS = {
  bags: "Bags",
  kg: "KG",
  box: "Box",
  tin: "Tin",
} as const;
