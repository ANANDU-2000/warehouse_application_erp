/**
 * Staff search section chips — search_page.dart _embeddedCategoryChips
 * staffShellEmbedded meta (default section = items).
 */
import {
  STAFF_SEARCH_CHIP_BILLS,
  STAFF_SEARCH_CHIP_ITEMS,
  STAFF_SEARCH_CHIP_TYPES,
} from "./staffSearchCopy";

export type StaffSearchSection = "items" | "types" | "bills";

export const STAFF_SEARCH_SECTION_ORDER: readonly StaffSearchSection[] = [
  "items",
  "types",
  "bills",
] as const;

export const STAFF_SEARCH_SECTION_LABELS: Record<StaffSearchSection, string> = {
  items: STAFF_SEARCH_CHIP_ITEMS,
  types: STAFF_SEARCH_CHIP_TYPES,
  bills: STAFF_SEARCH_CHIP_BILLS,
};

/** Flutter initState: staffShellEmbedded → _section = 'items' */
export const STAFF_SEARCH_DEFAULT_SECTION: StaffSearchSection = "items";
