/**
 * Catalog taxonomy hub `/catalog/taxonomy` — SCAFFOLD (Step 1).
 * Formula source: catalog_taxonomy_hub_page.dart
 * Staff: allowed (unlike /catalog). Owner-only Full catalog action deferred.
 * Forbidden this step: fields, CTAs, API.
 */
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  TAXONOMY_CHIP_CATEGORY,
  TAXONOMY_CHIP_SUBCATEGORY,
  TAXONOMY_EMPTY_PRIMARY,
  TAXONOMY_EMPTY_SUB,
  TAXONOMY_EMPTY_TITLE,
  TAXONOMY_EXPLAINER,
  TAXONOMY_FAB_TOOLTIP,
  TAXONOMY_NO_MATCHES_TITLE,
  TAXONOMY_ROW_ADD_SUB_TOOLTIP,
  TAXONOMY_ROW_NO_SUBS,
  TAXONOMY_SEARCH_HINT,
  TAXONOMY_TITLE,
  TAXONOMY_TOOLTIP_BACK,
  TAXONOMY_TOOLTIP_FULL_CATALOG,
} from "./catalogTaxonomyCopy";
import "./CatalogTaxonomyHubPage.css";

export function CatalogTaxonomyHubPage() {
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  const isStaff = role === "staff";

  return (
    <div className="taxonomy-hub-page" data-page="catalog-taxonomy" data-step="SCAFFOLD">
      <header className="taxonomy-hub-page__appbar" data-slot="appBar">
        <span data-deferred="back" title={TAXONOMY_TOOLTIP_BACK}>
          ←
        </span>
        <h1 className="taxonomy-hub-page__title">{TAXONOMY_TITLE}</h1>
        {!isStaff ? (
          <span
            data-deferred="full-catalog"
            data-role="owner-only"
            title={TAXONOMY_TOOLTIP_FULL_CATALOG}
          >
            📖
          </span>
        ) : null}
      </header>

      <div className="taxonomy-hub-page__body">
        <p className="taxonomy-hub-page__slot" data-slot="explainer">
          {TAXONOMY_EXPLAINER}
        </p>

        <div className="taxonomy-hub-page__slot" data-slot="chips">
          <span data-deferred="chip-category" data-label={TAXONOMY_CHIP_CATEGORY}>
            {TAXONOMY_CHIP_CATEGORY}
          </span>
          <span
            data-deferred="chip-subcategory"
            data-label={TAXONOMY_CHIP_SUBCATEGORY}
          >
            {TAXONOMY_CHIP_SUBCATEGORY}
          </span>
        </div>

        <div
          className="taxonomy-hub-page__slot"
          data-slot="search"
          data-deferred="search-field"
          data-hint={TAXONOMY_SEARCH_HINT}
        >
          {TAXONOMY_SEARCH_HINT}
        </div>

        <div
          className="taxonomy-hub-page__slot"
          data-slot="categoryList"
          data-deferred="category-rows"
          data-row-no-subs={TAXONOMY_ROW_NO_SUBS}
          data-row-add-sub={TAXONOMY_ROW_ADD_SUB_TOOLTIP}
        />

        <div className="taxonomy-hub-page__slot" data-slot="empty">
          <div data-empty="no-categories">{TAXONOMY_EMPTY_TITLE}</div>
          <div data-empty="no-matches">{TAXONOMY_NO_MATCHES_TITLE}</div>
          <div data-empty="sub">{TAXONOMY_EMPTY_SUB}</div>
          <div data-empty="primary" data-deferred="empty-add">
            {TAXONOMY_EMPTY_PRIMARY}
          </div>
        </div>

        <div
          className="taxonomy-hub-page__fab-slot"
          data-slot="fab"
          data-deferred="quick-add"
          data-tooltip={TAXONOMY_FAB_TOOLTIP}
        >
          {TAXONOMY_FAB_TOOLTIP}
        </div>
      </div>
    </div>
  );
}
