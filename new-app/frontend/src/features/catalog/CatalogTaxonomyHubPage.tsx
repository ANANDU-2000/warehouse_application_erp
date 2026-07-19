/**
 * Catalog taxonomy hub `/catalog/taxonomy` — FIELDS (Step 3).
 * Formula source: catalog_taxonomy_hub_page.dart
 * Search: immediate trim+lower contains (not fuzzy, no debounce).
 * Empty catalogs: No categories yet / No matches + shared subtitle.
 * Staff: allowed. Forbidden: submit/API / chip-FAB handlers (BUTTONS).
 */
import { useMemo, useState } from "react";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  TAXONOMY_CHIP_CATEGORY,
  TAXONOMY_CHIP_SUBCATEGORY,
  TAXONOMY_EMPTY_PRIMARY,
  TAXONOMY_EXPLAINER,
  TAXONOMY_FAB_TOOLTIP,
  TAXONOMY_ROW_ADD_SUB_TOOLTIP,
  TAXONOMY_ROW_NO_SUBS,
  TAXONOMY_SEARCH_HINT,
  TAXONOMY_TITLE,
  TAXONOMY_TOOLTIP_BACK,
  TAXONOMY_TOOLTIP_FULL_CATALOG,
} from "./catalogTaxonomyCopy";
import {
  taxonomyEmptyMode,
  taxonomyEmptySub,
  taxonomyEmptyTitle,
  taxonomyFilterCategories,
  type TaxonomyCategoryNameRow,
} from "./catalogTaxonomyFields";
import "./CatalogTaxonomyHubPage.css";

/** FIELDS: no API yet — empty catalog until WIRE. */
const FIELDS_CATEGORIES: TaxonomyCategoryNameRow[] = [];

export function CatalogTaxonomyHubPage() {
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  const isStaff = role === "staff";

  const [searchDraft, setSearchDraft] = useState("");
  /** Flutter listener applies trim+lower immediately (no debounce). */
  const searchQuery = searchDraft.trim().toLowerCase();

  const displayList = useMemo(
    () => taxonomyFilterCategories(FIELDS_CATEGORIES, searchQuery),
    [searchQuery],
  );

  const emptyMode = taxonomyEmptyMode({
    listLength: displayList.length,
    searchQuery,
  });
  const showEmpty = displayList.length === 0;
  const showClear = searchDraft.length > 0;

  return (
    <div
      className="taxonomy-hub-page"
      data-page="catalog-taxonomy"
      data-step="FIELDS"
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
        <p className="taxonomy-hub-page__explainer" data-slot="explainer">
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
          className="taxonomy-hub-page__search taxonomy-hub-page__search--active"
          data-slot="search"
        >
          <span className="taxonomy-hub-page__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            className="taxonomy-hub-page__search-input"
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={TAXONOMY_SEARCH_HINT}
            aria-label={TAXONOMY_SEARCH_HINT}
            data-testid="taxonomy-search"
            autoComplete="off"
          />
          {showClear ? (
            <button
              type="button"
              className="taxonomy-hub-page__search-clear"
              data-testid="taxonomy-search-clear"
              aria-label="Clear search"
              onClick={() => setSearchDraft("")}
            >
              ×
            </button>
          ) : null}
        </div>

        {!showEmpty ? (
          <div
            className="taxonomy-hub-page__list"
            data-slot="categoryList"
            data-deferred="category-rows"
            data-row-no-subs={TAXONOMY_ROW_NO_SUBS}
            data-row-add-sub={TAXONOMY_ROW_ADD_SUB_TOOLTIP}
          >
            {displayList.map((c) => (
              <div
                key={c.id}
                className="taxonomy-hub-page__row"
                data-chrome="category-row"
              >
                <span className="taxonomy-hub-page__avatar" aria-hidden>
                  📁
                </span>
                <div className="taxonomy-hub-page__row-text">
                  <p className="taxonomy-hub-page__row-name">{c.name}</p>
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
            ))}
          </div>
        ) : (
          <div
            className="taxonomy-hub-page__empty"
            data-slot="empty"
            data-testid="taxonomy-empty"
            data-empty-mode={emptyMode}
          >
            <div className="taxonomy-hub-page__empty-icon" aria-hidden>
              🗂
            </div>
            <div
              className="taxonomy-hub-page__empty-title"
              data-empty="title"
            >
              {taxonomyEmptyTitle(emptyMode)}
            </div>
            <div className="taxonomy-hub-page__empty-sub" data-empty="sub">
              {taxonomyEmptySub(emptyMode)}
            </div>
            <div
              className="taxonomy-hub-page__empty-primary"
              data-empty="primary"
              data-deferred="empty-add"
            >
              {TAXONOMY_EMPTY_PRIMARY}
            </div>
          </div>
        )}

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
