/**
 * Staff activity `/staff/activity` copy —
 * staff_activity_page.dart (StaffActivityPage).
 */

export const STAFF_ACT_TITLE = "My activity";

/** AppBar leading pop; fallback staff home. */
export const STAFF_ACT_BACK_FALLBACK = "/staff/home";

/** SegmentedButton periods — _staffActivityPeriodProvider */
export const STAFF_ACT_PERIOD_TODAY = "Today";
export const STAFF_ACT_PERIOD_WEEK = "Week";
export const STAFF_ACT_PERIOD_MONTH = "Month";

export type StaffActPeriod = "today" | "week" | "month";

export const STAFF_ACT_PERIOD_ORDER: StaffActPeriod[] = [
  "today",
  "week",
  "month",
];

export const STAFF_ACT_PERIOD_LABEL: Record<StaffActPeriod, string> = {
  today: STAFF_ACT_PERIOD_TODAY,
  week: STAFF_ACT_PERIOD_WEEK,
  month: STAFF_ACT_PERIOD_MONTH,
};

/** Default period — StateProvider initial 'today' */
export const STAFF_ACT_DEFAULT_PERIOD: StaffActPeriod = "today";

/** Empty — staff_activity_page.dart data empty Center */
export const STAFF_ACT_EMPTY = "No activity in this period";
export const STAFF_ACT_EMPTY_SUB =
  "Scans, stock updates, and purchases appear here.";

/** Error title — HexaErrorCard (STATES) */
export const STAFF_ACT_LOAD_FAILED = "Could not load activity";
