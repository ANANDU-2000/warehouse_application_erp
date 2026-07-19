/**
 * Catalog hub `/catalog` — BUTTONS (Step 4; FIELDS search retained).
 * Source: catalog_page.dart AppBar back/actions · FAB · card InkWell.
 * Local navigation only — no item-categories API (WIRE).
 * Rename/delete menus deferred (need PATCH/DELETE).
 * Staff: blocked → `/staff/home`.
 */
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  CATALOG_BACK_FALLBACK,
  CATALOG_FAB_LABEL,
  CATALOG_PATH_NEW_CATEGORY,
  CATALOG_PATH_SCAN,
  CATALOG_PATH_STOCK,
  CATALOG_PATH_TAXONOMY,
  CATALOG_SAMPLE_CATEGORY_ID,
  CATALOG_SEARCH_HINT,
  CATALOG_STAFF_REDIRECT,
  CATALOG_TITLE,
  CATALOG_TOOLTIP_BACK,
  CATALOG_TOOLTIP_QUICK_CATEGORIES,
  CATALOG_TOOLTIP_SCAN,
  CATALOG_TOOLTIP_STOCK_LIST,
  catalogCategoryPath,
} from "./catalogCopy";
import {
  CATALOG_SEARCH_DEBOUNCE_MS,
  catalogDisplayLength,
  catalogEmptyMode,
  catalogEmptySub,
  catalogEmptyTitle,
} from "./catalogFields";
import "./CatalogPage.css";

/** Until WIRE — no catalog rows loaded. */
const CLIENT_CATEGORY_COUNT = 0;

/** Flutter navigation_ext.popOrGo */
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

export function CatalogPage() {
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  if (role === "staff") {
    return <Navigate to={CATALOG_STAFF_REDIRECT} replace />;
  }

  return <CatalogPageButtons />;
}

function CatalogPageButtons() {
  const navigate = useNavigate();
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchQuery(searchDraft);
    }, CATALOG_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchDraft]);

  const displayLen = catalogDisplayLength({
    listLength: CLIENT_CATEGORY_COUNT,
    searchQuery,
  });
  const emptyMode = catalogEmptyMode({
    listLength: displayLen,
    searchQuery,
  });
  const showEmpty = displayLen === 0;
  const showClear = searchDraft.length > 0;

  const onBack = () => popOrGo(navigate, CATALOG_BACK_FALLBACK);
  const onQuickCategories = () => navigate(CATALOG_PATH_TAXONOMY);
  const onStockList = () => navigate(CATALOG_PATH_STOCK);
  const onScan = () => navigate(CATALOG_PATH_SCAN);
  const onAddCategory = () => navigate(CATALOG_PATH_NEW_CATEGORY);
  const onOpenCategory = (id: string) => navigate(catalogCategoryPath(id));

  return (
    <div className="catalog-page" data-page="catalog-buttons">
      <header className="catalog-page__appbar" data-slot="appBar">
        <button
          type="button"
          className="catalog-page__icon-btn catalog-page__icon-btn--active"
          data-action="back"
          title={CATALOG_TOOLTIP_BACK}
          aria-label={CATALOG_TOOLTIP_BACK}
          onClick={onBack}
        >
          ←
        </button>
        <h1 className="catalog-page__title">{CATALOG_TITLE}</h1>
        <div className="catalog-page__appbar-actions" data-slot="appBarActions">
          <button
            type="button"
            className="catalog-page__icon-btn catalog-page__icon-btn--active"
            data-action="quick-categories"
            title={CATALOG_TOOLTIP_QUICK_CATEGORIES}
            aria-label={CATALOG_TOOLTIP_QUICK_CATEGORIES}
            onClick={onQuickCategories}
          >
            ▤
          </button>
          <button
            type="button"
            className="catalog-page__icon-btn catalog-page__icon-btn--active"
            data-action="stock-list"
            title={CATALOG_TOOLTIP_STOCK_LIST}
            aria-label={CATALOG_TOOLTIP_STOCK_LIST}
            onClick={onStockList}
          >
            ▦
          </button>
          <button
            type="button"
            className="catalog-page__icon-btn catalog-page__icon-btn--active"
            data-action="scan-barcode"
            title={CATALOG_TOOLTIP_SCAN}
            aria-label={CATALOG_TOOLTIP_SCAN}
            onClick={onScan}
          >
            ▣
          </button>
        </div>
      </header>

      <div className="catalog-page__shell" data-slot="shell">
        <div
          className="catalog-page__search catalog-page__search--active"
          data-slot="search"
        >
          <span className="catalog-page__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            className="catalog-page__search-input"
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={CATALOG_SEARCH_HINT}
            aria-label={CATALOG_SEARCH_HINT}
            data-testid="catalog-search"
            autoComplete="off"
          />
          {showClear ? (
            <button
              type="button"
              className="catalog-page__search-clear"
              data-testid="catalog-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearchDraft("");
                setSearchQuery("");
              }}
            >
              ×
            </button>
          ) : null}
        </div>

        <div
          className="catalog-page__suggestions"
          data-slot="suggestions"
          data-deferred="suggestion-chips"
          data-search-query={searchQuery.trim()}
        />

        <div className="catalog-page__grid" data-slot="categoryGrid">
          {showEmpty ? (
            <div
              className="catalog-page__empty"
              data-slot="empty"
              data-empty-mode={emptyMode}
              data-testid="catalog-empty"
            >
              <div className="catalog-page__empty-icon" aria-hidden>
                📁
              </div>
              <p className="catalog-page__empty-title">
                {catalogEmptyTitle(emptyMode)}
              </p>
              <p className="catalog-page__empty-sub">
                {catalogEmptySub(emptyMode)}
              </p>
            </div>
          ) : null}

          {/* Sample card hit target until WIRE fills rows */}
          <button
            type="button"
            className="catalog-page__card catalog-page__card--hit"
            data-chrome="category-card"
            data-action="open-category"
            data-sample="buttons"
            data-deferred="category-cards"
            onClick={() => onOpenCategory(CATALOG_SAMPLE_CATEGORY_ID)}
          >
            <div className="catalog-page__avatar">A</div>
            <div className="catalog-page__card-body">
              <div className="catalog-page__card-name">Category</div>
              <div className="catalog-page__card-meta">
                0 subcategories · 0 items
              </div>
            </div>
            <div className="catalog-page__card-trail">›</div>
          </button>
        </div>
      </div>

      <button
        type="button"
        className="catalog-page__fab catalog-page__fab--active"
        data-slot="fab"
        data-action="add-category"
        data-label={CATALOG_FAB_LABEL}
        aria-label={CATALOG_FAB_LABEL}
        onClick={onAddCategory}
      >
        <span className="catalog-page__fab-icon" aria-hidden>
          +
        </span>
        <span className="catalog-page__fab-label">{CATALOG_FAB_LABEL}</span>
      </button>
    </div>
  );
}
