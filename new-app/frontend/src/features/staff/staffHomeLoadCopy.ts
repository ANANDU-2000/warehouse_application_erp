/**
 * Exact staff-home STATES copy from Flutter source.
 * Smoke asserts these literals — do not paraphrase.
 *
 * Sources:
 * - staff_home_dashboard_widgets.dart — Could not load floor counts; activity empty/error
 * - section_inline_error.dart — Retry
 * - friendly_load_error.dart — Tap to retry.
 * - staff_purchase_history_page.dart — Session expired — sign in again
 */

export const STAFF_HOME_FLOOR_LOAD_ERROR = "Could not load floor counts";

export const STAFF_HOME_RETRY_LABEL = "Retry";

export const STAFF_HOME_RETRY_SUBTITLE = "Tap to retry.";

/** staff_purchase_history_page.dart session message (staff surfaces). */
export const STAFF_HOME_SESSION_EXPIRED = "Session expired — sign in again";

export const STAFF_HOME_NO_CONNECTION = "No connection";

/** StaffHomeRecentActivitySection empty. */
export const STAFF_HOME_ACTIVITY_EMPTY =
  "No activity yet today — tap Scan above.";

/** StaffHomeRecentActivitySection error. */
export const STAFF_HOME_ACTIVITY_ERROR = "Could not load recent activity.";

/** StaffHomeShiftSnapshotStrip empty title. */
export const STAFF_HOME_SHIFT_EMPTY = "No activity today";
