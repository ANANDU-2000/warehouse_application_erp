/**
 * Owner stock `/stock` copy — StockPage(owner) / StockOperationalTopBar.
 * Source: stock_page.dart · stock_operational_top_bar.dart · stock_status_quick_chips.dart
 * · stock_warehouse_table_header.dart · stock_inline_search_bar.dart
 */

export const STOCK_TITLE = "Stock";

/** Flutter StockOperationalTopBar leading → context.go('/home'). */
export const STOCK_BACK_HOME = "/home";

export const STOCK_TAB_STOCK = "Stock";
export const STOCK_TAB_ACTIVITY = "Activity";

export const STOCK_STATUS_ALL = "All";
export const STOCK_STATUS_LOW = "Low";
export const STOCK_STATUS_OUT = "Out";

/** stock_inline_search_bar.dart hintText */
export const STOCK_SEARCH_HINT = "Search item, code, barcode…";

export const STOCK_HDR_ITEM = "ITEM";
export const STOCK_HDR_SYS = "SYS";
export const STOCK_HDR_PHYS = "PHYS";
export const STOCK_HDR_DIFF = "DIFF";

/** HexaEmptyState when catalog empty (no filters). */
export const STOCK_EMPTY = "No stock items yet";

/** HexaEmptyState when status/search/delivery filters active — stock_page.dart */
export const STOCK_EMPTY_FILTERED = "No items match filters";

export const STOCK_ACTIVITY_EMPTY = "Activity";

/** stock_page.dart `_onSearchChanged` Timer */
export const STOCK_DEBOUNCE_MS = 180;

/** Bootstrap list query sort — stock_page `_bootstrapStockListQueryOnce` */
export const STOCK_DEFAULT_SORT = "recent";

export const STOCK_LOAD_FAILED = "Stock list did not load";
/** FriendlyLoadError — stock_page.dart unable / auth */
export const STOCK_UNABLE = "Unable to load stock";
export const STOCK_SIGN_IN = "Sign in to load stock";
export const STOCK_SIGN_IN_SUB =
  "Warehouse list needs a valid session. Sign in and try again.";
/** friendly_load_error.dart kFriendlyLoadNetworkSubtitle */
export const STOCK_RETRY_SUBTITLE = "Tap to retry.";
export const STOCK_RETRY = "Retry";
export const STOCK_LOADING = "Loading stock…";
export const STOCK_LOAD_MORE = "Load more";

/** load_state_error.dart status subtitles */
export const STOCK_SUBTITLE_400 = "Invalid request. Please check your input.";
export const STOCK_SUBTITLE_401 = "Session expired. Please log in again.";
export const STOCK_SUBTITLE_402 =
  "Monthly AI usage limit reached. Contact your owner or try again next month.";
export const STOCK_SUBTITLE_403 = "You don't have permission for this.";
export const STOCK_SUBTITLE_404 = "Not found.";
export const STOCK_SUBTITLE_408 = "Request timed out. Please try again.";
export const STOCK_SUBTITLE_409 =
  "That conflicts with existing data. Try again.";
export const STOCK_SUBTITLE_429 =
  "Too many requests. Wait a moment and try again.";
export const STOCK_SUBTITLE_503 =
  "Server is starting up — wait about 30 seconds, then tap Retry.";
export const STOCK_SUBTITLE_5XX =
  "Server error. Please try again shortly.";
export const STOCK_SUBTITLE_NO_CONNECTION =
  "No connection. Check your network and try again.";

/** kStockListCacheTtl — surface_refresh_policy.dart 3 minutes */
export const STOCK_CACHE_TTL_MS = 180_000;

/** StockOperationalTopBar tooltips / menu */
export const STOCK_TOOLTIP_PERIOD = "Filter by period";
export const STOCK_TOOLTIP_FILTERS = "Filters";
export const STOCK_TOOLTIP_SEARCH = "Search";
export const STOCK_TOOLTIP_HIDE_SEARCH = "Hide search";
export const STOCK_MENU_SCAN = "Scan";

/** Owner-only actions (staff hidden) */
export const STOCK_TOOLTIP_EXPORT_PDF = "Export PDF";
export const STOCK_TOOLTIP_EXPORT_EXCEL = "Export Excel";
export const STOCK_TOOLTIP_ADD_ITEM = "Add item";

/** Period sheet — stock_page `_StockPeriodSheet` */
export const STOCK_PERIOD_SHEET_TITLE = "Filter by period";

/** Filter sheet — operational_stock_filter_sheet */
export const STOCK_FILTER_SHEET_TITLE = "Filters";
export const STOCK_FILTER_CLEAR = "Clear advanced";
export const STOCK_FILTER_APPLY = "Apply";
export const STOCK_FILTER_REORDER = "Reorder only";
export const STOCK_FILTER_PURCHASED = "Purchased in period";
export const STOCK_FILTER_MISSING_BARCODE = "Missing barcode";
export const STOCK_FILTER_MISSING_CODE = "Missing item code";

/** Scan — stock_operational_top_bar push */
export const STOCK_SCAN_PATH = "/barcode/scan?return=stock";
