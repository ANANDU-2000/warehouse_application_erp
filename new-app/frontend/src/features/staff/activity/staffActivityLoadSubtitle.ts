/**
 * HexaErrorCard.fromError → loadStateErrorSubtitle (load_state_error.dart).
 * Title always 'Could not load activity' (staff_activity_page.dart).
 */
import { StaffActApiError, StaffActNetworkError } from "./staffActivityApi";
import {
  STAFF_ACT_LOAD_FAILED,
  STAFF_ACT_RETRY_SUBTITLE,
  STAFF_ACT_SUBTITLE_400,
  STAFF_ACT_SUBTITLE_401,
  STAFF_ACT_SUBTITLE_402,
  STAFF_ACT_SUBTITLE_403,
  STAFF_ACT_SUBTITLE_404,
  STAFF_ACT_SUBTITLE_408,
  STAFF_ACT_SUBTITLE_409,
  STAFF_ACT_SUBTITLE_429,
  STAFF_ACT_SUBTITLE_503,
  STAFF_ACT_SUBTITLE_5XX,
  STAFF_ACT_SUBTITLE_NO_CONNECTION,
} from "./staffActivityCopy";

/** Fixed Flutter HexaErrorCard.fromError title. */
export function mapStaffActLoadTitle(_error: unknown): string {
  return STAFF_ACT_LOAD_FAILED;
}

/** loadStateErrorSubtitle — never raw Dio/stack. */
export function mapStaffActLoadSubtitle(error: unknown): string {
  if (error == null) return STAFF_ACT_RETRY_SUBTITLE;

  if (error instanceof StaffActNetworkError) {
    return STAFF_ACT_SUBTITLE_NO_CONNECTION;
  }

  if (error instanceof StaffActApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return STAFF_ACT_SUBTITLE_400;
      case 401:
        return STAFF_ACT_SUBTITLE_401;
      case 402:
        return STAFF_ACT_SUBTITLE_402;
      case 403:
        return STAFF_ACT_SUBTITLE_403;
      case 404:
        return STAFF_ACT_SUBTITLE_404;
      case 408:
        return STAFF_ACT_SUBTITLE_408;
      case 409:
        return STAFF_ACT_SUBTITLE_409;
      case 429:
        return STAFF_ACT_SUBTITLE_429;
      case 503:
        return STAFF_ACT_SUBTITLE_503;
      default:
        if (error.status >= 500) return STAFF_ACT_SUBTITLE_5XX;
        break;
    }
    const detail = error.detail?.trim();
    if (detail && detail.length <= 160) return detail;
    if (detail && detail.length > 160) return `${detail.slice(0, 157)}…`;
  }

  if (typeof error === "string" && error === "Not signed in") {
    return STAFF_ACT_SUBTITLE_401;
  }

  return STAFF_ACT_RETRY_SUBTITLE;
}
