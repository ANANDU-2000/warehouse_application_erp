/**
 * Staff purchase history `/staff/purchase-history` copy —
 * staff_purchase_history_page.dart (StaffPurchaseHistoryPage).
 */

export const STAFF_PH_TITLE = "Purchase orders";

/** AppBar leading pop; fallback when no history — staff home CTA push target. */
export const STAFF_PH_BACK_FALLBACK = "/staff/home";

export const STAFF_PH_TAB_TODAY = "Today";
export const STAFF_PH_TAB_WEEK = "Week";
export const STAFF_PH_TAB_ALL = "All time";
/** Low stock tab label without count — count is WIRE (lowAsync.maybeWhen). */
export const STAFF_PH_TAB_LOW = "Low stock";

/** Search hints — staff_purchase_history_page.dart */
export const STAFF_PH_SEARCH_HINT = "Search supplier, ID, items…";
export const STAFF_PH_SEARCH_HINT_LOW = "Search low stock items…";

/** Purchase status FilterChips */
export const STAFF_PH_STATUS_ALL = "All";
export const STAFF_PH_STATUS_UNDELIVERED = "Undelivered";
export const STAFF_PH_STATUS_DELIVERED = "Delivered";

/** Low-stock tab FilterChips */
export const STAFF_PH_LOW_ALL = "All low";
export const STAFF_PH_LOW_CRITICAL = "Critical";

/** Empty copy — purchases / low / search */
export const STAFF_PH_EMPTY_PERIOD = "No purchase orders in this period";
export const STAFF_PH_EMPTY_SEARCH = "No orders match your search";
export const STAFF_PH_EMPTY_LOW = "No low stock items";
export const STAFF_PH_EMPTY_LOW_SEARCH = "No items match your search";

/** Low-stock row CTA — _StaffLowStockRow (BUTTONS/WIRE) */
export const STAFF_PH_INFORM_OWNER = "Inform owner";
