/**
 * Catalog hub `/catalog` — FIELDS (Step 3; SCAFFOLD/LAYOUT chrome retained).
 * Source: catalog_page.dart search TextField + 150ms debounce + clear suffix;
 * empty `No categories yet` / `No matches` client catalogs.
 * Forbidden: AppBar/FAB navigation, rename/delete, API / fuzzy over live list.
 * Staff: blocked → `/staff/home`.
 */
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  CATALOG_FAB_LABEL,
  CATALOG_SEARCH_HINT,
  CATALOG_STAFF_REDIRECT,
  CATALOG_TITLE,
  CATALOG_TOOLTIP_QUICK_CATEGORIES,
  CATALOG_TOOLTIP_SCAN,
  CATALOG_TOOLTIP_STOCK_LIST,
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

export function CatalogPage() {
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  if (role === "staff") {
    return <Navigate to={CATALOG_STAFF_REDIRECT} replace />;
  }

  return <CatalogPageFields />;
}

function CatalogPageFields() {
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

  return (
    <div className="catalog-page" data-page="catalog-fields">
      <header className="catalog-page__appbar" data-slot="appBar">
        <div
          className="catalog-page__icon-btn"
          data-deferred="back"
          aria-hidden
        >
          ←
        </div>
        <h1 className="catalog-page__title">{CATALOG_TITLE}</h1>
        <div className="catalog-page__appbar-actions" data-slot="appBarActions">
          <div
            className="catalog-page__icon-btn"
            data-deferred="quick-categories"
            title={CATALOG_TOOLTIP_QUICK_CATEGORIES}
            aria-hidden
          >
            ▤
          </div>
          <div
            className="catalog-page__icon-btn"
            data-deferred="stock-list"
            title={CATALOG_TOOLTIP_STOCK_LIST}
            aria-hidden
          >
            ▦
          </div>
          <div
            className="catalog-page__icon-btn"
            data-deferred="scan-barcode"
            title={CATALOG_TOOLTIP_SCAN}
            aria-hidden
          >
            ▣
          </div>
        </div>
      </header>

      <div className="catalog-page__shell" data-slot="shell">
        <div className="catalog-page__search catalog-page__search--active" data-slot="search">
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

          {/* Card chrome retained for LAYOUT parity until WIRE fills rows */}
          <div
            className="catalog-page__card"
            data-chrome="category-card"
            data-deferred="category-cards"
            aria-hidden
          >
            <div className="catalog-page__avatar">A</div>
            <div className="catalog-page__card-body">
              <div className="catalog-page__card-name">Category</div>
              <div className="catalog-page__card-meta">
                0 subcategories · 0 items
              </div>
            </div>
            <div className="catalog-page__card-trail">›</div>
          </div>
        </div>
      </div>

      <div
        className="catalog-page__fab"
        data-slot="fab"
        data-deferred="add-category"
        data-label={CATALOG_FAB_LABEL}
      >
        <span className="catalog-page__fab-icon" aria-hidden>
          +
        </span>
        <span className="catalog-page__fab-label">{CATALOG_FAB_LABEL}</span>
      </div>
    </div>
  );
}
