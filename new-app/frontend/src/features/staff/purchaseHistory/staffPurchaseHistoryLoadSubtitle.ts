/**
 * FriendlyLoadError message map — staff_purchase_history_page.dart
 * `_loadErrorMessage` + friendlyApiError; subtitle always kFriendlyLoadNetworkSubtitle.
 */
import {
  StaffPhApiError,
  StaffPhNetworkError,
} from "./staffPurchaseHistoryApi";
import {
  STAFF_PH_FRIENDLY_400,
  STAFF_PH_FRIENDLY_401,
  STAFF_PH_FRIENDLY_402,
  STAFF_PH_FRIENDLY_404,
  STAFF_PH_FRIENDLY_408,
  STAFF_PH_FRIENDLY_409,
  STAFF_PH_FRIENDLY_429,
  STAFF_PH_FRIENDLY_503,
  STAFF_PH_FRIENDLY_5XX,
  STAFF_PH_FRIENDLY_GENERIC,
  STAFF_PH_FRIENDLY_NETWORK,
  STAFF_PH_LOAD_FAILED,
  STAFF_PH_LOW_LOAD_FAILED,
  STAFF_PH_RETRY_SUBTITLE,
  STAFF_PH_SESSION_EXPIRED,
} from "./staffPurchaseHistoryCopy";

/** Flutter low-stock error branch: fixed title only. */
export function mapStaffPhLoadTitle(
  error: unknown,
  opts: { isLow: boolean },
): string {
  if (opts.isLow) return STAFF_PH_LOW_LOAD_FAILED;

  if (
    typeof error === "string" &&
    (error === "Not signed in" ||
      error.toLowerCase().includes("sign in") ||
      error.toLowerCase().includes("session"))
  ) {
    return STAFF_PH_SESSION_EXPIRED;
  }

  if (error instanceof StaffPhNetworkError) {
    return STAFF_PH_FRIENDLY_NETWORK;
  }

  if (error instanceof StaffPhApiError) {
    switch (error.status) {
      case 401:
        return STAFF_PH_SESSION_EXPIRED;
      case 403:
        return STAFF_PH_FRIENDLY_401;
      case 402:
        return STAFF_PH_FRIENDLY_402;
      case 404:
        return STAFF_PH_FRIENDLY_404;
      case 408:
        return STAFF_PH_FRIENDLY_408;
      case 429:
        return STAFF_PH_FRIENDLY_429;
      case 409: {
        const d = error.detail?.trim();
        if (d && d.length <= 420) return d;
        return STAFF_PH_FRIENDLY_409;
      }
      case 400:
      case 422: {
        const d = error.detail?.trim();
        if (d && d.length <= 420) return d;
        return STAFF_PH_FRIENDLY_400;
      }
      case 503:
        return STAFF_PH_FRIENDLY_503;
      default:
        if (error.status >= 500) return STAFF_PH_FRIENDLY_5XX;
        break;
    }
    const detail = error.detail?.trim();
    if (detail && detail.length <= 420) return detail;
    return STAFF_PH_FRIENDLY_GENERIC;
  }

  return STAFF_PH_LOAD_FAILED;
}

/** FriendlyLoadError default subtitle — always Tap to retry. */
export function mapStaffPhLoadSubtitle(_error: unknown): string {
  return STAFF_PH_RETRY_SUBTITLE;
}
