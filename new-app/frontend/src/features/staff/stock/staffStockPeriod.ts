/**
 * Staff stock period — stock_page `_StockPeriodSheet` + top-bar badge labels.
 * Source: HomePeriod; applyStockPagePeriod (WIRE applies dates).
 */
import type { HomePeriod } from "../../home/homePeriod";

/** Sheet options (no Custom) — Flutter `_StockPeriodSheet` options list. */
export type StaffStockPeriodSheetKey =
  | "today"
  | "week"
  | "month"
  | "year"
  | "allTime";

export const STAFF_STOCK_PERIOD_SHEET_ORDER: StaffStockPeriodSheetKey[] = [
  "today",
  "week",
  "month",
  "year",
  "allTime",
];

export const STAFF_STOCK_PERIOD_SHEET_LABELS: Record<
  StaffStockPeriodSheetKey,
  string
> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
  allTime: "All Time",
};

export const STAFF_STOCK_PERIOD_SHEET_SUB: Record<
  StaffStockPeriodSheetKey,
  string
> = {
  today: "Bought today",
  week: "Last 7 days",
  month: "Last 30 days",
  year: "From Jan 1",
  allTime: "Full history",
};

/** Badge short labels — StockOperationalTopBar `_periodLabel`. */
export const STAFF_STOCK_PERIOD_BADGE: Record<HomePeriod, string> = {
  today: "Today",
  week: "Week",
  month: "Month",
  year: "Year",
  allTime: "All",
  custom: "Custom",
};

export const STAFF_STOCK_DEFAULT_PERIOD: HomePeriod = "allTime";
