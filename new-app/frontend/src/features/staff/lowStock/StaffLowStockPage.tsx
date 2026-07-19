/**
 * Staff low stock `/staff/low-stock` — LAYOUT (Step 2).
 * Source: low_stock_dashboard_page.dart · low_stock_compact_item_row.dart ·
 * low_stock_category_tree.dart · HexaColors.
 * Forbidden: typing, filter sheet, API, Inform handlers, PDF/CSV export.
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_LS_BACK_FALLBACK,
  STAFF_LS_CSV_TOOLTIP,
  STAFF_LS_EMPTY,
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
  const [tab] = useState<StaffLsTab>(() =>
    staffLsTabFromFilter(searchParams.get("filter")),
  );

  /** LAYOUT: counts still deferred — chrome shows (0). */
  const counts: Record<StaffLsTab, number> = {
    allLow: 0,
    outOfStock: 0,
    purchasedInPeriod: 0,
    pendingOrder: 0,
    pendingDelivery: 0,
  };

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
            className="staff-ls-search-row staff-ls-search--inert"
            data-slot="search"
          >
            <input
              className="staff-ls-search__input"
              type="search"
              readOnly
              tabIndex={-1}
              placeholder={STAFF_LS_SEARCH_HINT}
              aria-label={STAFF_LS_SEARCH_HINT}
              value=""
            />
            <button
              type="button"
              className="staff-ls-filter-btn"
              title={STAFF_LS_FILTER_TOOLTIP}
              aria-label={STAFF_LS_FILTER_TOOLTIP}
              data-slot="filterButton"
              data-deferred="filter-sheet"
              tabIndex={-1}
              disabled
            >
              ⚙
            </button>
          </div>

          <p
            className="staff-ls-attention"
            data-slot="attention"
            data-deferred="attention-count"
          >
            {staffLsAttentionLine(counts.allLow)}
          </p>

          <div
            className="staff-ls-tabs staff-ls-tabs--inert"
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
                tabIndex={-1}
                className={
                  tab === key
                    ? "staff-ls-tab staff-ls-tab--selected"
                    : "staff-ls-tab"
                }
              >
                {TAB_LABEL[key]} ({counts[key]})
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="staff-ls-body" data-slot="body">
        <div className="staff-ls-results" data-slot="results">
          <div className="staff-ls-results__empty" data-slot="empty">
            {STAFF_LS_EMPTY}
          </div>

          {/* LAYOUT sample chrome — not wired; FIELDS/WIRE fill real tree */}
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
    </div>
  );
}
