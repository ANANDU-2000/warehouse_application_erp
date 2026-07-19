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
export const STAFF_SEARCH_RETRY = "Retry";
/** friendly_load_error.dart kFriendlyLoadNetworkSubtitle */
export const STAFF_SEARCH_RETRY_SUBTITLE = "Tap to retry.";
/** _SearchLoadingFallback after 2s */
export const STAFF_SEARCH_LOADING_SLOW =
  "Search is taking longer than expected. You can keep navigating or try a recent item.";

/** load_state_error.dart status subtitles (shared map with notifications) */
export const STAFF_SEARCH_SUBTITLE_400 =
  "Invalid request. Please check your input.";
export const STAFF_SEARCH_SUBTITLE_401 =
  "Session expired. Please log in again.";
export const STAFF_SEARCH_SUBTITLE_402 =
  "Monthly AI usage limit reached. Contact your owner or try again next month.";
export const STAFF_SEARCH_SUBTITLE_403 =
  "You don't have permission for this.";
export const STAFF_SEARCH_SUBTITLE_404 = "Not found.";
export const STAFF_SEARCH_SUBTITLE_408 =
  "Request timed out. Please try again.";
export const STAFF_SEARCH_SUBTITLE_409 =
  "That conflicts with existing data. Try again.";
export const STAFF_SEARCH_SUBTITLE_429 =
  "Too many requests. Wait a moment and try again.";
export const STAFF_SEARCH_SUBTITLE_503 =
  "Server is starting up — wait about 30 seconds, then tap Retry.";
export const STAFF_SEARCH_SUBTITLE_5XX =
  "Server error. Please try again shortly.";
export const STAFF_SEARCH_SUBTITLE_NO_CONNECTION =
  "No connection. Check your network and try again.";

/** Flutter _unifiedSearchTtl */
export const STAFF_SEARCH_CACHE_TTL_MS = 12_000;
export const STAFF_SEARCH_CACHE_MAX = 40;
export const STAFF_SEARCH_LOADING_FALLBACK_MS = 2_000;
