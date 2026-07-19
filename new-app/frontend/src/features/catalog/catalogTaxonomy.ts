/**
 * Catalog taxonomy helpers — Formula source: catalog_taxonomy_utils.dart
 */
import type {
  CatalogCategory,
  CatalogItemRow,
  CategoryTypeIndexRow,
} from "./catalogApi";
import { catalogFuzzyRank } from "./catalogFuzzy";

/** Count subcategories for categoryId from the flat index. */
export function typeCountForCategory(
  index: CategoryTypeIndexRow[],
  categoryId: string,
): number {
  let n = 0;
  for (const t of index) {
    if (t.category_id === categoryId) n++;
  }
  return n;
}

export function itemCountForCategory(
  items: CatalogItemRow[],
  categoryId: string,
): number {
  let n = 0;
  for (const it of items) {
    if (it.category_id === categoryId) n++;
  }
  return n;
}

/** Flutter: `$subCount subcategories · $itemCount items` */
export function catalogCategoryMeta(args: {
  subCount: number;
  itemCount: number;
}): string {
  return `${args.subCount} subcategories · ${args.itemCount} items`;
}

/**
 * Display list — catalog_page.dart: empty q → full list; else fuzzy.
 * minScore: q.length <= 1 ? 10 : 38; limit 500 for grid / 6 for chips.
 */
export function catalogDisplayCategories(
  list: CatalogCategory[],
  searchQuery: string,
  opts?: { limit?: number },
): CatalogCategory[] {
  const q = searchQuery.trim();
  if (q.length === 0) return list;
  const minScore = q.length <= 1 ? 10 : 38;
  return catalogFuzzyRank(q, list, (c) => c.name, {
    minScore,
    limit: opts?.limit ?? 500,
  });
}

export function catalogSuggestionCategories(
  list: CatalogCategory[],
  searchQuery: string,
): CatalogCategory[] {
  const q = searchQuery.trim();
  if (q.length === 0) return [];
  return catalogDisplayCategories(list, q, { limit: 6 });
}
