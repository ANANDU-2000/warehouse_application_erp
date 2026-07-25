/**
 * Add-category user-facing errors —
 * Formula source: form_feedback.dart showRetryableErrorSnackBar ·
 * user_facing_errors / friendlyApiError (no Dio/HTTP codes in UI).
 */
import {
  CatalogApiError,
  CatalogNetworkError,
} from "./catalogApi";
import {
  ADD_CATEGORY_LOAD_FAILED,
} from "./catalogAddCategoryCopy";

export function mapAddCategoryError(error: unknown): string {
  if (error instanceof CatalogApiError) {
    const detail = error.detail?.trim();
    if (detail) return detail;
    if (error.status === 401 || error.status === 403) {
      return "Session expired. Please sign in again.";
    }
    if (error.status === 404) return "This item was not found.";
    if (error.status === 408) return "Request timed out. Please try again.";
    if (error.status === 429) {
      return "Too many requests. Wait a moment and try again.";
    }
    if (error.status >= 500) {
      return "Something went wrong. Please try again.";
    }
    return ADD_CATEGORY_LOAD_FAILED;
  }
  if (error instanceof CatalogNetworkError) {
    return error.message || "Network error";
  }
  if (error instanceof Error && error.message.trim()) {
    const m = error.message.trim();
    if (/dio|http|stack|exception/i.test(m)) return ADD_CATEGORY_LOAD_FAILED;
    return m;
  }
  return ADD_CATEGORY_LOAD_FAILED;
}
