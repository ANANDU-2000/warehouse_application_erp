/**
 * loadStateErrorSubtitle — source-app load_state_error.dart
 * (notifications_page.dart error ListTile subtitle).
 */
import {
  NotificationsApiError,
  NotificationsNetworkError,
} from "./notificationsApi";
import {
  NOTIFICATIONS_RETRY_SUBTITLE,
  NOTIFICATIONS_SUBTITLE_400,
  NOTIFICATIONS_SUBTITLE_401,
  NOTIFICATIONS_SUBTITLE_402,
  NOTIFICATIONS_SUBTITLE_403,
  NOTIFICATIONS_SUBTITLE_404,
  NOTIFICATIONS_SUBTITLE_408,
  NOTIFICATIONS_SUBTITLE_409,
  NOTIFICATIONS_SUBTITLE_429,
  NOTIFICATIONS_SUBTITLE_503,
  NOTIFICATIONS_SUBTITLE_5XX,
  NOTIFICATIONS_SUBTITLE_NO_CONNECTION,
} from "./notificationsCopy";

export function mapNotificationsLoadSubtitle(error: unknown): string {
  if (error == null) return NOTIFICATIONS_RETRY_SUBTITLE;

  if (error instanceof NotificationsNetworkError) {
    return NOTIFICATIONS_SUBTITLE_NO_CONNECTION;
  }

  if (error instanceof NotificationsApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return NOTIFICATIONS_SUBTITLE_400;
      case 401:
        return NOTIFICATIONS_SUBTITLE_401;
      case 402:
        return NOTIFICATIONS_SUBTITLE_402;
      case 403:
        return NOTIFICATIONS_SUBTITLE_403;
      case 404:
        return NOTIFICATIONS_SUBTITLE_404;
      case 408:
        return NOTIFICATIONS_SUBTITLE_408;
      case 409:
        return NOTIFICATIONS_SUBTITLE_409;
      case 429:
        return NOTIFICATIONS_SUBTITLE_429;
      case 503:
        return NOTIFICATIONS_SUBTITLE_503;
      default:
        if (error.status >= 500) return NOTIFICATIONS_SUBTITLE_5XX;
        break;
    }
    const detail = error.detail?.trim();
    if (detail && detail.length <= 160) return detail;
    if (detail && detail.length > 160) return `${detail.slice(0, 157)}…`;
  }

  return NOTIFICATIONS_RETRY_SUBTITLE;
}
