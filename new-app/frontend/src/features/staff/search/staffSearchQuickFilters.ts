/**
 * Staff search empty-query quick filters — search_page.dart staffShellEmbedded.
 * nav: Flutter context.push vs context.go (scan).
 */
import {
  STAFF_SEARCH_QF_ITEM_GALLERY,
  STAFF_SEARCH_QF_LOW_STOCK,
  STAFF_SEARCH_QF_MISSING_BARCODE,
  STAFF_SEARCH_QF_MISSING_CODE,
  STAFF_SEARCH_QF_OPENING_STOCK,
  STAFF_SEARCH_QF_SCAN,
} from "./staffSearchCopy";

export type StaffSearchQuickFilterId =
  | "item_gallery"
  | "missing_barcode"
  | "missing_code"
  | "opening_stock"
  | "low_stock"
  | "scan";

/** Flutter GoRouter push vs go */
export type StaffSearchNavMode = "push" | "go";

export const STAFF_SEARCH_QUICK_FILTERS: readonly {
  id: StaffSearchQuickFilterId;
  label: string;
  path: string;
  nav: StaffSearchNavMode;
}[] = [
  {
    id: "item_gallery",
    label: STAFF_SEARCH_QF_ITEM_GALLERY,
    path: "/staff/items",
    nav: "push",
  },
  {
    id: "missing_barcode",
    label: STAFF_SEARCH_QF_MISSING_BARCODE,
    path: "/staff/items?filter=missing_barcode",
    nav: "push",
  },
  {
    id: "missing_code",
    label: STAFF_SEARCH_QF_MISSING_CODE,
    path: "/staff/items?filter=missing_code",
    nav: "push",
  },
  {
    id: "opening_stock",
    label: STAFF_SEARCH_QF_OPENING_STOCK,
    path: "/stock/opening-setup",
    nav: "push",
  },
  {
    id: "low_stock",
    label: STAFF_SEARCH_QF_LOW_STOCK,
    path: "/staff/low-stock",
    nav: "push",
  },
  {
    id: "scan",
    label: STAFF_SEARCH_QF_SCAN,
    path: "/staff/scan",
    nav: "go",
  },
] as const;
