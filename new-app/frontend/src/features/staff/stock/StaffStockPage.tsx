/**
 * Staff stock `/staff/stock` — FIELDS (Step 3).
 * Source: stock_page.dart search debounce 180ms · status chips · tab client state;
 * stock_period_utils prefix rank; HexaEmptyState titles.
 * Forbidden: AppBar action handlers (BUTTONS), stock list API (WIRE).
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  STAFF_STOCK_ACTIVITY_EMPTY,
  STAFF_STOCK_BACK_HOME,
  STAFF_STOCK_DEBOUNCE_MS,
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
  filterStaffStockRows,
  staffStockListEmptyTitle,
  type StaffStockRow,
} from "./staffStockLogic";
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

const STATUS_CHIP_MOD: Record<StaffStockStatus, string> = {
  all: "staff-stock-chip--all",
  shortage: "staff-stock-chip--low",
  out: "staff-stock-chip--out",
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
  const [tab, setTab] = useState<StaffStockTab>(() =>
    staffStockTabFromQuery(searchParams.get("tab")),
  );
  const [status, setStatus] = useState<StaffStockStatus>(() =>
    staffStockStatusFromQuery(searchParams.get("status")),
  );
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  /** Local catalog — WIRE fills; FIELDS filters empty → empty titles. */
  const [allItems] = useState<StaffStockRow[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim());
    }, STAFF_STOCK_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const filtered = filterStaffStockRows(allItems, {
    status,
    query: debounced,
  });
  const emptyTitle = staffStockListEmptyTitle({
    itemCount: filtered.length,
    status,
    query: debounced,
  });

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
            {/* Period / Filters / Search toggle / More — BUTTONS */}
            <span
              className="staff-stock-appbar__action-slot"
              data-deferred="period"
            />
            <span
              className="staff-stock-appbar__action-slot"
              data-deferred="filters"
            />
            <span
              className="staff-stock-appbar__action-slot"
              data-deferred="search-toggle"
            />
            <span
              className="staff-stock-appbar__action-slot"
              data-deferred="more"
            />
          </div>
        </div>
        <div
          className="staff-stock-tabs staff-stock-tabs--active"
          data-slot="tabs"
          role="tablist"
        >
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
              onClick={() => setTab(key)}
            >
              {TAB_LABEL[key]}
            </button>
          ))}
        </div>
      </header>

      <main className="staff-stock-body" data-slot="body">
        {tab === "stock" ? (
          <>
            <div
              className="staff-stock-status-chips staff-stock-status-chips--active"
              data-slot="statusChips"
            >
              {STAFF_STOCK_STATUS_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={[
                    "staff-stock-chip",
                    STATUS_CHIP_MOD[key],
                    status === key ? "staff-stock-chip--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setStatus(key)}
                >
                  {STATUS_LABEL[key]}
                </button>
              ))}
            </div>
            <div
              className="staff-stock-search staff-stock-search--active"
              data-slot="search"
            >
              <input
                className="staff-stock-search__input staff-stock-search__input--active"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={STAFF_STOCK_SEARCH_HINT}
                aria-label={STAFF_STOCK_SEARCH_HINT}
              />
              {query.trim().length > 0 ? (
                <button
                  type="button"
                  className="staff-stock-search__clear"
                  aria-label="Clear"
                  onClick={() => setQuery("")}
                >
                  ×
                </button>
              ) : null}
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
              {emptyTitle ? (
                <div className="staff-stock-results__empty" data-slot="empty">
                  {emptyTitle}
                </div>
              ) : null}
              <div className="staff-stock-list" data-slot="list" hidden />
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
