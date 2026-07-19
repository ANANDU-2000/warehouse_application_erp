/**
 * Staff low stock `/staff/low-stock` — SCAFFOLD (Step 1).
 * Source: low_stock_dashboard_page.dart LowStockDashboardPage(staffMode: true).
 * Forbidden this step: typing, filter sheet, API, Inform owner handlers, PDF/CSV export.
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_LS_BACK_FALLBACK,
  STAFF_LS_CSV_TOOLTIP,
  STAFF_LS_EMPTY,
  STAFF_LS_FILTER_TOOLTIP,
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
  const [tab, setTab] = useState<StaffLsTab>(() =>
    staffLsTabFromFilter(searchParams.get("filter")),
  );

  /** SCAFFOLD: counts deferred to WIRE — show 0 like cold empty chrome. */
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
          <div className="staff-ls-appbar__actions" data-slot="exportActions">
            <button
              type="button"
              className="staff-ls-appbar__action"
              title={STAFF_LS_PDF_TOOLTIP}
              aria-label={STAFF_LS_PDF_TOOLTIP}
              data-deferred="pdf-export"
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
              disabled
            >
              CSV
            </button>
          </div>
        </div>

        <div className="staff-ls-appbar__bottom" data-slot="appBarBottom">
          <div className="staff-ls-search-row" data-slot="search">
            <input
              className="staff-ls-search__input"
              type="search"
              readOnly
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
            className="staff-ls-tabs"
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
          <div className="staff-ls-results__empty" data-slot="empty">
            {STAFF_LS_EMPTY}
          </div>
          <div
            className="staff-ls-tree"
            data-slot="tree"
            data-deferred="category-tree"
            hidden
          />
          <div data-deferred="inform-owner" hidden />
        </div>
      </main>
    </div>
  );
}
