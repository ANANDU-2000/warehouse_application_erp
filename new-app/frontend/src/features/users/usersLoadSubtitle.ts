/**
 * loadStateErrorSubtitle — source-app load_state_error.dart (users list HexaErrorCard).
 */
import { UsersApiError, UsersNetworkError } from "./usersApi";
import {
  USERS_MGMT_RETRY_SUBTITLE,
  USERS_MGMT_SUBTITLE_400,
  USERS_MGMT_SUBTITLE_401,
  USERS_MGMT_SUBTITLE_402,
  USERS_MGMT_SUBTITLE_403,
  USERS_MGMT_SUBTITLE_404,
  USERS_MGMT_SUBTITLE_408,
  USERS_MGMT_SUBTITLE_409,
  USERS_MGMT_SUBTITLE_429,
  USERS_MGMT_SUBTITLE_503,
  USERS_MGMT_SUBTITLE_5XX,
  USERS_MGMT_SUBTITLE_NO_CONNECTION,
} from "./usersManagementCopy";

export function mapUsersLoadSubtitle(error: unknown): string {
  if (error == null) return USERS_MGMT_RETRY_SUBTITLE;

  if (error instanceof UsersNetworkError) {
    return USERS_MGMT_SUBTITLE_NO_CONNECTION;
  }

  if (error instanceof UsersApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return USERS_MGMT_SUBTITLE_400;
      case 401:
        return USERS_MGMT_SUBTITLE_401;
      case 402:
        return USERS_MGMT_SUBTITLE_402;
      case 403:
        return USERS_MGMT_SUBTITLE_403;
      case 404:
        return USERS_MGMT_SUBTITLE_404;
      case 408:
        return USERS_MGMT_SUBTITLE_408;
      case 409:
        return USERS_MGMT_SUBTITLE_409;
      case 429:
        return USERS_MGMT_SUBTITLE_429;
      case 503:
        return USERS_MGMT_SUBTITLE_503;
      default:
        if (error.status >= 500) return USERS_MGMT_SUBTITLE_5XX;
        break;
    }
    const detail = error.detail?.trim();
    if (detail && detail.length <= 160) return detail;
    if (detail && detail.length > 160) return `${detail.slice(0, 157)}…`;
  }

  return USERS_MGMT_RETRY_SUBTITLE;
}
