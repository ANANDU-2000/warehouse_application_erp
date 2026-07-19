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

/** Error title — HexaErrorCard.fromError (staff_activity_page.dart) */
export const STAFF_ACT_LOAD_FAILED = "Could not load activity";

/** kFriendlyLoadNetworkSubtitle — friendly_load_error.dart */
export const STAFF_ACT_RETRY_SUBTITLE = "Tap to retry.";
export const STAFF_ACT_RETRY = "Retry";

/** loadStateErrorSubtitle — load_state_error.dart */
export const STAFF_ACT_SUBTITLE_400 =
  "Invalid request. Please check your input.";
export const STAFF_ACT_SUBTITLE_401 =
  "Session expired. Please log in again.";
export const STAFF_ACT_SUBTITLE_402 =
  "Monthly AI usage limit reached. Contact your owner or try again next month.";
export const STAFF_ACT_SUBTITLE_403 = "You don't have permission for this.";
export const STAFF_ACT_SUBTITLE_404 = "Not found.";
export const STAFF_ACT_SUBTITLE_408 =
  "Request timed out. Please try again.";
export const STAFF_ACT_SUBTITLE_409 =
  "That conflicts with existing data. Try again.";
export const STAFF_ACT_SUBTITLE_429 =
  "Too many requests. Wait a moment and try again.";
export const STAFF_ACT_SUBTITLE_503 =
  "Server is starting up — wait about 30 seconds, then tap Retry.";
export const STAFF_ACT_SUBTITLE_5XX =
  "Server error. Please try again shortly.";
export const STAFF_ACT_SUBTITLE_NO_CONNECTION =
  "No connection. Check your network and try again.";

/** ListSkeleton(rowCount: 10) — list_skeleton.dart defaults rowHeight 84 */
export const STAFF_ACT_SKELETON_ROWS = 10;
export const STAFF_ACT_SKELETON_HEIGHT_PX = 84;
