/**
 * Catalog hub `/catalog` copy — catalog_page.dart AppBar / empty / FAB strings.
 * SCAFFOLD: constants only; fields/buttons/API deferred.
 */
export const CATALOG_TITLE = "Catalog";

/** context.popOrGo('/home') — owner hub back */
export const CATALOG_BACK_FALLBACK = "/home";

/** Staff blocked from `/catalog` → `_staffRedirectForBlockedRoute` */
export const CATALOG_STAFF_REDIRECT = "/staff/home";

export const CATALOG_TOOLTIP_QUICK_CATEGORIES = "Quick categories";
export const CATALOG_TOOLTIP_STOCK_LIST = "Stock list";
export const CATALOG_TOOLTIP_SCAN = "Scan barcode";

export const CATALOG_FAB_LABEL = "Add category";

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
