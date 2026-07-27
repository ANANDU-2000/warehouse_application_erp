/**
 * Notifications page copy — SCAFFOLD / LAYOUT / FIELDS / BUTTONS labels.
 * Source: notifications_page.dart AppBar / search / filter chips / HexaEmptyState / clear dialog
 */
export const NOTIFICATIONS_TITLE = "Notifications";
/** Flutter HexaColors.appName — welcome seed */
export const NOTIFICATIONS_APP_NAME = "Harisree Warehouse";
/** Flutter popOrGo('/home') — staff uses history back when possible */
export const NOTIFICATIONS_BACK_FALLBACK = "/home";
/** Empty CTA — notifications_page.dart context.push */
export const NOTIFICATIONS_CTA_PATH_STAFF = "/staff/receive";
export const NOTIFICATIONS_CTA_PATH_OWNER = "/purchase/new";
export const NOTIFICATIONS_SEARCH_HINT = "Search alerts…";
export const NOTIFICATIONS_MARK_ALL_READ = "Mark all read";
export const NOTIFICATIONS_CLEAR_TOOLTIP = "Clear server notifications";
export const NOTIFICATIONS_LOAD_ERROR =
  "Could not refresh server notifications";
export const NOTIFICATIONS_RETRY = "Retry";
/** friendly_load_error.dart kFriendlyLoadNetworkSubtitle */
export const NOTIFICATIONS_RETRY_SUBTITLE = "Tap to retry.";
/** load_state_error.dart status subtitles */
export const NOTIFICATIONS_SUBTITLE_400 =
  "Invalid request. Please check your input.";
export const NOTIFICATIONS_SUBTITLE_401 =
  "Session expired. Please log in again.";
export const NOTIFICATIONS_SUBTITLE_402 =
  "Monthly AI usage limit reached. Contact your owner or try again next month.";
export const NOTIFICATIONS_SUBTITLE_403 =
  "You don't have permission for this.";
export const NOTIFICATIONS_SUBTITLE_404 = "Not found.";
export const NOTIFICATIONS_SUBTITLE_408 =
  "Request timed out. Please try again.";
export const NOTIFICATIONS_SUBTITLE_409 =
  "That conflicts with existing data. Try again.";
export const NOTIFICATIONS_SUBTITLE_429 =
  "Too many requests. Wait a moment and try again.";
export const NOTIFICATIONS_SUBTITLE_503 =
  "Server is starting up — wait about 30 seconds, then tap Retry.";
export const NOTIFICATIONS_SUBTITLE_5XX =
  "Server error. Please try again shortly.";
export const NOTIFICATIONS_SUBTITLE_NO_CONNECTION =
  "No connection. Check your network and try again.";
export const NOTIFICATIONS_SECTION_TODAY = "Today";
export const NOTIFICATIONS_SECTION_YESTERDAY = "Yesterday";
export const NOTIFICATIONS_SECTION_EARLIER = "Earlier";
export const NOTIFICATIONS_ORDER_NOW = "Order now";
export const NOTIFICATIONS_CARD_FALLBACK_TITLE = "Warehouse alert";

/** Clear confirm — _clearServerNotifications AlertDialog */
export const NOTIFICATIONS_CLEAR_DIALOG_TITLE = "Clear server notifications?";
export const NOTIFICATIONS_CLEAR_DIALOG_BODY =
  "Stock alerts generated from live warehouse data will still appear until the stock issue is fixed.";
export const NOTIFICATIONS_CLEAR_DIALOG_CANCEL = "Cancel";
export const NOTIFICATIONS_CLEAR_DIALOG_CONFIRM = "Clear";

export const NOTIFICATIONS_FILTER_ALL = "All";
export const NOTIFICATIONS_FILTER_CRITICAL = "Critical";
export const NOTIFICATIONS_FILTER_WAREHOUSE = "Warehouse";
export const NOTIFICATIONS_FILTER_PURCHASES = "Purchases";
export const NOTIFICATIONS_FILTER_STAFF = "Staff";
export const NOTIFICATIONS_FILTER_SYSTEM = "System";

/** Showing count — notifications_page.dart */
export const NOTIFICATIONS_SHOWING_PREFIX = "Showing ";
export const NOTIFICATIONS_SHOWING_MID = " of ";
export const NOTIFICATIONS_SHOWING_SUFFIX = " alerts";

/** HexaEmptyState titles — _emptyTitleForFilter */
export const NOTIFICATIONS_EMPTY_TITLE_ALL = "No alerts yet";
export const NOTIFICATIONS_EMPTY_TITLE_CRITICAL = "No critical alerts";
export const NOTIFICATIONS_EMPTY_TITLE_WAREHOUSE = "No warehouse alerts";
export const NOTIFICATIONS_EMPTY_TITLE_PURCHASES = "No purchase alerts";
export const NOTIFICATIONS_EMPTY_TITLE_STAFF = "No staff alerts";
export const NOTIFICATIONS_EMPTY_TITLE_SYSTEM = "No system notifications";
export const NOTIFICATIONS_EMPTY_TITLE_SEARCH = "No matches";

/** HexaEmptyState subtitles */
export const NOTIFICATIONS_EMPTY_SUB_ALL =
  "Stock, purchase, and system activity will appear here.";
export const NOTIFICATIONS_EMPTY_SUB_CRITICAL =
  "Critical shows urgent server alerts. Low/out stock stays under Warehouse.";
export const NOTIFICATIONS_EMPTY_SUB_WAREHOUSE =
  "Low stock, barcodes, and opening stock alerts appear here.";
export const NOTIFICATIONS_EMPTY_SUB_PURCHASES =
  "Payment due, delivery pending, and invoice updates appear here.";
export const NOTIFICATIONS_EMPTY_SUB_STAFF =
  "Deliveries, corrections, and warehouse requests appear here.";
export const NOTIFICATIONS_EMPTY_SUB_SYSTEM =
  "Exports, sync status, and general notices appear here.";
export const NOTIFICATIONS_EMPTY_SUB_SEARCH =
  "Try a different search or clear the search box.";
export const NOTIFICATIONS_EMPTY_SUB_FILTER_HIDDEN =
  "Switch to All or another tab — alerts are hidden by the current filter.";

export const NOTIFICATIONS_SHOW_ALL_ALERTS = "Show all alerts";
export const NOTIFICATIONS_CTA_NEW_PURCHASE = "New purchase";
export const NOTIFICATIONS_CTA_RECEIVE = "Receive shipment";
