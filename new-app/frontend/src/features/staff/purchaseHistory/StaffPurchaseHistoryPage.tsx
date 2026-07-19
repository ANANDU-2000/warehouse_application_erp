/**
 * Staff purchase history `/staff/purchase-history` — SCAFFOLD (Step 1).
 * Source: staff_purchase_history_page.dart StaffPurchaseHistoryPage.
 * Forbidden: debounce/search typing, chip/tab handlers, trade-purchases API, detail nav.
 */
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_PH_BACK_FALLBACK,
  STAFF_PH_EMPTY_LOW,
  STAFF_PH_EMPTY_PERIOD,
  STAFF_PH_LOW_ALL,
  STAFF_PH_LOW_CRITICAL,
  STAFF_PH_SEARCH_HINT,
  STAFF_PH_SEARCH_HINT_LOW,
  STAFF_PH_STATUS_ALL,
  STAFF_PH_STATUS_DELIVERED,
  STAFF_PH_STATUS_UNDELIVERED,
  STAFF_PH_TAB_ALL,
  STAFF_PH_TAB_LOW,
  STAFF_PH_TAB_TODAY,
  STAFF_PH_TAB_WEEK,
  STAFF_PH_TITLE,
} from "./staffPurchaseHistoryCopy";
import {
  STAFF_PH_DEFAULT_LOW,
  STAFF_PH_DEFAULT_STATUS,
  STAFF_PH_LOW_ORDER,
  STAFF_PH_STATUS_ORDER,
  type StaffPhLowFilter,
  type StaffPhStatusFilter,
} from "./staffPurchaseHistoryFilters";
import {
  STAFF_PH_TAB_ORDER,
  staffPhTabFromQuery,
  type StaffPhTab,
} from "./staffPurchaseHistoryTabs";
import "./StaffPurchaseHistoryPage.css";

const TAB_LABEL: Record<StaffPhTab, string> = {
  today: STAFF_PH_TAB_TODAY,
  week: STAFF_PH_TAB_WEEK,
  allTime: STAFF_PH_TAB_ALL,
  lowStock: STAFF_PH_TAB_LOW,
};

const STATUS_LABEL: Record<StaffPhStatusFilter, string> = {
  all: STAFF_PH_STATUS_ALL,
  pending: STAFF_PH_STATUS_UNDELIVERED,
  delivered: STAFF_PH_STATUS_DELIVERED,
};

const LOW_LABEL: Record<StaffPhLowFilter, string> = {
  all: STAFF_PH_LOW_ALL,
  critical: STAFF_PH_LOW_CRITICAL,
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

export function StaffPurchaseHistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = staffPhTabFromQuery(searchParams.get("tab"));
  const isLow = tab === "lowStock";
  const status = STAFF_PH_DEFAULT_STATUS;
  const lowFilter = STAFF_PH_DEFAULT_LOW;

  return (
    <div className="staff-ph-page" data-page="staff-purchase-history">
      <header className="staff-ph-appbar" data-slot="appBar">
        <div className="staff-ph-appbar__row">
          <button
            type="button"
            className="staff-ph-appbar__back"
            aria-label="Back"
            data-testid="staff-ph-back"
            onClick={() => popOrGo(navigate, STAFF_PH_BACK_FALLBACK)}
          >
            ←
          </button>
          <h1 className="staff-ph-appbar__title">{STAFF_PH_TITLE}</h1>
        </div>
        <div
          className="staff-ph-tabs"
          data-slot="tabs"
          role="tablist"
          aria-label="Period"
        >
          {STAFF_PH_TAB_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={
                tab === key
                  ? "staff-ph-tab staff-ph-tab--selected"
                  : "staff-ph-tab"
              }
              disabled
              tabIndex={-1}
            >
              {TAB_LABEL[key]}
            </button>
          ))}
        </div>
      </header>

      <main className="staff-ph-body" data-slot="body">
        <div className="staff-ph-search" data-slot="search">
          <input
            className="staff-ph-search__input"
            type="search"
            readOnly
            disabled
            placeholder={isLow ? STAFF_PH_SEARCH_HINT_LOW : STAFF_PH_SEARCH_HINT}
            aria-label={isLow ? STAFF_PH_SEARCH_HINT_LOW : STAFF_PH_SEARCH_HINT}
            value=""
          />
        </div>

        {!isLow ? (
          <div className="staff-ph-chips" data-slot="statusChips">
            {STAFF_PH_STATUS_ORDER.map((key) => (
              <span
                key={key}
                className={
                  status === key
                    ? "staff-ph-chip staff-ph-chip--selected"
                    : "staff-ph-chip"
                }
              >
                {STATUS_LABEL[key]}
              </span>
            ))}
          </div>
        ) : (
          <div className="staff-ph-chips" data-slot="lowStockChips">
            {STAFF_PH_LOW_ORDER.map((key) => (
              <span
                key={key}
                className={
                  lowFilter === key
                    ? "staff-ph-chip staff-ph-chip--selected"
                    : "staff-ph-chip"
                }
              >
                {LOW_LABEL[key]}
              </span>
            ))}
          </div>
        )}

        <div className="staff-ph-results" data-slot="results">
          <div className="staff-ph-results__empty" data-slot="empty">
            {isLow ? STAFF_PH_EMPTY_LOW : STAFF_PH_EMPTY_PERIOD}
          </div>
          {/* Date headers + StaffPurchaseHistoryRow — FIELDS/WIRE */}
          <div data-slot="list" data-deferred="purchase-rows" hidden />
        </div>
      </main>
    </div>
  );
}
