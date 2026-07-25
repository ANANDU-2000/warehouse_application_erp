/**
 * Catalog new subcategory name field helpers —
 * Formula source: catalog_add_subcategory_page.dart
 * `_touched && _name.text.trim().isEmpty` → `Enter a name`
 */
import { ADD_SUBCATEGORY_NAME_ERROR } from "./catalogAddSubcategoryCopy";

/** Empty-name client validation — only after touched. */
export function addSubcategoryNameError(args: {
  touched: boolean;
  name: string;
}): string | null {
  if (!args.touched) return null;
  if (args.name.trim().length > 0) return null;
  return ADD_SUBCATEGORY_NAME_ERROR;
}

export function addSubcategoryNameIsEmpty(name: string): boolean {
  return name.trim().length === 0;
}
