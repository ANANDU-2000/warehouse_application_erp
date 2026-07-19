/**
 * Staff low stock `/staff/low-stock` — FIELDS (Step 3).
 * Source: low_stock_dashboard_page.dart debounce 200ms · TabController ·
 * filter sheet scopes · filterLowStockGrouped.
 * Forbidden: Inform/PDF/CSV/row handlers (BUTTONS) · operations API (WIRE).
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_LS_BACK_FALLBACK,
  STAFF_LS_CSV_TOOLTIP,
  STAFF_LS_DEBOUNCE_MS,
  STAFF_LS_FILTER_ALL_SUBS,
  STAFF_LS_FILTER_APPLY,
  STAFF_LS_FILTER_CLEAR,
  STAFF_LS_FILTER_SEARCH_IN,
  STAFF_LS_FILTER_SHEET_SUB,
  STAFF_LS_FILTER_SHEET_TITLE,
  STAFF_LS_FILTER_SUBCATEGORY,
  STAFF_LS_FILTER_TOOLTIP,
  STAFF_LS_INFORM,
  STAFF_LS_PDF_TOOLTIP,
  STAFF_LS_SEARCH_HINT,
  STAFF_LS_TAB_ALL,
  STAFF_LS_TAB_BOUGHT,
  STAFF_LS_TAB_DELIVERY,
  STAFF_LS_TAB_OUT,
  STAFF_LS_TAB_PENDING,
  STAFF_LS_TITLE,
  staffLsAttentionLine,
} from "./staffLowStockCopy";
import {
  STAFF_LS_DEFAULT_SCOPE,
  STAFF_LS_SCOPE_ORDER,
  type StaffLsSearchScope,
} from "./staffLowStockFilters";
import {
  countFilteredItems,
  countLowStockForTab,
  filterLowStockGrouped,
  lowStockSubcategoryOptions,
  staffLsEmptyTitle,
  staffLsFiltersActive,
  STAFF_LS_SCOPE_LABEL,
  type StaffLsGrouped,
} from "./staffLowStockLogic";
import {
  STAFF_LS_TAB_ORDER,
  staffLsTabFromFilter,
  type StaffLsTab,
} from "./staffLowStockTabs";
import "./StaffLowStockPage.css";

const TAB_LABEL: Record<StaffLsTab, string> = {
  allLow: STAFF_LS_TAB_ALL,
  outOfStock: STAFF_LS_TAB_OUT,
  purchasedInPeriod: STAFF_LS_TAB_BOUGHT,
  pendingOrder: STAFF_LS_TAB_PENDING,
  pendingDelivery: STAFF_LS_TAB_DELIVERY,
};

/** FIELDS: empty catalog until WIRE — client filters still apply. */
const EMPTY_GROUPED: StaffLsGrouped = {};

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

export function StaffLowStockPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<StaffLsTab>(() =>
    staffLsTabFromFilter(searchParams.get("filter")),
  );
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchScope, setSearchScope] = useState<StaffLsSearchScope>(
    STAFF_LS_DEFAULT_SCOPE,
  );
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(
    null,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<StaffLsSearchScope>(
    STAFF_LS_DEFAULT_SCOPE,
  );
  const [draftSub, setDraftSub] = useState<string | null>(null);

  const grouped = EMPTY_GROUPED;

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim().toLowerCase());
    }, STAFF_LS_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const filtered = filterLowStockGrouped({
    grouped,
    tab,
    searchQuery: debounced,
    searchScope,
    subcategoryFilter,
  });
  const itemCount = countFilteredItems(filtered);
  const emptyTitle = staffLsEmptyTitle({
    itemCount,
    query: debounced,
    subcategoryFilter,
  });
  const filtersActive = staffLsFiltersActive({
    searchScope,
    subcategoryFilter,
  });
  const subOptions = lowStockSubcategoryOptions(grouped);

  const counts: Record<StaffLsTab, number> = {
    allLow: countLowStockForTab(grouped, "allLow"),
    outOfStock: countLowStockForTab(grouped, "outOfStock"),
    purchasedInPeriod: countLowStockForTab(grouped, "purchasedInPeriod"),
    pendingOrder: countLowStockForTab(grouped, "pendingOrder"),
    pendingDelivery: countLowStockForTab(grouped, "pendingDelivery"),
  };

  function openFilters(): void {
    setDraftScope(searchScope);
    setDraftSub(subcategoryFilter);
    setFiltersOpen(true);
  }

  function applyFilters(): void {
    setSearchScope(draftScope);
    setSubcategoryFilter(draftSub);
    setFiltersOpen(false);
  }

  function clearFilters(): void {
    setSearchScope(STAFF_LS_DEFAULT_SCOPE);
    setSubcategoryFilter(null);
    setDraftScope(STAFF_LS_DEFAULT_SCOPE);
    setDraftSub(null);
    setFiltersOpen(false);
  }

  return (
    <div className="staff-ls-page" data-page="staff-low-stock">
      <header className="staff-ls-appbar" data-slot="appBar">
        <div className="staff-ls-appbar__row">
          <button
            type="button"
            className="staff-ls-appbar__back"
            aria-label="Back"
            data-testid="staff-ls-back"
            onClick={() => popOrGo(navigate, STAFF_LS_BACK_FALLBACK)}
          >
            ←
          </button>
          <h1 className="staff-ls-appbar__title">{STAFF_LS_TITLE}</h1>
          <div
            className="staff-ls-appbar__actions staff-ls-export--inert"
            data-slot="exportActions"
          >
            <button
              type="button"
              className="staff-ls-appbar__action"
              title={STAFF_LS_PDF_TOOLTIP}
              aria-label={STAFF_LS_PDF_TOOLTIP}
              data-deferred="pdf-export"
              tabIndex={-1}
              disabled
            >
              PDF
            </button>
            <button
              type="button"
              className="staff-ls-appbar__action"
              title={STAFF_LS_CSV_TOOLTIP}
              aria-label={STAFF_LS_CSV_TOOLTIP}
              data-deferred="csv-export"
              tabIndex={-1}
              disabled
            >
              CSV
            </button>
          </div>
        </div>

        <div className="staff-ls-appbar__bottom" data-slot="appBarBottom">
          <div
            className="staff-ls-search-row staff-ls-search--active"
            data-slot="search"
          >
            <input
              className="staff-ls-search__input staff-ls-search__input--active"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={STAFF_LS_SEARCH_HINT}
              aria-label={STAFF_LS_SEARCH_HINT}
            />
            {query.trim().length > 0 ? (
              <button
                type="button"
                className="staff-ls-search__clear"
                aria-label="Clear"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            ) : null}
            <button
              type="button"
              className={
                filtersActive
                  ? "staff-ls-filter-btn staff-ls-filter-btn--active"
                  : "staff-ls-filter-btn"
              }
              title={STAFF_LS_FILTER_TOOLTIP}
              aria-label={STAFF_LS_FILTER_TOOLTIP}
              data-slot="filterButton"
              data-testid="staff-ls-filter"
              onClick={openFilters}
            >
              ⚙
            </button>
          </div>

          {subcategoryFilter && subcategoryFilter.trim() ? (
            <div className="staff-ls-subchip-row" data-slot="subcategoryChip">
              <button
                type="button"
                className="staff-ls-subchip"
                onClick={() => setSubcategoryFilter(null)}
              >
                {subcategoryFilter} ×
              </button>
            </div>
          ) : null}

          <p
            className="staff-ls-attention"
            data-slot="attention"
            data-deferred="attention-count"
          >
            {staffLsAttentionLine(counts.allLow)}
          </p>

          <div
            className="staff-ls-tabs staff-ls-tabs--active"
            data-slot="tabs"
            role="tablist"
            aria-label="Low stock filters"
          >
            {STAFF_LS_TAB_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={
                  tab === key
                    ? "staff-ls-tab staff-ls-tab--selected"
                    : "staff-ls-tab"
                }
                onClick={() => setTab(key)}
              >
                {TAB_LABEL[key]} ({counts[key]})
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="staff-ls-body" data-slot="body">
        <div className="staff-ls-results" data-slot="results">
          {emptyTitle ? (
            <div className="staff-ls-results__empty" data-slot="empty">
              {emptyTitle}
            </div>
          ) : null}

          <div
            className="staff-ls-tree staff-ls-tree--layout"
            data-slot="tree"
            data-deferred="category-tree"
            aria-hidden="true"
            hidden
          >
            <div className="staff-ls-category" data-slot="categoryCard">
              <div className="staff-ls-category__header">
                <span className="staff-ls-category__title">Category</span>
                <span className="staff-ls-category__count staff-ls-category__count--critical">
                  0
                </span>
              </div>
              <div
                className="staff-ls-subtabs"
                data-slot="subcategoryTabs"
                data-deferred="subcategory-tabs"
              >
                <span className="staff-ls-subtab staff-ls-subtab--selected">
                  All
                </span>
                <span className="staff-ls-subtab">Sub</span>
              </div>
              <div
                className="staff-ls-row"
                data-slot="compactRow"
                data-deferred="item-rows"
              >
                <span className="staff-ls-row__serial">1</span>
                <span
                  className="staff-ls-row__bar staff-ls-row__bar--out"
                  aria-hidden="true"
                />
                <div className="staff-ls-row__body">
                  <div className="staff-ls-row__name">Item</div>
                  <div className="staff-ls-row__meta">
                    <span className="staff-ls-row__qty">0 bag</span>
                    <span className="staff-ls-status staff-ls-status--out">
                      OUT
                    </span>
                  </div>
                  <div className="staff-ls-row__sub">Subcategory</div>
                </div>
                <button
                  type="button"
                  className="staff-ls-row__inform"
                  data-deferred="inform-owner"
                  tabIndex={-1}
                  disabled
                >
                  {STAFF_LS_INFORM}
                </button>
              </div>
              <div
                className="staff-ls-row"
                data-slot="compactRow"
                data-deferred="item-rows"
              >
                <span className="staff-ls-row__serial">2</span>
                <span
                  className="staff-ls-row__bar staff-ls-row__bar--low"
                  aria-hidden="true"
                />
                <div className="staff-ls-row__body">
                  <div className="staff-ls-row__name">Item</div>
                  <div className="staff-ls-row__meta">
                    <span className="staff-ls-row__qty">2 bag</span>
                    <span className="staff-ls-status staff-ls-status--low">
                      LOW
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="staff-ls-row__inform"
                  data-deferred="inform-owner"
                  tabIndex={-1}
                  disabled
                >
                  {STAFF_LS_INFORM}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {filtersOpen ? (
        <div
          className="staff-ls-sheet"
          data-slot="filterSheet"
          role="dialog"
          aria-label={STAFF_LS_FILTER_SHEET_TITLE}
        >
          <div className="staff-ls-sheet__panel">
            <h2 className="staff-ls-sheet__title">
              {STAFF_LS_FILTER_SHEET_TITLE}
            </h2>
            <p className="staff-ls-sheet__sub">{STAFF_LS_FILTER_SHEET_SUB}</p>
            <p className="staff-ls-sheet__label">{STAFF_LS_FILTER_SEARCH_IN}</p>
            <div className="staff-ls-sheet__scopes" data-slot="searchScopes">
              {STAFF_LS_SCOPE_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={
                    draftScope === key
                      ? "staff-ls-scope staff-ls-scope--selected"
                      : "staff-ls-scope"
                  }
                  onClick={() => setDraftScope(key)}
                >
                  {STAFF_LS_SCOPE_LABEL[key]}
                </button>
              ))}
            </div>
            {subOptions.length > 1 ? (
              <>
                <p className="staff-ls-sheet__label">
                  {STAFF_LS_FILTER_SUBCATEGORY}
                </p>
                <select
                  className="staff-ls-sheet__select"
                  value={draftSub ?? ""}
                  onChange={(e) =>
                    setDraftSub(e.target.value === "" ? null : e.target.value)
                  }
                  aria-label={STAFF_LS_FILTER_SUBCATEGORY}
                >
                  <option value="">{STAFF_LS_FILTER_ALL_SUBS}</option>
                  {subOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
            <button
              type="button"
              className="staff-ls-sheet__apply"
              data-testid="staff-ls-filter-apply"
              onClick={applyFilters}
            >
              {STAFF_LS_FILTER_APPLY}
            </button>
            {filtersActive ||
            draftScope !== STAFF_LS_DEFAULT_SCOPE ||
            draftSub ? (
              <button
                type="button"
                className="staff-ls-sheet__clear"
                data-testid="staff-ls-filter-clear"
                onClick={clearFilters}
              >
                {STAFF_LS_FILTER_CLEAR}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="staff-ls-sheet__backdrop"
            aria-label="Close"
            onClick={() => setFiltersOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
