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

/** FriendlyLoadError — deferred STATES */
export const STAFF_GALLERY_LOAD_FAILED = "Could not load items";

/** Row popup — deferred BUTTONS/WIRE */
export const STAFF_GALLERY_MENU_STOCK = "Update stock";
export const STAFF_GALLERY_MENU_REORDER = "Reorder / opening";
export const STAFF_GALLERY_MENU_ITEM = "Item profile";
