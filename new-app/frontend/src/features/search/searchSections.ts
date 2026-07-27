/**
 * Owner search section chips — search_page.dart `_embeddedCategoryChips`.
 * Owner has 7 sections: all, bills, items, suppliers, brokers, types, contacts.
 */
import {
  SEARCH_CHIP_ALL,
  SEARCH_CHIP_BILLS,
  SEARCH_CHIP_BROKERS,
  SEARCH_CHIP_CONTACTS,
  SEARCH_CHIP_ITEMS,
  SEARCH_CHIP_SUPPLIERS,
  SEARCH_CHIP_TYPES,
} from "./searchCopy";

export type SearchSection =
  | "all"
  | "bills"
  | "items"
  | "suppliers"
  | "brokers"
  | "types"
  | "contacts";

export const SEARCH_SECTION_ORDER: readonly SearchSection[] = [
  "all",
  "bills",
  "items",
  "suppliers",
  "brokers",
  "types",
  "contacts",
] as const;

export const SEARCH_SECTION_LABELS: Record<SearchSection, string> = {
  all: SEARCH_CHIP_ALL,
  bills: SEARCH_CHIP_BILLS,
  items: SEARCH_CHIP_ITEMS,
  suppliers: SEARCH_CHIP_SUPPLIERS,
  brokers: SEARCH_CHIP_BROKERS,
  types: SEARCH_CHIP_TYPES,
  contacts: SEARCH_CHIP_CONTACTS,
};

/** Flutter initState: embeddedInShell → _section = 'all' */
export const SEARCH_DEFAULT_SECTION: SearchSection = "all";

/** Legacy: _section values in Flutter `_sections` set. */
export function searchSectionFromQuery(raw: string | null): SearchSection {
  const s = (raw ?? "").trim().toLowerCase();
  switch (s) {
    case "bills":
    case "items":
    case "suppliers":
    case "brokers":
    case "types":
    case "contacts":
      return s;
    default:
      return SEARCH_DEFAULT_SECTION;
  }
}
