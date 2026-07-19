/**
 * loadStateErrorSubtitle — load_state_error.dart
 * Used under FriendlyLoadError "Unable to load stock" / "Sign in to load stock".
 */
import {
  StaffStockApiError,
  StaffStockNetworkError,
} from "./staffStockApi";
import {
  STAFF_STOCK_RETRY_SUBTITLE,
  STAFF_STOCK_SIGN_IN,
  STAFF_STOCK_SIGN_IN_SUB,
  STAFF_STOCK_SUBTITLE_400,
  STAFF_STOCK_SUBTITLE_402,
  STAFF_STOCK_SUBTITLE_403,
  STAFF_STOCK_SUBTITLE_404,
  STAFF_STOCK_SUBTITLE_408,
  STAFF_STOCK_SUBTITLE_409,
  STAFF_STOCK_SUBTITLE_429,
  STAFF_STOCK_SUBTITLE_503,
  STAFF_STOCK_SUBTITLE_5XX,
  STAFF_STOCK_SUBTITLE_NO_CONNECTION,
  STAFF_STOCK_UNABLE,
} from "./staffStockCopy";

export function mapStaffStockLoadTitle(error: unknown): string {
  if (error instanceof StaffStockApiError && error.status === 401) {
    return STAFF_STOCK_SIGN_IN;
  }
  if (
    typeof error === "string" &&
    (error === "Not signed in" || error.toLowerCase().includes("sign in"))
  ) {
    return STAFF_STOCK_SIGN_IN;
  }
  return STAFF_STOCK_UNABLE;
}

export function mapStaffStockLoadSubtitle(error: unknown): string {
  if (error == null) return STAFF_STOCK_RETRY_SUBTITLE;

  if (error instanceof StaffStockNetworkError) {
    return STAFF_STOCK_SUBTITLE_NO_CONNECTION;
  }

  if (error instanceof StaffStockApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return STAFF_STOCK_SUBTITLE_400;
      case 401:
        return STAFF_STOCK_SIGN_IN_SUB;
      case 402:
        return STAFF_STOCK_SUBTITLE_402;
      case 403:
        return STAFF_STOCK_SUBTITLE_403;
      case 404:
        return STAFF_STOCK_SUBTITLE_404;
      case 408:
        return STAFF_STOCK_SUBTITLE_408;
      case 409:
        return STAFF_STOCK_SUBTITLE_409;
      case 429:
        return STAFF_STOCK_SUBTITLE_429;
      case 503:
        return STAFF_STOCK_SUBTITLE_503;
      default:
        if (error.status >= 500) return STAFF_STOCK_SUBTITLE_5XX;
        break;
    }
    const detail = error.detail?.trim();
    if (detail && detail.length <= 160) return detail;
    if (detail && detail.length > 160) return `${detail.slice(0, 157)}…`;
  }

  if (typeof error === "string" && error === "Not signed in") {
    return STAFF_STOCK_SIGN_IN_SUB;
  }

  return STAFF_STOCK_RETRY_SUBTITLE;
}
