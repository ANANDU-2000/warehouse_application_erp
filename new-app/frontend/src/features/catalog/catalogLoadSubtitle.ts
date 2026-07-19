/**
 * FriendlyLoadError mapping — catalog_page.dart uses default FriendlyLoadError
 * (message `Unable to load data`, subtitle `Tap to retry.`).
 */
import {
  CATALOG_LOAD_FAILED,
  CATALOG_RETRY_SUBTITLE,
} from "./catalogCopy";

export function mapCatalogLoadTitle(_error: unknown): string {
  return CATALOG_LOAD_FAILED;
}

export function mapCatalogLoadSubtitle(_error: unknown): string {
  return CATALOG_RETRY_SUBTITLE;
}
