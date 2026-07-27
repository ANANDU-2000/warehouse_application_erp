/**
 * Catalog new category `/catalog/new-category` copy —
 * Formula source: catalog_add_category_page.dart
 */

export const ADD_CATEGORY_TITLE = "New category";

export const ADD_CATEGORY_TOOLTIP_CLOSE = "Close";

export const ADD_CATEGORY_NAME_LABEL = "Name";
export const ADD_CATEGORY_NAME_HINT = "e.g. Rice, Oil";
export const ADD_CATEGORY_NAME_ERROR = "Enter a name";

export const ADD_CATEGORY_CANCEL = "Cancel";
export const ADD_CATEGORY_CREATE = "Create";

export const ADD_CATEGORY_SIMILAR_TITLE = "Similar category exists";
export const ADD_CATEGORY_SIMILAR_GO_BACK = "Go back";
export const ADD_CATEGORY_CREATED_SNACK = "Category created";

/** Flutter similar dialog — sample empty vs named matches */
export function addCategorySimilarBody(
  name: string,
  sampleNames: string[],
): string {
  const sample = sampleNames.filter((s) => s.trim().length > 0).slice(0, 2);
  if (sample.length === 0) {
    return `A close name match exists. Create "${name}" anyway?`;
  }
  return `Close matches include "${sample.join('", "')}". Create "${name}" anyway?`;
}

/** Fuzzy similar gate — catalog_add_category_page.dart minScore 86 · limit 4 */
export const ADD_CATEGORY_SIMILAR_MIN_SCORE = 86;
export const ADD_CATEGORY_SIMILAR_LIMIT = 4;

/** Staff allowed — pop fallback when no history */
export const ADD_CATEGORY_BACK_FALLBACK_OWNER = "/catalog/taxonomy";
export const ADD_CATEGORY_BACK_FALLBACK_STAFF = "/catalog/taxonomy";

export const ADD_CATEGORY_LOAD_FAILED = "Unable to load data";
export const ADD_CATEGORY_RETRY = "Retry";
