/**
 * Catalog hub `/catalog` — SCAFFOLD (Step 1).
 * Source: catalog_page.dart — AppBar / search / grid / FAB regions only.
 * Forbidden this step: search input, rename/delete, FAB sheet, API.
 * Staff: blocked → `/staff/home` (app_router.dart `_staffRedirectForBlockedRoute`).
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
    <div className="catalog-page" data-page="catalog-scaffold">
      <header className="catalog-page__appbar" data-slot="appBar">
        <div
          className="catalog-page__appbar-leading"
          data-deferred="back"
          aria-hidden
        />
        <h1 className="catalog-page__title">{CATALOG_TITLE}</h1>
        <div className="catalog-page__appbar-actions" data-slot="appBarActions">
          <span data-deferred="quick-categories" title={CATALOG_TOOLTIP_QUICK_CATEGORIES} />
          <span data-deferred="stock-list" title={CATALOG_TOOLTIP_STOCK_LIST} />
          <span data-deferred="scan-barcode" title={CATALOG_TOOLTIP_SCAN} />
        </div>
      </header>

      <div className="catalog-page__shell" data-slot="shell">
        <div
          className="catalog-page__search"
          data-slot="search"
          data-deferred="search-field"
          data-hint={CATALOG_SEARCH_HINT}
        />
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
            <p className="catalog-page__empty-title">{CATALOG_EMPTY_TITLE}</p>
            <p className="catalog-page__empty-sub">{CATALOG_EMPTY_SUB}</p>
          </div>
        </div>
      </div>

      <div
        className="catalog-page__fab"
        data-slot="fab"
        data-deferred="add-category"
        data-label={CATALOG_FAB_LABEL}
      />
    </div>
  );
}
