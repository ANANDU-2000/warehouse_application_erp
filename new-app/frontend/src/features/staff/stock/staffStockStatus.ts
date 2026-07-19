/**
 * Staff stock status from `?status=` — stock_page.dart `_mapRouteStatus`.
 * Low chip selects `shortage` (stock_status_quick_chips.dart).
 */

export type StaffStockStatus = "all" | "shortage" | "out";

export const STAFF_STOCK_DEFAULT_STATUS: StaffStockStatus = "all";

export const STAFF_STOCK_STATUS_ORDER: StaffStockStatus[] = [
  "all",
  "shortage",
  "out",
];

/** Legacy: out → out; low|shortage → shortage; all → all; else null (use default). */
export function staffStockStatusFromQuery(
  raw: string | null,
): StaffStockStatus {
  const status = (raw ?? "").trim().toLowerCase();
  if (!status) return STAFF_STOCK_DEFAULT_STATUS;
  switch (status) {
    case "out":
      return "out";
    case "low":
    case "shortage":
      return "shortage";
    case "all":
      return "all";
    default:
      return STAFF_STOCK_DEFAULT_STATUS;
  }
}
