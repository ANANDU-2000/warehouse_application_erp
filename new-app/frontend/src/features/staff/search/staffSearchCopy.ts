/**
 * Staff search `/staff/search` — SCAFFOLD/LAYOUT labels.
 * Source: search_page.dart staffShellEmbedded chrome + empty-query body
 */
export const STAFF_SEARCH_TITLE = "Search";
/** Flutter popOrGo(authenticatedHomePath) for staff → /staff/home */
export const STAFF_SEARCH_BACK_FALLBACK = "/staff/home";
/** staffShellEmbedded hint */
export const STAFF_SEARCH_HINT = "Item name, code, barcode, category…";
/** Owner/shell hint — deferred (this route is staff-embedded) */
export const STAFF_SEARCH_HINT_OWNER = "Search purchases, suppliers, items…";

export const STAFF_SEARCH_CHIP_ITEMS = "Items";
export const STAFF_SEARCH_CHIP_TYPES = "Subcategories";
export const STAFF_SEARCH_CHIP_BILLS = "Purchases";

/** Empty-query section — search_page.dart q.isEmpty */
export const STAFF_SEARCH_QUICK_FILTERS_TITLE = "Quick filters";
export const STAFF_SEARCH_RECENT_TITLE = "Recent";
export const STAFF_SEARCH_RECENT_CLEAR = "Clear";

/** Staff ActionChip labels (staffShellEmbedded empty body) */
export const STAFF_SEARCH_QF_ITEM_GALLERY = "Item gallery";
export const STAFF_SEARCH_QF_MISSING_BARCODE = "Missing barcode";
export const STAFF_SEARCH_QF_MISSING_CODE = "Missing item code";
export const STAFF_SEARCH_QF_OPENING_STOCK = "Opening stock";
export const STAFF_SEARCH_QF_LOW_STOCK = "Low stock";
export const STAFF_SEARCH_QF_SCAN = "Scan barcode";

export const STAFF_SEARCH_EMPTY_HELPER =
  "Search items by name, item code, category, or subcategory. Use quick filters for missing labels and opening stock.";
