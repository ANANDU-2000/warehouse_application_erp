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

/** `_onSearchChanged` Timer — staff_purchase_history_page.dart */
export const STAFF_PH_DEBOUNCE_MS = 250;

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

/** Low-stock row CTA — _StaffLowStockRow */
export const STAFF_PH_INFORM_OWNER = "Inform owner";

/** Low-stock row / Inform owner → staff_purchase_history_page.dart */
export const STAFF_PH_LOW_STOCK_PATH = "/staff/low-stock";

/** Detail push — `/staff/purchase-history/${purchase.id}` */
export function staffPhDetailPath(purchaseId: string): string {
  return `/staff/purchase-history/${encodeURIComponent(purchaseId)}`;
}

/**
 * FriendlyLoadError titles — staff_purchase_history_page.dart
 * `_loadErrorMessage` / low-stock branch.
 */
export const STAFF_PH_LOAD_FAILED = "Could not load purchase history";
export const STAFF_PH_LOW_LOAD_FAILED = "Could not load low stock items";
/** authSessionExpiredProvider branch — em dash */
export const STAFF_PH_SESSION_EXPIRED = "Session expired — sign in again";
/** friendlyApiError 401/403 */
export const STAFF_PH_FRIENDLY_401 = "Session expired. Please sign in again.";
export const STAFF_PH_FRIENDLY_402 =
  "Monthly AI usage limit reached. Ask your owner or try again next month.";
export const STAFF_PH_FRIENDLY_404 = "This item was not found.";
export const STAFF_PH_FRIENDLY_408 = "Request timed out. Please try again.";
export const STAFF_PH_FRIENDLY_429 =
  "Too many requests. Wait a moment and try again.";
export const STAFF_PH_FRIENDLY_409 =
  "Someone else updated this item. Please refresh and try again.";
export const STAFF_PH_FRIENDLY_400 =
  "Please check your input and try again.";
export const STAFF_PH_FRIENDLY_503 =
  "Server is starting up. Retrying automatically…";
export const STAFF_PH_FRIENDLY_5XX =
  "Something went wrong on our side. Please try again.";
export const STAFF_PH_FRIENDLY_NETWORK =
  "No connection. Changes will sync when online.";
export const STAFF_PH_FRIENDLY_GENERIC =
  "Something went wrong. Please try again.";

/** kFriendlyLoadNetworkSubtitle — friendly_load_error.dart */
export const STAFF_PH_RETRY_SUBTITLE = "Tap to retry.";
export const STAFF_PH_RETRY = "Retry";
export const STAFF_PH_LOADING = "Loading…";

/** ListSkeleton — purchases 10×88 · low 8×72 */
export const STAFF_PH_SKELETON_PURCHASE_ROWS = 10;
export const STAFF_PH_SKELETON_LOW_ROWS = 8;
export const STAFF_PH_SKELETON_PURCHASE_HEIGHT_PX = 88;
export const STAFF_PH_SKELETON_LOW_HEIGHT_PX = 72;

/**
 * registerProviderKeepAliveTimer 2m —
 * staffTradePurchasesHistoryProvider / staffLowStockAlertsProvider
 */
export const STAFF_PH_CACHE_TTL_MS = 120_000;
