/**
 * Catalog taxonomy hub `/catalog/taxonomy` copy —
 * Formula source: catalog_taxonomy_hub_page.dart
 */

export const TAXONOMY_TITLE = "Categories";

/** context.popOrGo(isStaff ? '/staff/home' : '/home') */
export const TAXONOMY_BACK_FALLBACK_OWNER = "/home";
export const TAXONOMY_BACK_FALLBACK_STAFF = "/staff/home";

export const TAXONOMY_TOOLTIP_BACK = "Back";
/** Owner-only AppBar action */
export const TAXONOMY_TOOLTIP_FULL_CATALOG = "Full catalog";

export const TAXONOMY_EXPLAINER =
  "Categories group your items. Subcategories are the type under each category (e.g. Rice → Biriyani rice).";

export const TAXONOMY_CHIP_CATEGORY = "Category";
export const TAXONOMY_CHIP_SUBCATEGORY = "Subcategory";

export const TAXONOMY_SEARCH_HINT = "Search categories";

export const TAXONOMY_EMPTY_TITLE = "No categories yet";
export const TAXONOMY_NO_MATCHES_TITLE = "No matches";
export const TAXONOMY_EMPTY_SUB = "Tap Category to add your first one.";
export const TAXONOMY_EMPTY_PRIMARY = "Add category";

/** Row subtitle when subN == 0 */
export const TAXONOMY_ROW_NO_SUBS =
  "No subcategories · General created automatically";

export const TAXONOMY_FAB_TOOLTIP = "Quick add category";
export const TAXONOMY_ROW_ADD_SUB_TOOLTIP = "Add subcategory";

export const TAXONOMY_PATH_CATALOG = "/catalog";
export const TAXONOMY_PATH_NEW_CATEGORY = "/catalog/new-category";

/** BUTTONS sample until WIRE — mirrors catalog hub sample id pattern */
export const TAXONOMY_SAMPLE_CATEGORY_ID =
  "00000000-0000-4000-8000-000000000001";
export const TAXONOMY_SAMPLE_CATEGORY_NAME = "Rice";

export function taxonomyCategoryPath(categoryId: string): string {
  return `/catalog/category/${encodeURIComponent(categoryId)}`;
}

/** Full-screen create stub until quick subcategory sheet is ported */
export function taxonomyNewSubcategoryPath(categoryId: string): string {
  return `/catalog/category/${encodeURIComponent(categoryId)}/new-subcategory`;
}
