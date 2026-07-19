/**
 * Staff stock `/staff/stock` — SCAFFOLD (Step 1).
 * Source: stock_page.dart StockPage(mode: staff); StockOperationalTopBar;
 * stock_status_quick_chips; stock_warehouse_table_header; empty HexaEmptyState.
 * Forbidden this step: interactive fields, CTA menus, stock list API.
 */
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_STOCK_ACTIVITY_EMPTY,
  STAFF_STOCK_BACK_HOME,
  STAFF_STOCK_EMPTY,
  STAFF_STOCK_HDR_DIFF,
  STAFF_STOCK_HDR_ITEM,
  STAFF_STOCK_HDR_PHYS,
  STAFF_STOCK_HDR_SYS,
  STAFF_STOCK_SEARCH_HINT,
  STAFF_STOCK_STATUS_ALL,
  STAFF_STOCK_STATUS_LOW,
  STAFF_STOCK_STATUS_OUT,
  STAFF_STOCK_TAB_ACTIVITY,
  STAFF_STOCK_TAB_STOCK,
  STAFF_STOCK_TITLE,
} from "./staffStockCopy";
import {
  STAFF_STOCK_STATUS_ORDER,
  staffStockStatusFromQuery,
  type StaffStockStatus,
} from "./staffStockStatus";
import {
  STAFF_STOCK_TAB_ORDER,
  staffStockTabFromQuery,
  type StaffStockTab,
} from "./staffStockTabs";
import "./StaffStockPage.css";

const STATUS_LABEL: Record<StaffStockStatus, string> = {
  all: STAFF_STOCK_STATUS_ALL,
  shortage: STAFF_STOCK_STATUS_LOW,
  out: STAFF_STOCK_STATUS_OUT,
};

const TAB_LABEL: Record<StaffStockTab, string> = {
  stock: STAFF_STOCK_TAB_STOCK,
  activity: STAFF_STOCK_TAB_ACTIVITY,
};

/** Flutter top bar: context.go(staff ? '/staff/home' : '/home'). */
function goStaffHome(navigate: ReturnType<typeof useNavigate>): void {
  navigate(STAFF_STOCK_BACK_HOME);
}

export function StaffStockPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = staffStockTabFromQuery(searchParams.get("tab"));
  const status = staffStockStatusFromQuery(searchParams.get("status"));

  return (
    <div className="staff-stock-page" data-page="staff-stock">
      <header className="staff-stock-appbar" data-slot="appBar">
        <div className="staff-stock-appbar__row">
          <button
            type="button"
            className="staff-stock-appbar__back"
            aria-label="Home"
            onClick={() => goStaffHome(navigate)}
          >
            ←
          </button>
          <h1 className="staff-stock-appbar__title">{STAFF_STOCK_TITLE}</h1>
          <div
            className="staff-stock-appbar__actions"
            data-slot="actions"
            aria-hidden="true"
          >
            {/* Period / Filters / Search / More — BUTTONS */}
            <span className="staff-stock-appbar__action-slot" data-deferred="period" />
            <span className="staff-stock-appbar__action-slot" data-deferred="filters" />
            <span className="staff-stock-appbar__action-slot" data-deferred="search-toggle" />
            <span className="staff-stock-appbar__action-slot" data-deferred="more" />
          </div>
        </div>
        <div className="staff-stock-tabs" data-slot="tabs" role="tablist">
          {STAFF_STOCK_TAB_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={
                tab === key
                  ? "staff-stock-tab staff-stock-tab--active"
                  : "staff-stock-tab"
              }
              tabIndex={-1}
            >
              {TAB_LABEL[key]}
            </button>
          ))}
        </div>
      </header>

      <main className="staff-stock-body" data-slot="body">
        {tab === "stock" ? (
          <>
            <div className="staff-stock-status-chips" data-slot="statusChips">
              {STAFF_STOCK_STATUS_ORDER.map((key) => (
                <span
                  key={key}
                  className={
                    status === key
                      ? "staff-stock-chip staff-stock-chip--active"
                      : "staff-stock-chip"
                  }
                >
                  {STATUS_LABEL[key]}
                </span>
              ))}
            </div>
            <div className="staff-stock-search" data-slot="search">
              <input
                className="staff-stock-search__input"
                type="search"
                readOnly
                placeholder={STAFF_STOCK_SEARCH_HINT}
                aria-label={STAFF_STOCK_SEARCH_HINT}
              />
            </div>
            <div
              className="staff-stock-delivery"
              data-slot="deliveryChips"
              data-deferred="delivery-counts"
            />
            <div className="staff-stock-table-header" data-slot="tableHeader">
              <div className="staff-stock-table-header__item">
                {STAFF_STOCK_HDR_ITEM}
              </div>
              <div className="staff-stock-table-header__metric">
                {STAFF_STOCK_HDR_SYS}
              </div>
              <div className="staff-stock-table-header__metric">
                {STAFF_STOCK_HDR_PHYS}
              </div>
              <div className="staff-stock-table-header__metric">
                {STAFF_STOCK_HDR_DIFF}
              </div>
            </div>
            <div className="staff-stock-results" data-slot="results">
              {STAFF_STOCK_EMPTY}
            </div>
          </>
        ) : (
          <div className="staff-stock-activity" data-slot="activity">
            {STAFF_STOCK_ACTIVITY_EMPTY}
          </div>
        )}
      </main>
    </div>
  );
}
