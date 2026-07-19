/**
 * Staff search `/staff/search` — labels.
 * Source: search_page.dart staffShellEmbedded chrome + empty/result copy
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

/** Debounce ms — search_page.dart _scheduleSearch */
export const STAFF_SEARCH_DEBOUNCE_MS = 350;

/** Nonempty query + empty API data — search_page.dart hasAny == false */
export const STAFF_SEARCH_NO_MATCH_GLOBAL =
  "No matching items found. Try recent items, low stock, missing barcode, or scan history.";

export const STAFF_SEARCH_SECTION_TITLE_ITEMS = "Catalog items";
export const STAFF_SEARCH_SECTION_EMPTY_ITEMS = "No matching catalog items.";

export const STAFF_SEARCH_SECTION_TITLE_TYPES = "Catalog types";
export const STAFF_SEARCH_SECTION_EMPTY_TYPES =
  "No matching category / subcategory (type) names.";

export const STAFF_SEARCH_SECTION_TITLE_BILLS = "Recent purchase bills";
export const STAFF_SEARCH_SECTION_EMPTY_BILLS =
  "No bills matched (try item name, supplier, or bill id).";

/** Fuzzy banner — staff hideFinancials path */
export const STAFF_SEARCH_FUZZY_CATALOG_STAFF =
  "No exact item title match — showing close catalog matches. Open the item to confirm qty and supplier.";

export const STAFF_SEARCH_FUZZY_ITEM_HINT =
  "Approximate name match — open item to verify details.";

export const STAFF_SEARCH_FAILED = "Search failed";
export const STAFF_SEARCH_UPDATING = "Updating results…";
