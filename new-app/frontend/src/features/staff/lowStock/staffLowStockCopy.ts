/**
 * Staff low stock `/staff/low-stock` copy —
 * low_stock_dashboard_page.dart (LowStockDashboardPage staffMode: true).
 */

export const STAFF_LS_TITLE = "Low stock";

/** AppBar leading pop; fallback staff home. */
export const STAFF_LS_BACK_FALLBACK = "/staff/home";

/** Autocomplete field hint */
export const STAFF_LS_SEARCH_HINT = "Search item, subcategory, supplier…";

/** Filter sheet IconButton tooltip */
export const STAFF_LS_FILTER_TOOLTIP = "Search & filter";

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

/** AppBar actions tooltips */
export const STAFF_LS_PDF_TOOLTIP = "Download PDF";
export const STAFF_LS_CSV_TOOLTIP = "Copy CSV";

/** Staff row CTA — low_stock_compact_item_row / detail sheet (BUTTONS+) */
export const STAFF_LS_INFORM = "Inform";
export const STAFF_LS_INFORM_OWNER = "Inform owner";
export const STAFF_LS_OWNER_INFORMED = "Owner informed";
export const STAFF_LS_SENT = "Sent";
