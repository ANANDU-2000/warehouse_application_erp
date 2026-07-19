/**
 * Catalog taxonomy hub search helpers —
 * Formula source: catalog_taxonomy_hub_page.dart
 * Listener: trim + toLowerCase; filter name.contains (not fuzzy, no debounce).
 */
import {
  TAXONOMY_EMPTY_SUB,
  TAXONOMY_EMPTY_TITLE,
  TAXONOMY_NO_MATCHES_TITLE,
} from "./catalogTaxonomyCopy";

export type TaxonomyEmptyMode = "empty" | "noMatches";

export type TaxonomyCategoryNameRow = {
  id: string;
  name: string;
};

/**
 * Case-insensitive contains on category name.
 * Flutter: `_query` already trim+lower; `(c['name']…).toLowerCase().contains(_query)`.
 */
export function taxonomyFilterCategories<T extends TaxonomyCategoryNameRow>(
  cats: T[],
  searchQuery: string,
): T[] {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return cats;
  return cats.filter((c) => (c.name ?? "").toLowerCase().includes(q));
}

/** Client empty catalogs — only when filtered list length is 0. */
export function taxonomyEmptyMode(args: {
  listLength: number;
  searchQuery: string;
}): TaxonomyEmptyMode {
  void args.listLength;
  return args.searchQuery.trim().length > 0 ? "noMatches" : "empty";
}

export function taxonomyEmptyTitle(mode: TaxonomyEmptyMode): string {
  return mode === "noMatches" ? TAXONOMY_NO_MATCHES_TITLE : TAXONOMY_EMPTY_TITLE;
}

/** Flutter uses the same subtitle for both empty and no-matches. */
export function taxonomyEmptySub(_mode: TaxonomyEmptyMode): string {
  void _mode;
  return TAXONOMY_EMPTY_SUB;
}
