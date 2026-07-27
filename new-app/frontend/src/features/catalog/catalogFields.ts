/**
 * Catalog hub search field helpers — catalog_page.dart _searchDebounce 150ms;
 * empty vs no-matches copy when list empty / filtered empty.
 */
import {
  CATALOG_EMPTY_SUB,
  CATALOG_EMPTY_TITLE,
  CATALOG_NO_MATCHES_SUB,
  CATALOG_NO_MATCHES_TITLE,
} from "./catalogCopy";

/** Formula source: catalog_page.dart Timer(Duration(milliseconds: 150)) */
export const CATALOG_SEARCH_DEBOUNCE_MS = 150;

export type CatalogEmptyMode = "empty" | "noMatches";

/** Client empty catalogs — only call when display list length is 0. */
export function catalogEmptyMode(args: {
  listLength: number;
  searchQuery: string;
}): CatalogEmptyMode {
  void args.listLength;
  return args.searchQuery.trim().length > 0 ? "noMatches" : "empty";
}

export function catalogEmptyTitle(mode: CatalogEmptyMode): string {
  return mode === "noMatches" ? CATALOG_NO_MATCHES_TITLE : CATALOG_EMPTY_TITLE;
}

export function catalogEmptySub(mode: CatalogEmptyMode): string {
  return mode === "noMatches" ? CATALOG_NO_MATCHES_SUB : CATALOG_EMPTY_SUB;
}

/**
 * Display list gate — Flutter: q empty → full list; else fuzzy rank.
 * Until WIRE, categories=[] so result always [].
 */
export function catalogDisplayLength(args: {
  listLength: number;
  searchQuery: string;
}): number {
  void args.searchQuery;
  return args.listLength;
}
