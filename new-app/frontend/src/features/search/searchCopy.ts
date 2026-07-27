/**
 * Owner search `/search` — copy.
 * Source: search_page.dart embeddedInShell chrome + empty/result copy.
 * Owner-specific: no AppBar (embedded in OwnerShell), 7 sections, owner quick filters.
 */

export const SEARCH_TITLE = "Search";

/** Flutter popOrGo(authenticatedHomePath) for owner → /home */
export const SEARCH_BACK_FALLBACK = "/home";

/** Owner hint — search_page.dart `_embeddedSearchTextField` non-staff path */
export const SEARCH_HINT = "Search purchases, suppliers, items…";

/** Owner standalone hint (unused — route is embedded) */
export const SEARCH_HINT_STANDALONE =
  "Item, type, bill, supplier, broker, HSN…";

export const SEARCH_CHIP_ALL = "All";
export const SEARCH_CHIP_BILLS = "Purchases";
export const SEARCH_CHIP_ITEMS = "Items";
export const SEARCH_CHIP_SUPPLIERS = "Suppliers";
export const SEARCH_CHIP_BROKERS = "Brokers";
export const SEARCH_CHIP_TYPES = "Types";
export const SEARCH_CHIP_CONTACTS = "Contacts";

/** Empty-query section — search_page.dart q.isEmpty */
export const SEARCH_QUICK_FILTERS_TITLE = "Quick filters";
export const SEARCH_RECENT_TITLE = "Recent";
export const SEARCH_RECENT_CLEAR = "Clear";

/** Owner ActionChip labels (non-staff path) */
export const SEARCH_QF_MISSING_BARCODE = "Missing barcode";
export const SEARCH_QF_RECENTLY_UPDATED = "Recently updated";
export const SEARCH_QF_RECENT_SCANS = "Recent scans";
export const SEARCH_QF_LOW_STOCK = "Low stock";

export const SEARCH_EMPTY_HELPER =
  "Search catalog items (name, HSN, code, category, catalog type), recent purchase bills, suppliers, and brokers.";

/** Debounce ms — search_page.dart `_scheduleSearch` */
export const SEARCH_DEBOUNCE_MS = 350;

/** Nonempty query + empty API data — search_page.dart hasAny == false */
export const SEARCH_NO_MATCH_GLOBAL =
  "No matching items found. Try recent items, low stock, missing barcode, or scan history.";

export const SEARCH_SECTION_TITLE_TYPES = "Catalog types";
export const SEARCH_SECTION_EMPTY_TYPES =
  "No matching category / subcategory (type) names.";

export const SEARCH_SECTION_TITLE_ITEMS = "Catalog items";
export const SEARCH_SECTION_EMPTY_ITEMS = "No matching catalog items.";

export const SEARCH_SECTION_TITLE_BILLS = "Recent purchase bills";
export const SEARCH_SECTION_EMPTY_BILLS =
  "No bills matched (try item name, supplier, or bill id).";

export const SEARCH_SECTION_TITLE_SUPPLIERS = "Suppliers";
export const SEARCH_SECTION_EMPTY_SUPPLIERS = "No matching suppliers.";

export const SEARCH_SECTION_TITLE_BROKERS = "Brokers";
export const SEARCH_SECTION_EMPTY_BROKERS = "No matching brokers.";

export const SEARCH_SECTION_TITLE_CONTACTS = "Contacts";
export const SEARCH_SECTION_CONTACTS_SUB =
  "Suppliers and brokers (same hub as Contacts → search).";

/** Fuzzy banners — search_page.dart fuzzyItems / fuzzySup / fuzzyBro */
export const SEARCH_FUZZY_CATALOG_OWNER =
  "No exact item title match — showing close catalog matches. Do not trust rates until you open the item.";
export const SEARCH_FUZZY_SUPPLIERS =
  "No exact supplier name match — showing close supplier matches.";
export const SEARCH_FUZZY_BROKERS =
  "No exact broker name match — showing close broker matches.";

export const SEARCH_FUZZY_ITEM_HINT =
  "Approximate name match — open item to verify details.";

export const SEARCH_FAILED = "Search failed";
export const SEARCH_UPDATING = "Updating results…";
export const SEARCH_RETRY = "Retry";
/** friendly_load_error.dart kFriendlyLoadNetworkSubtitle */
export const SEARCH_RETRY_SUBTITLE = "Tap to retry.";
/** _SearchLoadingFallback after 2s */
export const SEARCH_LOADING_SLOW =
  "Search is taking longer than expected. You can keep navigating or try a recent item.";

/** load_state_error.dart status subtitles */
export const SEARCH_SUBTITLE_400 =
  "Invalid request. Please check your input.";
export const SEARCH_SUBTITLE_401 =
  "Session expired. Please log in again.";
export const SEARCH_SUBTITLE_402 =
  "Monthly AI usage limit reached. Contact your owner or try again next month.";
export const SEARCH_SUBTITLE_403 =
  "You don't have permission for this.";
export const SEARCH_SUBTITLE_404 = "Not found.";
export const SEARCH_SUBTITLE_408 =
  "Request timed out. Please try again.";
export const SEARCH_SUBTITLE_409 =
  "That conflicts with existing data. Try again.";
export const SEARCH_SUBTITLE_429 =
  "Too many requests. Wait a moment and try again.";
export const SEARCH_SUBTITLE_503 =
  "Server is starting up — wait about 30 seconds, then tap Retry.";
export const SEARCH_SUBTITLE_5XX =
  "Server error. Please try again shortly.";
export const SEARCH_SUBTITLE_NO_CONNECTION =
  "No connection. Check your network and try again.";

/** Flutter _unifiedSearchTtl */
export const SEARCH_CACHE_TTL_MS = 12_000;
export const SEARCH_CACHE_MAX = 40;
export const SEARCH_LOADING_FALLBACK_MS = 2_000;
