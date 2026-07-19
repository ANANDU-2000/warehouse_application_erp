/**
 * Catalog taxonomy hub `/catalog/taxonomy` — BUTTONS (Step 4).
 * Formula source: catalog_taxonomy_hub_page.dart
 * Local nav only — quick sheets → full-screen stubs until sheet WIRE.
 * Staff: allowed. Forbidden: live item-categories / types-index API.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  TAXONOMY_BACK_FALLBACK_OWNER,
  TAXONOMY_BACK_FALLBACK_STAFF,
  TAXONOMY_CHIP_CATEGORY,
  TAXONOMY_CHIP_SUBCATEGORY,
  TAXONOMY_EMPTY_PRIMARY,
  TAXONOMY_EXPLAINER,
  TAXONOMY_FAB_TOOLTIP,
  TAXONOMY_PATH_CATALOG,
  TAXONOMY_PATH_NEW_CATEGORY,
  TAXONOMY_ROW_ADD_SUB_TOOLTIP,
  TAXONOMY_ROW_NO_SUBS,
  TAXONOMY_SAMPLE_CATEGORY_ID,
  TAXONOMY_SAMPLE_CATEGORY_NAME,
  TAXONOMY_SEARCH_HINT,
  TAXONOMY_TITLE,
  TAXONOMY_TOOLTIP_BACK,
  TAXONOMY_TOOLTIP_FULL_CATALOG,
  taxonomyCategoryPath,
  taxonomyNewSubcategoryPath,
} from "./catalogTaxonomyCopy";
import {
  taxonomyEmptyMode,
  taxonomyEmptySub,
  taxonomyEmptyTitle,
  taxonomyFilterCategories,
  type TaxonomyCategoryNameRow,
} from "./catalogTaxonomyFields";
import "./CatalogTaxonomyHubPage.css";

/** BUTTONS sample row until WIRE (mirrors catalog hub sample card). */
const BUTTONS_CATEGORIES: TaxonomyCategoryNameRow[] = [
  {
    id: TAXONOMY_SAMPLE_CATEGORY_ID,
    name: TAXONOMY_SAMPLE_CATEGORY_NAME,
  },
];

function popOrGo(
  navigate: ReturnType<typeof useNavigate>,
  fallback: string,
): void {
  if (window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}

export function CatalogTaxonomyHubPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  const isStaff = role === "staff";
  const backFallback = isStaff
    ? TAXONOMY_BACK_FALLBACK_STAFF
    : TAXONOMY_BACK_FALLBACK_OWNER;

  const [searchDraft, setSearchDraft] = useState("");
  const searchQuery = searchDraft.trim().toLowerCase();

  const displayList = useMemo(
    () => taxonomyFilterCategories(BUTTONS_CATEGORIES, searchQuery),
    [searchQuery],
  );

  const emptyMode = taxonomyEmptyMode({
    listLength: displayList.length,
    searchQuery,
  });
  const showEmpty = displayList.length === 0;
  const showClear = searchDraft.length > 0;

  const onBack = () => popOrGo(navigate, backFallback);
  const onFullCatalog = () => navigate(TAXONOMY_PATH_CATALOG);
  /** Quick category sheet → full-screen create until sheet ported */
  const onAddCategory = () => navigate(TAXONOMY_PATH_NEW_CATEGORY);
  /** Subcategory sheet without preselect → sample new-sub stub until sheet */
  const onAddSubcategory = (categoryId?: string) => {
    const id = categoryId?.trim() || TAXONOMY_SAMPLE_CATEGORY_ID;
    navigate(taxonomyNewSubcategoryPath(id));
  };
  const onOpenCategory = (categoryId: string) => {
    if (!categoryId) return;
    if (isStaff) {
      onAddSubcategory(categoryId);
      return;
    }
    navigate(taxonomyCategoryPath(categoryId));
  };

  return (
    <div
      className="taxonomy-hub-page"
      data-page="catalog-taxonomy"
      data-step="BUTTONS"
    >
      <header className="taxonomy-hub-page__appbar" data-slot="appBar">
        <button
          type="button"
          className="taxonomy-hub-page__icon-btn taxonomy-hub-page__icon-btn--active"
          data-action="back"
          title={TAXONOMY_TOOLTIP_BACK}
          aria-label={TAXONOMY_TOOLTIP_BACK}
          onClick={onBack}
        >
          ←
        </button>
        <h1 className="taxonomy-hub-page__title">{TAXONOMY_TITLE}</h1>
        {!isStaff ? (
          <button
            type="button"
            className="taxonomy-hub-page__icon-btn taxonomy-hub-page__icon-btn--active"
            data-action="full-catalog"
            data-role="owner-only"
            title={TAXONOMY_TOOLTIP_FULL_CATALOG}
            aria-label={TAXONOMY_TOOLTIP_FULL_CATALOG}
            onClick={onFullCatalog}
          >
            📖
          </button>
        ) : null}
      </header>

      <div className="taxonomy-hub-page__body">
        <p className="taxonomy-hub-page__explainer" data-slot="explainer">
          {TAXONOMY_EXPLAINER}
        </p>

        <div className="taxonomy-hub-page__chips" data-slot="chips">
          <button
            type="button"
            className="taxonomy-hub-page__action-chip taxonomy-hub-page__action-chip--active"
            data-action="chip-category"
            data-label={TAXONOMY_CHIP_CATEGORY}
            onClick={onAddCategory}
          >
            <span className="taxonomy-hub-page__action-chip-icon" aria-hidden>
              +
            </span>
            {TAXONOMY_CHIP_CATEGORY}
          </button>
          <button
            type="button"
            className="taxonomy-hub-page__action-chip taxonomy-hub-page__action-chip--active"
            data-action="chip-subcategory"
            data-label={TAXONOMY_CHIP_SUBCATEGORY}
            onClick={() => onAddSubcategory()}
          >
            <span className="taxonomy-hub-page__action-chip-icon" aria-hidden>
              ↳
            </span>
            {TAXONOMY_CHIP_SUBCATEGORY}
          </button>
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
            data-row-no-subs={TAXONOMY_ROW_NO_SUBS}
            data-row-add-sub={TAXONOMY_ROW_ADD_SUB_TOOLTIP}
            data-sample="category-rows"
          >
            {displayList.map((c) => (
              <div
                key={c.id}
                className="taxonomy-hub-page__row taxonomy-hub-page__row--hit"
                data-chrome="category-row"
                data-action="open-category"
                role="button"
                tabIndex={0}
                onClick={() => onOpenCategory(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenCategory(c.id);
                  }
                }}
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
                <button
                  type="button"
                  className="taxonomy-hub-page__row-add taxonomy-hub-page__row-add--active"
                  data-action="add-subcategory"
                  title={TAXONOMY_ROW_ADD_SUB_TOOLTIP}
                  aria-label={TAXONOMY_ROW_ADD_SUB_TOOLTIP}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubcategory(c.id);
                  }}
                >
                  ⊕
                </button>
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
            <div className="taxonomy-hub-page__empty-title" data-empty="title">
              {taxonomyEmptyTitle(emptyMode)}
            </div>
            <div className="taxonomy-hub-page__empty-sub" data-empty="sub">
              {taxonomyEmptySub(emptyMode)}
            </div>
            <button
              type="button"
              className="taxonomy-hub-page__empty-primary taxonomy-hub-page__empty-primary--active"
              data-empty="primary"
              data-action="empty-add"
              onClick={onAddCategory}
            >
              {TAXONOMY_EMPTY_PRIMARY}
            </button>
          </div>
        )}

        <button
          type="button"
          className="taxonomy-hub-page__fab taxonomy-hub-page__fab--active"
          data-slot="fab"
          data-action="quick-add"
          data-tooltip={TAXONOMY_FAB_TOOLTIP}
          title={TAXONOMY_FAB_TOOLTIP}
          aria-label={TAXONOMY_FAB_TOOLTIP}
          onClick={onAddCategory}
        >
          +
        </button>
      </div>
    </div>
  );
}
