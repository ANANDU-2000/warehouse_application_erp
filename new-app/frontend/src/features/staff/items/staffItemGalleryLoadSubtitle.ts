/**
 * loadStateErrorSubtitle — load_state_error.dart
 * Used under FriendlyLoadError message "Could not load items".
 */
import {
  StaffGalleryApiError,
  StaffGalleryNetworkError,
} from "./staffItemGalleryApi";
import {
  STAFF_GALLERY_RETRY_SUBTITLE,
  STAFF_GALLERY_SUBTITLE_400,
  STAFF_GALLERY_SUBTITLE_401,
  STAFF_GALLERY_SUBTITLE_402,
  STAFF_GALLERY_SUBTITLE_403,
  STAFF_GALLERY_SUBTITLE_404,
  STAFF_GALLERY_SUBTITLE_408,
  STAFF_GALLERY_SUBTITLE_409,
  STAFF_GALLERY_SUBTITLE_429,
  STAFF_GALLERY_SUBTITLE_503,
  STAFF_GALLERY_SUBTITLE_5XX,
  STAFF_GALLERY_SUBTITLE_NO_CONNECTION,
} from "./staffItemGalleryCopy";

export function mapStaffGalleryLoadSubtitle(error: unknown): string {
  if (error == null) return STAFF_GALLERY_RETRY_SUBTITLE;

  if (error instanceof StaffGalleryNetworkError) {
    return STAFF_GALLERY_SUBTITLE_NO_CONNECTION;
  }

  if (error instanceof StaffGalleryApiError) {
    switch (error.status) {
      case 400:
      case 422:
        return STAFF_GALLERY_SUBTITLE_400;
      case 401:
        return STAFF_GALLERY_SUBTITLE_401;
      case 402:
        return STAFF_GALLERY_SUBTITLE_402;
      case 403:
        return STAFF_GALLERY_SUBTITLE_403;
      case 404:
        return STAFF_GALLERY_SUBTITLE_404;
      case 408:
        return STAFF_GALLERY_SUBTITLE_408;
      case 409:
        return STAFF_GALLERY_SUBTITLE_409;
      case 429:
        return STAFF_GALLERY_SUBTITLE_429;
      case 503:
        return STAFF_GALLERY_SUBTITLE_503;
      default:
        if (error.status >= 500) return STAFF_GALLERY_SUBTITLE_5XX;
        break;
    }
    const detail = error.detail?.trim();
    if (detail && detail.length <= 160) return detail;
    if (detail && detail.length > 160) return `${detail.slice(0, 157)}…`;
  }

  return STAFF_GALLERY_RETRY_SUBTITLE;
}
