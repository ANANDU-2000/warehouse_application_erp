/**
 * Catalog taxonomy hub `/catalog/taxonomy` — LAYOUT (Step 2).
 * Formula source: catalog_taxonomy_hub_page.dart · HexaOp · HexaColors
 * Staff: allowed. Owner-only Full catalog chrome (deferred handlers).
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

/** Chrome-only sample row for LAYOUT parity (no live data until WIRE). */
const LAYOUT_SAMPLE_ROW_NAME = "Rice";

export function CatalogTaxonomyHubPage() {
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  const isStaff = role === "staff";

  return (
    <div
      className="taxonomy-hub-page"
      data-page="catalog-taxonomy"
      data-step="LAYOUT"
    >
      <header className="taxonomy-hub-page__appbar" data-slot="appBar">
        <span
          className="taxonomy-hub-page__icon-btn"
          data-deferred="back"
          title={TAXONOMY_TOOLTIP_BACK}
          aria-hidden
        >
          ←
        </span>
        <h1 className="taxonomy-hub-page__title">{TAXONOMY_TITLE}</h1>
        {!isStaff ? (
          <span
            className="taxonomy-hub-page__icon-btn"
            data-deferred="full-catalog"
            data-role="owner-only"
            title={TAXONOMY_TOOLTIP_FULL_CATALOG}
            aria-hidden
          >
            📖
          </span>
        ) : null}
      </header>

      <div className="taxonomy-hub-page__body">
        <p
          className="taxonomy-hub-page__explainer"
          data-slot="explainer"
        >
          {TAXONOMY_EXPLAINER}
        </p>

        <div className="taxonomy-hub-page__chips" data-slot="chips">
          <span
            className="taxonomy-hub-page__action-chip"
            data-deferred="chip-category"
            data-label={TAXONOMY_CHIP_CATEGORY}
          >
            <span className="taxonomy-hub-page__action-chip-icon" aria-hidden>
              +
            </span>
            {TAXONOMY_CHIP_CATEGORY}
          </span>
          <span
            className="taxonomy-hub-page__action-chip"
            data-deferred="chip-subcategory"
            data-label={TAXONOMY_CHIP_SUBCATEGORY}
          >
            <span className="taxonomy-hub-page__action-chip-icon" aria-hidden>
              ↳
            </span>
            {TAXONOMY_CHIP_SUBCATEGORY}
          </span>
        </div>

        <div
          className="taxonomy-hub-page__search"
          data-slot="search"
          data-deferred="search-field"
          data-hint={TAXONOMY_SEARCH_HINT}
        >
          <span className="taxonomy-hub-page__search-icon" aria-hidden>
            ⌕
          </span>
          <span className="taxonomy-hub-page__search-hint">
            {TAXONOMY_SEARCH_HINT}
          </span>
        </div>

        <div
          className="taxonomy-hub-page__list"
          data-slot="categoryList"
          data-deferred="category-rows"
          data-row-no-subs={TAXONOMY_ROW_NO_SUBS}
          data-row-add-sub={TAXONOMY_ROW_ADD_SUB_TOOLTIP}
        >
          <div
            className="taxonomy-hub-page__row"
            data-chrome="category-row"
          >
            <span className="taxonomy-hub-page__avatar" aria-hidden>
              📁
            </span>
            <div className="taxonomy-hub-page__row-text">
              <p className="taxonomy-hub-page__row-name">
                {LAYOUT_SAMPLE_ROW_NAME}
              </p>
              <p className="taxonomy-hub-page__row-meta">
                {TAXONOMY_ROW_NO_SUBS}
              </p>
            </div>
            <span
              className="taxonomy-hub-page__row-add"
              title={TAXONOMY_ROW_ADD_SUB_TOOLTIP}
              aria-hidden
            >
              ⊕
            </span>
          </div>
        </div>

        <div className="taxonomy-hub-page__empty" data-slot="empty">
          <div className="taxonomy-hub-page__empty-icon" aria-hidden>
            🗂
          </div>
          <div
            className="taxonomy-hub-page__empty-title"
            data-empty="no-categories"
          >
            {TAXONOMY_EMPTY_TITLE}
          </div>
          <div
            className="taxonomy-hub-page__empty-title"
            data-empty="no-matches"
            hidden
          >
            {TAXONOMY_NO_MATCHES_TITLE}
          </div>
          <div className="taxonomy-hub-page__empty-sub" data-empty="sub">
            {TAXONOMY_EMPTY_SUB}
          </div>
          <div
            className="taxonomy-hub-page__empty-primary"
            data-empty="primary"
            data-deferred="empty-add"
          >
            {TAXONOMY_EMPTY_PRIMARY}
          </div>
        </div>

        <div
          className="taxonomy-hub-page__fab"
          data-slot="fab"
          data-deferred="quick-add"
          data-tooltip={TAXONOMY_FAB_TOOLTIP}
          title={TAXONOMY_FAB_TOOLTIP}
          aria-hidden
        >
          +
        </div>
      </div>
    </div>
  );
}
