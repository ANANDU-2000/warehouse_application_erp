/**
 * Catalog new category name field helpers —
 * Formula source: catalog_add_category_page.dart
 * `_touched && _name.text.trim().isEmpty` → `Enter a name`
 */
import { ADD_CATEGORY_NAME_ERROR } from "./catalogAddCategoryCopy";

/** Empty-name client validation — only after touched. */
export function addCategoryNameError(args: {
  touched: boolean;
  name: string;
}): string | null {
  if (!args.touched) return null;
  if (args.name.trim().length > 0) return null;
  return ADD_CATEGORY_NAME_ERROR;
}

export function addCategoryNameIsEmpty(name: string): boolean {
  return name.trim().length === 0;
}
