/**
 * Owner stock status from `?status=` — stock_page.dart `_mapRouteStatus`.
 * Low chip selects `shortage` (stock_status_quick_chips.dart).
 */

export type StockStatus = "all" | "shortage" | "out";

export const STOCK_DEFAULT_STATUS: StockStatus = "all";

export const STOCK_STATUS_ORDER: StockStatus[] = ["all", "shortage", "out"];

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  all: "All",
  shortage: "Low",
  out: "Out",
};

/** Legacy: out → out; low|shortage → shortage; all → all; else null (use default). */
export function stockStatusFromQuery(raw: string | null): StockStatus {
  const status = (raw ?? "").trim().toLowerCase();
  if (!status) return STOCK_DEFAULT_STATUS;
  switch (status) {
    case "out":
      return "out";
    case "low":
    case "shortage":
      return "shortage";
    case "all":
      return "all";
    default:
      return STOCK_DEFAULT_STATUS;
  }
}
