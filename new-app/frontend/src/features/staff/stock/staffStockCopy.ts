/**
 * Staff stock `/staff/stock` copy — StockPage(staff) / StockOperationalTopBar.
 * Source: stock_page.dart · stock_operational_top_bar.dart · stock_status_quick_chips.dart
 * · stock_warehouse_table_header.dart · stock_inline_search_bar.dart
 */

export const STAFF_STOCK_TITLE = "Stock";

/** Flutter StockOperationalTopBar leading → context.go('/staff/home'). */
export const STAFF_STOCK_BACK_HOME = "/staff/home";

export const STAFF_STOCK_TAB_STOCK = "Stock";
export const STAFF_STOCK_TAB_ACTIVITY = "Activity";

export const STAFF_STOCK_STATUS_ALL = "All";
export const STAFF_STOCK_STATUS_LOW = "Low";
export const STAFF_STOCK_STATUS_OUT = "Out";

/** stock_inline_search_bar.dart hintText */
export const STAFF_STOCK_SEARCH_HINT = "Search item, code, barcode…";

export const STAFF_STOCK_HDR_ITEM = "ITEM";
export const STAFF_STOCK_HDR_SYS = "SYS";
export const STAFF_STOCK_HDR_PHYS = "PHYS";
export const STAFF_STOCK_HDR_DIFF = "DIFF";

/** HexaEmptyState when catalog empty (no filters). */
export const STAFF_STOCK_EMPTY = "No stock items yet";

/** HexaEmptyState when status/search/delivery filters active — stock_page.dart */
export const STAFF_STOCK_EMPTY_FILTERED = "No items match filters";

export const STAFF_STOCK_ACTIVITY_EMPTY = "Activity";

/** stock_page.dart `_onSearchChanged` Timer */
export const STAFF_STOCK_DEBOUNCE_MS = 180;

/** Bootstrap list query sort — stock_page `_bootstrapStockListQueryOnce` */
export const STAFF_STOCK_DEFAULT_SORT = "recent";

/** StockOperationalTopBar tooltips / menu */
export const STAFF_STOCK_TOOLTIP_PERIOD = "Filter by period";
export const STAFF_STOCK_TOOLTIP_FILTERS = "Filters";
export const STAFF_STOCK_TOOLTIP_SEARCH = "Search";
export const STAFF_STOCK_TOOLTIP_HIDE_SEARCH = "Hide search";
export const STAFF_STOCK_MENU_SCAN = "Scan";

/** Period sheet — stock_page `_StockPeriodSheet` */
export const STAFF_STOCK_PERIOD_SHEET_TITLE = "Filter by period";

/** Filter sheet — operational_stock_filter_sheet */
export const STAFF_STOCK_FILTER_SHEET_TITLE = "Filters";
export const STAFF_STOCK_FILTER_CLEAR = "Clear advanced";
export const STAFF_STOCK_FILTER_APPLY = "Apply";
export const STAFF_STOCK_FILTER_REORDER = "Reorder only";
export const STAFF_STOCK_FILTER_PURCHASED = "Purchased in period";
export const STAFF_STOCK_FILTER_MISSING_BARCODE = "Missing barcode";
export const STAFF_STOCK_FILTER_MISSING_CODE = "Missing item code";

/** Scan — stock_operational_top_bar push */
export const STAFF_STOCK_SCAN_PATH = "/barcode/scan?return=stock";
