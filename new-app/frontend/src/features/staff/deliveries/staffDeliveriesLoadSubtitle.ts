/**
 * FriendlyLoadError mapping — staff_pending_deliveries_page.dart
 * Fixed message; subtitle always kFriendlyLoadNetworkSubtitle (Tap to retry.).
 * Source does not use HexaErrorCard / loadStateErrorSubtitle on this page.
 */
import {
  STAFF_DEL_LOAD_FAILED,
  STAFF_DEL_RETRY_SUBTITLE,
} from "./staffDeliveriesCopy";

/** Fixed Flutter FriendlyLoadError.message */
export function mapStaffDelLoadTitle(_error: unknown): string {
  return STAFF_DEL_LOAD_FAILED;
}

/** FriendlyLoadError default subtitle — always Tap to retry. */
export function mapStaffDelLoadSubtitle(_error: unknown): string {
  return STAFF_DEL_RETRY_SUBTITLE;
}
