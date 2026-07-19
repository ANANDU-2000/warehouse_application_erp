/**
 * Catalog taxonomy hub `/catalog/taxonomy` — WIRE (Step 5).
 * Formula source: catalog_taxonomy_hub_page.dart · itemCategoriesListProvider ·
 * categoryTypesIndexProvider · contains filter · row sub counts.
 * Creates stay on stubs (quick sheet deferred). Loading/error basic until STATES.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  CatalogApiError,
  CatalogNetworkError,
  listCategoryTypesIndex,
  listItemCategories,
  type CatalogCategory,
  type CategoryTypeIndexRow,
} from "./catalogApi";
import {
  TAXONOMY_BACK_FALLBACK_OWNER,
  TAXONOMY_BACK_FALLBACK_STAFF,
  TAXONOMY_CHIP_CATEGORY,
  TAXONOMY_CHIP_SUBCATEGORY,
  TAXONOMY_EMPTY_PRIMARY,
  TAXONOMY_EXPLAINER,
  TAXONOMY_FAB_TOOLTIP,
  TAXONOMY_LOAD_FAILED,
  TAXONOMY_PATH_CATALOG,
  TAXONOMY_PATH_NEW_CATEGORY,
  TAXONOMY_RETRY,
  TAXONOMY_ROW_ADD_SUB_TOOLTIP,
  TAXONOMY_ROW_NO_SUBS,
  TAXONOMY_SEARCH_HINT,
  TAXONOMY_TITLE,
  TAXONOMY_TOOLTIP_BACK,
  TAXONOMY_TOOLTIP_FULL_CATALOG,
  taxonomyCategoryPath,
  taxonomyNewSubcategoryPath,
  taxonomyRowSubtitle,
} from "./catalogTaxonomyCopy";
import {
  taxonomyEmptyMode,
  taxonomyEmptySub,
  taxonomyEmptyTitle,
  taxonomyFilterCategories,
} from "./catalogTaxonomyFields";
import { typeCountForCategory } from "./catalogTaxonomy";
import "./CatalogTaxonomyHubPage.css";

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

function friendlyTaxonomyError(e: unknown): string {
  if (e instanceof CatalogApiError) return e.detail;
  if (e instanceof CatalogNetworkError) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return TAXONOMY_LOAD_FAILED;
}

export function CatalogTaxonomyHubPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const role = (session?.role ?? "").toLowerCase();
  const isStaff = role === "staff";
  const backFallback = isStaff
    ? TAXONOMY_BACK_FALLBACK_STAFF
    : TAXONOMY_BACK_FALLBACK_OWNER;

  const [searchDraft, setSearchDraft] = useState("");
  const searchQuery = searchDraft.trim().toLowerCase();

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [typesIndex, setTypesIndex] = useState<CategoryTypeIndexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const [hasData, setHasData] = useState(false);
  const hasDataRef = useRef(false);

  useEffect(() => {
    hasDataRef.current = false;
    setHasData(false);
    setCategories([]);
    setTypesIndex([]);
    setLoadError(null);
  }, [businessId]);

  const reload = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      setLoadError("Not signed in");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const cats = await listItemCategories(businessId);
      let types: CategoryTypeIndexRow[] = [];
      try {
        types = await listCategoryTypesIndex(businessId);
      } catch {
        /* Flutter: indexAsync.valueOrNull ?? [] — types soft-fail */
        types = [];
      }
      setCategories(cats);
      setTypesIndex(types);
      hasDataRef.current = true;
      setHasData(true);
      setLoadError(null);
    } catch (e: unknown) {
      if (!hasDataRef.current) {
        setCategories([]);
        setTypesIndex([]);
      }
      setLoadError(e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await reload();
    })();
    return () => {
      cancelled = true;
    };
  }, [reload, retryTick]);

  const displayList = useMemo(
    () => taxonomyFilterCategories(categories, searchQuery),
    [categories, searchQuery],
  );

  const showInitialLoad = loading && !hasData;
  const showError = !loading && loadError != null && !hasData;
  const showBody = !showInitialLoad && !showError;
  const showEmpty = showBody && displayList.length === 0;
  const emptyMode = taxonomyEmptyMode({
    listLength: displayList.length,
    searchQuery,
  });
  const showClear = searchDraft.length > 0;

  const retryLoad = () => setRetryTick((n) => n + 1);

  const onBack = () => popOrGo(navigate, backFallback);
  const onFullCatalog = () => navigate(TAXONOMY_PATH_CATALOG);
  const onAddCategory = () => navigate(TAXONOMY_PATH_NEW_CATEGORY);
  const onAddSubcategory = (categoryId?: string) => {
    const id = categoryId?.trim();
    if (id) {
      navigate(taxonomyNewSubcategoryPath(id));
      return;
    }
    /* Sheet deferred: preselect first loaded category when available */
    const first = categories.find((c) => c.id.trim().length > 0);
    if (first) {
      navigate(taxonomyNewSubcategoryPath(first.id));
      return;
    }
    navigate(TAXONOMY_PATH_NEW_CATEGORY);
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
      data-step="WIRE"
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
            disabled={showInitialLoad}
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

        {showInitialLoad ? (
          <div
            className="taxonomy-hub-page__loading"
            data-slot="loading"
            data-testid="taxonomy-loading"
          >
            Loading…
          </div>
        ) : null}

        {showError ? (
          <div
            className="taxonomy-hub-page__error"
            data-slot="error"
            data-testid="taxonomy-error"
          >
            <p className="taxonomy-hub-page__error-title">
              {friendlyTaxonomyError(loadError)}
            </p>
            <button
              type="button"
              className="taxonomy-hub-page__error-retry"
              data-action="retry"
              onClick={retryLoad}
            >
              {TAXONOMY_RETRY}
            </button>
          </div>
        ) : null}

        {showBody && !showEmpty ? (
          <div
            className="taxonomy-hub-page__list"
            data-slot="categoryList"
            data-row-no-subs={TAXONOMY_ROW_NO_SUBS}
            data-row-add-sub={TAXONOMY_ROW_ADD_SUB_TOOLTIP}
          >
            {displayList.map((c) => {
              const subN = typeCountForCategory(typesIndex, c.id);
              return (
                <div
                  key={c.id}
                  className="taxonomy-hub-page__row taxonomy-hub-page__row--hit"
                  data-chrome="category-row"
                  data-action="open-category"
                  data-sub-count={subN}
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
                      {taxonomyRowSubtitle(subN)}
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
              );
            })}
          </div>
        ) : null}

        {showEmpty ? (
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
        ) : null}

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
