/**
 * Staff home refresh — port of RefreshIndicator + StaffHomeAutoRefreshListener.
 * Sources: staff_home_page.dart _invalidateStaffHomeRefresh;
 *          staff_home_auto_refresh_listener.dart
 */

/** Flutter Timer.periodic(Duration(minutes: 2)) */
export const STAFF_HOME_AUTO_REFRESH_MS = 2 * 60 * 1000;

/** Flutter light refresh debounce Duration(seconds: 25) */
export const STAFF_HOME_LIGHT_REFRESH_DEBOUNCE_MS = 25_000;

/** Pull distance (px) before triggering refresh (web RefreshIndicator stand-in). */
export const STAFF_HOME_PULL_THRESHOLD_PX = 64;

export function canStaffHomeLightRefresh(
  lastAt: number | null,
  nowMs: number,
  debounceMs = STAFF_HOME_LIGHT_REFRESH_DEBOUNCE_MS,
): boolean {
  if (lastAt == null) return true;
  return nowMs - lastAt >= debounceMs;
}
