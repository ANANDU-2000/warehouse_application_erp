/**
 * Staff gallery filters — staff_item_gallery_page.dart `_StaffGalleryFilter`
 * + `_filterFromQuery` (route `?filter=`).
 */
import {
  STAFF_GALLERY_FILTER_ALL,
  STAFF_GALLERY_FILTER_LOW,
  STAFF_GALLERY_FILTER_MISSING_BARCODE,
  STAFF_GALLERY_FILTER_MISSING_CODE,
  STAFF_GALLERY_FILTER_OPENING,
} from "./staffItemGalleryCopy";

export type StaffGalleryFilter =
  | "all"
  | "missingCode"
  | "missingBarcode"
  | "lowStock"
  | "openingMissing";

/** Enum declaration order in Flutter */
export const STAFF_GALLERY_FILTER_ORDER: readonly StaffGalleryFilter[] = [
  "all",
  "missingCode",
  "missingBarcode",
  "lowStock",
  "openingMissing",
] as const;

export const STAFF_GALLERY_FILTER_LABELS: Record<StaffGalleryFilter, string> = {
  all: STAFF_GALLERY_FILTER_ALL,
  missingCode: STAFF_GALLERY_FILTER_MISSING_CODE,
  missingBarcode: STAFF_GALLERY_FILTER_MISSING_BARCODE,
  lowStock: STAFF_GALLERY_FILTER_LOW,
  openingMissing: STAFF_GALLERY_FILTER_OPENING,
};

export const STAFF_GALLERY_DEFAULT_FILTER: StaffGalleryFilter = "all";

/**
 * Query key aliases — Flutter `_filterFromQuery`.
 * `missing_code` | `code` | `missing_barcode` | `barcode` | `low` | `low_stock` |
 * `opening` | `opening_stock`
 */
export function staffGalleryFilterFromQuery(
  raw: string | null | undefined,
): StaffGalleryFilter {
  const key = raw?.trim().toLowerCase() ?? "";
  switch (key) {
    case "missing_code":
    case "code":
      return "missingCode";
    case "missing_barcode":
    case "barcode":
      return "missingBarcode";
    case "low":
    case "low_stock":
      return "lowStock";
    case "opening":
    case "opening_stock":
      return "openingMissing";
    default:
      return STAFF_GALLERY_DEFAULT_FILTER;
  }
}
