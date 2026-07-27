/**
 * loadStateErrorSubtitle — load_state_error.dart
 * Used under FriendlyLoadError message "Search failed".
 */
import {
  StaffSearchApiError,
  StaffSearchNetworkError,
} from "./staffSearchApi";
import {
  STAFF_SEARCH_RETRY_SUBTITLE,
  STAFF_SEARCH_SUBTITLE_400,
  STAFF_SEARCH_SUBTITLE_401,
  STAFF_SEARCH_SUBTITLE_402,
  STAFF_SEARCH_SUBTITLE_403,
  STAFF_SEARCH_SUBTITLE_404,
  STAFF_SEARCH_SUBTITLE_408,
  STAFF_SEARCH_SUBTITLE_409,
  STAFF_SEARCH_SUBTITLE_429,
  STAFF_SEARCH_SUBTITLE_503,
  STAFF_SEARCH_SUBTITLE_5XX,
  STAFF_SEARCH_SUBTITLE_NO_CONNECTION,
} from "./staffSearchCopy";

export function mapStaffSearchLoadSubtitle(error: unknown): string {
  if (error == null) return STAFF_SEARCH_RETRY_SUBTITLE;

  if (error instanceof StaffSearchNetworkError) {
    return STAFF_SEARCH_SUBTITLE_NO_CONNECTION;
  }

  if (error instanceof StaffSearchApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return STAFF_SEARCH_SUBTITLE_400;
      case 401:
        return STAFF_SEARCH_SUBTITLE_401;
      case 402:
        return STAFF_SEARCH_SUBTITLE_402;
      case 403:
        return STAFF_SEARCH_SUBTITLE_403;
      case 404:
        return STAFF_SEARCH_SUBTITLE_404;
      case 408:
        return STAFF_SEARCH_SUBTITLE_408;
      case 409:
        return STAFF_SEARCH_SUBTITLE_409;
      case 429:
        return STAFF_SEARCH_SUBTITLE_429;
      case 503:
        return STAFF_SEARCH_SUBTITLE_503;
      default:
        if (error.status >= 500) return STAFF_SEARCH_SUBTITLE_5XX;
        break;
    }
    const detail = error.detail?.trim();
    if (detail && detail.length <= 160) return detail;
    if (detail && detail.length > 160) return `${detail.slice(0, 157)}…`;
  }

  return STAFF_SEARCH_RETRY_SUBTITLE;
}
