/**
 * FriendlyLoadError mapping — catalog_taxonomy_hub_page.dart uses default
 * FriendlyLoadError (message `Unable to load data`, subtitle `Tap to retry.`).
 */
import {
  TAXONOMY_LOAD_FAILED,
  TAXONOMY_RETRY_SUBTITLE,
} from "./catalogTaxonomyCopy";

export function mapTaxonomyLoadTitle(_error: unknown): string {
  return TAXONOMY_LOAD_FAILED;
}

export function mapTaxonomyLoadSubtitle(_error: unknown): string {
  return TAXONOMY_RETRY_SUBTITLE;
}
