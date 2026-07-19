/**
 * Catalog hub `/catalog` — LAYOUT (Step 2; SCAFFOLD slots retained).
 * Source: catalog_page.dart · HexaColors · DesktopPageShell max 900 ·
 * search Outline radius 12 · grid pad fromLTRB(16,8,16,100) · card radius 14 /
 * pad 12 · avatar primaryMid@20% · title w800 16 · FAB extended.
 * Forbidden: search input, handlers, API.
 * Staff: blocked → `/staff/home`.
 */
import { Navigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  CATALOG_EMPTY_SUB,
  CATALOG_EMPTY_TITLE,
  CATALOG_FAB_LABEL,
  CATALOG_SEARCH_HINT,
  CATALOG_STAFF_REDIRECT,
  CATALOG_TITLE,
  CATALOG_TOOLTIP_QUICK_CATEGORIES,
  CATALOG_TOOLTIP_SCAN,
  CATALOG_TOOLTIP_STOCK_LIST,
} from "./catalogCopy";
import "./CatalogPage.css";

export function CatalogPage() {
  const session = readPrimaryBusiness();
  const role = (session?.role ?? "").toLowerCase();
  if (role === "staff") {
    return <Navigate to={CATALOG_STAFF_REDIRECT} replace />;
  }

  return (
    <div className="catalog-page" data-page="catalog-layout">
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
        <div
          className="catalog-page__search"
          data-slot="search"
          data-deferred="search-field"
        >
          <span className="catalog-page__search-icon" aria-hidden>
            ⌕
          </span>
          <span className="catalog-page__search-hint">{CATALOG_SEARCH_HINT}</span>
        </div>

        <div
          className="catalog-page__suggestions"
          data-slot="suggestions"
          data-deferred="suggestion-chips"
        />

        <div className="catalog-page__grid" data-slot="categoryGrid">
          <div
            className="catalog-page__empty"
            data-slot="empty"
            data-deferred="category-cards"
          >
            <div className="catalog-page__empty-icon" aria-hidden>
              📁
            </div>
            <p className="catalog-page__empty-title">{CATALOG_EMPTY_TITLE}</p>
            <p className="catalog-page__empty-sub">{CATALOG_EMPTY_SUB}</p>
          </div>

          {/* Inert card chrome sample — LAYOUT only; WIRE fills real cards */}
          <div
            className="catalog-page__card"
            data-chrome="category-card"
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
