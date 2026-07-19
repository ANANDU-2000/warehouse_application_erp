/**
 * loadStateErrorSubtitle — load_state_error.dart
 * Title: low_stock_dashboard_page FriendlyLoadError 'Could not load low stock'
 */
import { StaffLsApiError, StaffLsNetworkError } from "./staffLowStockApi";
import {
  STAFF_LS_LOAD_FAILED,
  STAFF_LS_RETRY_SUBTITLE,
  STAFF_LS_SUBTITLE_400,
  STAFF_LS_SUBTITLE_401,
  STAFF_LS_SUBTITLE_402,
  STAFF_LS_SUBTITLE_403,
  STAFF_LS_SUBTITLE_404,
  STAFF_LS_SUBTITLE_408,
  STAFF_LS_SUBTITLE_409,
  STAFF_LS_SUBTITLE_429,
  STAFF_LS_SUBTITLE_503,
  STAFF_LS_SUBTITLE_5XX,
  STAFF_LS_SUBTITLE_NO_CONNECTION,
} from "./staffLowStockCopy";

/** Fixed Flutter title — always 'Could not load low stock'. */
export function mapStaffLsLoadTitle(_error: unknown): string {
  return STAFF_LS_LOAD_FAILED;
}

export function mapStaffLsLoadSubtitle(error: unknown): string {
  if (error == null) return STAFF_LS_RETRY_SUBTITLE;

  if (error instanceof StaffLsNetworkError) {
    return STAFF_LS_SUBTITLE_NO_CONNECTION;
  }

  if (error instanceof StaffLsApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return STAFF_LS_SUBTITLE_400;
      case 401:
        return STAFF_LS_SUBTITLE_401;
      case 402:
        return STAFF_LS_SUBTITLE_402;
      case 403:
        return STAFF_LS_SUBTITLE_403;
      case 404:
        return STAFF_LS_SUBTITLE_404;
      case 408:
        return STAFF_LS_SUBTITLE_408;
      case 409:
        return STAFF_LS_SUBTITLE_409;
      case 429:
        return STAFF_LS_SUBTITLE_429;
      case 503:
        return STAFF_LS_SUBTITLE_503;
      default:
        if (error.status >= 500) return STAFF_LS_SUBTITLE_5XX;
        break;
    }
    const detail = error.detail?.trim();
    if (detail && detail.length <= 160) return detail;
    if (detail && detail.length > 160) return `${detail.slice(0, 157)}…`;
  }

  if (typeof error === "string" && error === "Not signed in") {
    return STAFF_LS_SUBTITLE_401;
  }

  return STAFF_LS_RETRY_SUBTITLE;
}
