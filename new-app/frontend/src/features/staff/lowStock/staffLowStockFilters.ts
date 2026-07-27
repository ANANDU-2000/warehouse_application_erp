/**
 * Staff low stock search scopes — LowStockSearchScope
 * low_stock_category_tree.dart / filter sheet labels.
 */

export type StaffLsSearchScope =
  | "all"
  | "category"
  | "subcategory"
  | "item"
  | "supplier";

export const STAFF_LS_SCOPE_ORDER: StaffLsSearchScope[] = [
  "all",
  "category",
  "subcategory",
  "item",
  "supplier",
];

export const STAFF_LS_DEFAULT_SCOPE: StaffLsSearchScope = "all";
