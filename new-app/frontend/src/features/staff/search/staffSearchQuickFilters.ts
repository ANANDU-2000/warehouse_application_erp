/**
 * Staff search empty-query quick filters — search_page.dart staffShellEmbedded.
 * Paths deferred to BUTTONS; LAYOUT = chrome labels only.
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

export const STAFF_SEARCH_QUICK_FILTERS: readonly {
  id: StaffSearchQuickFilterId;
  label: string;
  /** Flutter context.push / go target — BUTTONS */
  path: string;
}[] = [
  { id: "item_gallery", label: STAFF_SEARCH_QF_ITEM_GALLERY, path: "/staff/items" },
  {
    id: "missing_barcode",
    label: STAFF_SEARCH_QF_MISSING_BARCODE,
    path: "/staff/items?filter=missing_barcode",
  },
  {
    id: "missing_code",
    label: STAFF_SEARCH_QF_MISSING_CODE,
    path: "/staff/items?filter=missing_code",
  },
  {
    id: "opening_stock",
    label: STAFF_SEARCH_QF_OPENING_STOCK,
    path: "/stock/opening-setup",
  },
  { id: "low_stock", label: STAFF_SEARCH_QF_LOW_STOCK, path: "/staff/low-stock" },
  { id: "scan", label: STAFF_SEARCH_QF_SCAN, path: "/staff/scan" },
] as const;
