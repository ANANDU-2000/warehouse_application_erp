/**
 * Catalog hub `/catalog` copy — catalog_page.dart AppBar / empty / FAB strings.
 */
export const CATALOG_TITLE = "Catalog";

/** context.popOrGo('/home') — owner hub back */
export const CATALOG_BACK_FALLBACK = "/home";

/** Staff blocked from `/catalog` → `_staffRedirectForBlockedRoute` */
export const CATALOG_STAFF_REDIRECT = "/staff/home";

export const CATALOG_TOOLTIP_QUICK_CATEGORIES = "Quick categories";
export const CATALOG_TOOLTIP_STOCK_LIST = "Stock list";
export const CATALOG_TOOLTIP_SCAN = "Scan barcode";
export const CATALOG_TOOLTIP_BACK = "Back";

export const CATALOG_FAB_LABEL = "Add category";

export const CATALOG_MENU_RENAME = "Rename";
export const CATALOG_MENU_DELETE = "Delete";
export const CATALOG_RENAME_TITLE = "Rename category";
export const CATALOG_RENAME_SAVE = "Save";
export const CATALOG_RENAME_CANCEL = "Cancel";
export const CATALOG_DELETE_TITLE = "Delete category?";
export const CATALOG_DELETE_CONFIRM = "Delete";
export const CATALOG_DELETE_CANCEL = "Cancel";
export const CATALOG_SAVED_SNACK = "Saved";
export const CATALOG_DELETED_SNACK = "Category deleted";
/** FriendlyLoadError default message — friendly_load_error.dart */
export const CATALOG_LOAD_FAILED = "Unable to load data";
export const CATALOG_RETRY_SUBTITLE = "Tap to retry.";
export const CATALOG_RETRY = "Retry";

/** ListSkeleton defaults — list_skeleton.dart rowCount 6 · rowHeight 84 */
export const CATALOG_SKELETON_ROWS = 6;
export const CATALOG_SKELETON_HEIGHT_PX = 84;

export const CATALOG_SEARCH_HINT = "Search categories (fuzzy)";

export const CATALOG_EMPTY_TITLE = "No categories yet";
export const CATALOG_EMPTY_SUB =
  "Add a category, then subcategories and items — all from this catalog.";
export const CATALOG_NO_MATCHES_TITLE = "No matches";
export const CATALOG_NO_MATCHES_SUB =
  "Try a different spelling or clear search.";

export const CATALOG_PATH_TAXONOMY = "/catalog/taxonomy";
export const CATALOG_PATH_STOCK = "/stock";
export const CATALOG_PATH_SCAN = "/barcode/scan";
/** FAB → full-screen create until quick sheet WIRE */
export const CATALOG_PATH_NEW_CATEGORY = "/catalog/new-category";

/** Sample category id for BUTTONS card hit until WIRE */
export const CATALOG_SAMPLE_CATEGORY_ID =
  "00000000-0000-4000-8000-000000000001";

export function catalogCategoryPath(categoryId: string): string {
  return `/catalog/category/${encodeURIComponent(categoryId)}`;
}
