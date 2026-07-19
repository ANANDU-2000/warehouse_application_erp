/**
 * FriendlyLoadError map — low_stock_dashboard_page.dart AsyncValue.error
 * (WIRE minimal; STATES may add skeleton / cache).
 */
import { StaffLsApiError, StaffLsNetworkError } from "./staffLowStockApi";
import {
  STAFF_LS_FRIENDLY_401,
  STAFF_LS_FRIENDLY_404,
  STAFF_LS_FRIENDLY_5XX,
  STAFF_LS_FRIENDLY_GENERIC,
  STAFF_LS_FRIENDLY_NETWORK,
  STAFF_LS_LOAD_FAILED,
  STAFF_LS_RETRY_SUBTITLE,
  STAFF_LS_SESSION_EXPIRED,
} from "./staffLowStockCopy";

export function mapStaffLsLoadTitle(error: unknown): string {
  if (
    typeof error === "string" &&
    (error === "Not signed in" ||
      error.toLowerCase().includes("sign in") ||
      error.toLowerCase().includes("session"))
  ) {
    return STAFF_LS_SESSION_EXPIRED;
  }
  if (error instanceof StaffLsNetworkError) {
    return STAFF_LS_LOAD_FAILED;
  }
  if (error instanceof StaffLsApiError) {
    if (error.status === 401) return STAFF_LS_SESSION_EXPIRED;
    if (error.status === 404) return STAFF_LS_FRIENDLY_404;
    if (error.status >= 500) return STAFF_LS_FRIENDLY_5XX;
    return STAFF_LS_LOAD_FAILED;
  }
  return STAFF_LS_LOAD_FAILED;
}

export function mapStaffLsLoadSubtitle(error: unknown): string {
  if (error instanceof StaffLsNetworkError) {
    return STAFF_LS_FRIENDLY_NETWORK;
  }
  if (error instanceof StaffLsApiError) {
    if (error.status === 401) return STAFF_LS_FRIENDLY_401;
    if (error.detail) return error.detail;
  }
  if (typeof error === "string" && error.trim()) return error;
  return STAFF_LS_RETRY_SUBTITLE || STAFF_LS_FRIENDLY_GENERIC;
}
