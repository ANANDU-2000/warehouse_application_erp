/**
 * Staff low stock `/staff/low-stock` copy —
 * low_stock_dashboard_page.dart (LowStockDashboardPage staffMode: true).
 */

export const STAFF_LS_TITLE = "Low stock";

/** AppBar leading pop; fallback staff home. */
export const STAFF_LS_BACK_FALLBACK = "/staff/home";

/** Autocomplete field hint */
export const STAFF_LS_SEARCH_HINT = "Search item, subcategory, supplier…";

/** Debounce — low_stock_dashboard_page.dart fieldViewBuilder Timer */
export const STAFF_LS_DEBOUNCE_MS = 200;

/** Filter sheet IconButton tooltip */
export const STAFF_LS_FILTER_TOOLTIP = "Search & filter";

/** Filter sheet — _showFiltersSheet */
export const STAFF_LS_FILTER_SHEET_TITLE = "Filters";
export const STAFF_LS_FILTER_SHEET_SUB =
  "Search scope and subcategory.";
export const STAFF_LS_FILTER_SEARCH_IN = "Search in";
export const STAFF_LS_FILTER_SUBCATEGORY = "Subcategory";
export const STAFF_LS_FILTER_ALL_SUBS = "All subcategories";
export const STAFF_LS_FILTER_APPLY = "Apply filters";
export const STAFF_LS_FILTER_CLEAR = "Clear filters";

export const STAFF_LS_SCOPE_ALL = "All fields";
export const STAFF_LS_SCOPE_CATEGORY = "Category";
export const STAFF_LS_SCOPE_SUBCATEGORY = "Subcategory";
export const STAFF_LS_SCOPE_ITEM = "Item name";
export const STAFF_LS_SCOPE_SUPPLIER = "Supplier";

/** Attention strip under search — count is WIRE */
export const STAFF_LS_ATTENTION_SUFFIX = "need attention · Period follows Home";

export function staffLsAttentionLine(count: number): string {
  return `${count} ${STAFF_LS_ATTENTION_SUFFIX}`;
}

/** Segmented short labels — _LowStockSegmentedTabs._label */
export const STAFF_LS_TAB_ALL = "All";
export const STAFF_LS_TAB_OUT = "Out";
export const STAFF_LS_TAB_BOUGHT = "Bought";
export const STAFF_LS_TAB_PENDING = "Pending";
export const STAFF_LS_TAB_DELIVERY = "Delivery";

/** Full tab labels — _tabLabel (PDF filterSummary / filters) */
export const STAFF_LS_TAB_ALL_FULL = "All low";
export const STAFF_LS_TAB_OUT_FULL = "Out of stock";
export const STAFF_LS_TAB_BOUGHT_FULL = "Purchased in period";
export const STAFF_LS_TAB_PENDING_FULL = "Pending order";
export const STAFF_LS_TAB_DELIVERY_FULL = "Pending delivery";

/** HexaEmptyState — low_stock_category_tree.dart */
export const STAFF_LS_EMPTY = "No low-stock items here";
export const STAFF_LS_EMPTY_SUB = "No items in this subcategory.";
export const STAFF_LS_EMPTY_SEARCH = "No low-stock items here";

/** AppBar actions tooltips */
export const STAFF_LS_PDF_TOOLTIP = "Download PDF";
export const STAFF_LS_CSV_TOOLTIP = "Copy CSV";

/** Staff row CTA — low_stock_compact_item_row / detail sheet (BUTTONS+) */
export const STAFF_LS_INFORM = "Inform";
export const STAFF_LS_INFORM_OWNER = "Inform owner";
export const STAFF_LS_OWNER_INFORMED = "Owner informed";
export const STAFF_LS_SENT = "Sent";
export const STAFF_LS_PLUS_STOCK = "+ Stock";
export const STAFF_LS_RECEIVE = "Receive delivery";
export const STAFF_LS_ITEM_PROFILE = "Item profile";
export const STAFF_LS_SET_REORDER = "Set reorder level";
export const STAFF_LS_UPDATE_SYSTEM = "Update system stock";
export const STAFF_LS_MORE = "More";

/** SnackBars — low_stock_dashboard_page.dart */
export const STAFF_LS_EXPORT_EMPTY = "No items in this view to export";
export const STAFF_LS_PDF_PREPARING = "Preparing low-stock PDF…";
export function staffLsOwnerNotified(name: string): string {
  return `Owner notified about ${name}`;
}

/** Staff receive — _receive(staffMode) */
export const STAFF_LS_RECEIVE_PATH = "/staff/receive";
export function staffLsReceivePath(humanId: string | null): string {
  if (humanId && humanId.trim()) {
    return `${STAFF_LS_RECEIVE_PATH}/${encodeURIComponent(humanId.trim())}`;
  }
  return STAFF_LS_RECEIVE_PATH;
}

/** Item profile — detail sheet */
export function staffLsItemPath(itemId: string): string {
  return `/catalog/item/${encodeURIComponent(itemId)}`;
}

/** Default unit — LowStockCompactItemRow / StockRowMetrics */
export const STAFF_LS_DEFAULT_UNIT = "bag";
export const STAFF_LS_DEFAULT_NAME = "Item";
