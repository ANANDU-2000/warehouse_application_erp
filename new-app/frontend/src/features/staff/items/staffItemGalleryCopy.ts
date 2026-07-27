/**
 * Staff item gallery `/staff/items` — labels.
 * Source: staff_item_gallery_page.dart
 */
export const STAFF_GALLERY_TITLE = "Item gallery";
/** Flutter AppBar back → pop; staff nest fallback */
export const STAFF_GALLERY_BACK_FALLBACK = "/staff/home";

/** Autocomplete / TextField hint */
export const STAFF_GALLERY_HINT = "Name, item code, category, subcategory…";

/** Filter chip labels — `_staffGalleryFilterLabel` */
export const STAFF_GALLERY_FILTER_ALL = "All";
export const STAFF_GALLERY_FILTER_MISSING_CODE = "No item code";
export const STAFF_GALLERY_FILTER_MISSING_BARCODE = "No barcode";
export const STAFF_GALLERY_FILTER_LOW = "Low / out";
export const STAFF_GALLERY_FILTER_OPENING = "Opening";

/** Empty filtered list */
export const STAFF_GALLERY_EMPTY = "No items match";

/** Summary line template — Flutter `'${filtered.length} items · ${cats.length} categories'` */
export const STAFF_GALLERY_SUMMARY_EMPTY = "0 items · 0 categories";

/** Debounce ms — staff_item_gallery_page.dart Timer onChanged */
export const STAFF_GALLERY_DEBOUNCE_MS = 200;

/** Autocomplete optionsBuilder `.take(12)` */
export const STAFF_GALLERY_SUGGESTIONS_MAX = 12;

/** FriendlyLoadError message — staff_item_gallery_page.dart */
export const STAFF_GALLERY_LOAD_FAILED = "Could not load items";
/** friendly_load_error.dart kFriendlyLoadNetworkSubtitle */
export const STAFF_GALLERY_RETRY_SUBTITLE = "Tap to retry.";
export const STAFF_GALLERY_RETRY = "Retry";

/** load_state_error.dart status subtitles (shared map with search/notifications) */
export const STAFF_GALLERY_SUBTITLE_400 =
  "Invalid request. Please check your input.";
export const STAFF_GALLERY_SUBTITLE_401 =
  "Session expired. Please log in again.";
export const STAFF_GALLERY_SUBTITLE_402 =
  "Monthly AI usage limit reached. Contact your owner or try again next month.";
export const STAFF_GALLERY_SUBTITLE_403 =
  "You don't have permission for this.";
export const STAFF_GALLERY_SUBTITLE_404 = "Not found.";
export const STAFF_GALLERY_SUBTITLE_408 =
  "Request timed out. Please try again.";
export const STAFF_GALLERY_SUBTITLE_409 =
  "That conflicts with existing data. Try again.";
export const STAFF_GALLERY_SUBTITLE_429 =
  "Too many requests. Wait a moment and try again.";
export const STAFF_GALLERY_SUBTITLE_503 =
  "Server is starting up — wait about 30 seconds, then tap Retry.";
export const STAFF_GALLERY_SUBTITLE_5XX =
  "Server error. Please try again shortly.";
export const STAFF_GALLERY_SUBTITLE_NO_CONNECTION =
  "No connection. Check your network and try again.";

/** Flutter staffGalleryStockProvider keepAlive 3 minutes */
export const STAFF_GALLERY_CACHE_TTL_MS = 180_000;

/** Row popup — staff_item_gallery_page.dart PopupMenuButton */
export const STAFF_GALLERY_MENU_STOCK = "Update stock";
export const STAFF_GALLERY_MENU_REORDER = "Reorder / opening";
export const STAFF_GALLERY_MENU_ITEM = "Item profile";

/** Stock line suffixes — `_StaffGalleryItemRow` */
export const STAFF_GALLERY_NO_CODE = "No code";
export const STAFF_GALLERY_NO_BARCODE = "No barcode";
export const STAFF_GALLERY_DEFAULT_ITEM_NAME = "Item";
export const STAFF_GALLERY_DEFAULT_UNIT = "bag";

/** Subcategory tab — Flutter ChoiceChip `All` when expanded */
export const STAFF_GALLERY_SUB_TAB_ALL = "All";
