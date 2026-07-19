/**
 * Staff stock `/staff/stock` — WIRE (Step 5).
 * Source: stockListProvider / hexa_api.listStock · StockWarehouseRow SYS/PHYS/DIFF.
 * Deferred: delivery-indicator-counts · Activity feed · period purchased · shell-bundle.
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import type { HomePeriod } from "../../home/homePeriod";
import {
  STAFF_STOCK_ACTIVITY_EMPTY,
  STAFF_STOCK_BACK_HOME,
  STAFF_STOCK_DEBOUNCE_MS,
  STAFF_STOCK_DEFAULT_SORT,
  STAFF_STOCK_FILTER_APPLY,
  STAFF_STOCK_FILTER_CLEAR,
  STAFF_STOCK_FILTER_MISSING_BARCODE,
  STAFF_STOCK_FILTER_MISSING_CODE,
  STAFF_STOCK_FILTER_PURCHASED,
  STAFF_STOCK_FILTER_REORDER,
  STAFF_STOCK_FILTER_SHEET_TITLE,
  STAFF_STOCK_HDR_DIFF,
  STAFF_STOCK_HDR_ITEM,
  STAFF_STOCK_HDR_PHYS,
  STAFF_STOCK_HDR_SYS,
  STAFF_STOCK_LOAD_FAILED,
  STAFF_STOCK_LOAD_MORE,
  STAFF_STOCK_LOADING,
  STAFF_STOCK_MENU_SCAN,
  STAFF_STOCK_PERIOD_SHEET_TITLE,
  STAFF_STOCK_RETRY,
  STAFF_STOCK_SCAN_PATH,
  STAFF_STOCK_SEARCH_HINT,
  STAFF_STOCK_STATUS_ALL,
  STAFF_STOCK_STATUS_LOW,
  STAFF_STOCK_STATUS_OUT,
  STAFF_STOCK_TAB_ACTIVITY,
  STAFF_STOCK_TAB_STOCK,
  STAFF_STOCK_TITLE,
  STAFF_STOCK_TOOLTIP_FILTERS,
  STAFF_STOCK_TOOLTIP_HIDE_SEARCH,
  STAFF_STOCK_TOOLTIP_PERIOD,
  STAFF_STOCK_TOOLTIP_SEARCH,
} from "./staffStockCopy";
import {
  fetchStaffStockListPage,
  STAFF_STOCK_PER_PAGE,
  StaffStockApiError,
  StaffStockNetworkError,
} from "./staffStockApi";
import {
  countWarehouseActiveFilters,
  STAFF_STOCK_OP_FILTERS_EMPTY,
  type StaffStockOpFilters,
} from "./staffStockFilters";
import {
  filterStaffStockRows,
  staffStockListEmptyTitle,
  type StaffStockRow,
} from "./staffStockLogic";
import {
  STAFF_STOCK_DEFAULT_PERIOD,
  STAFF_STOCK_PERIOD_BADGE,
  STAFF_STOCK_PERIOD_SHEET_LABELS,
  STAFF_STOCK_PERIOD_SHEET_ORDER,
  STAFF_STOCK_PERIOD_SHEET_SUB,
} from "./staffStockPeriod";
import {
  stockRowDiffLabel,
  stockRowIsLowOrCritical,
  stockRowMetaLine,
  stockRowPhysicalLabel,
  stockRowSystemLabel,
} from "./staffStockRowMetrics";
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

function itemId(row: StaffStockRow): string {
  return String(row.id ?? "");
}

export function StaffStockPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const [tab, setTab] = useState<StaffStockTab>(() =>
    staffStockTabFromQuery(searchParams.get("tab")),
  );
  const [status, setStatus] = useState<StaffStockStatus>(() =>
    staffStockStatusFromQuery(searchParams.get("status")),
  );
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [period, setPeriod] = useState<HomePeriod>(STAFF_STOCK_DEFAULT_PERIOD);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [op, setOp] = useState<StaffStockOpFilters>(STAFF_STOCK_OP_FILTERS_EMPTY);
  const [draftOp, setDraftOp] = useState<StaffStockOpFilters>(
    STAFF_STOCK_OP_FILTERS_EMPTY,
  );
  const [allItems, setAllItems] = useState<StaffStockRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim());
    }, STAFF_STOCK_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
    setAllItems([]);
  }, [debounced, status, op, retryTick]);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      setLoadError("Not signed in");
      return;
    }
    let cancelled = false;
    const isFirst = page <= 1;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    setLoadError(null);

    void fetchStaffStockListPage(businessId, {
      page,
      perPage: STAFF_STOCK_PER_PAGE,
      status,
      q: debounced,
      sort: STAFF_STOCK_DEFAULT_SORT,
      op,
    })
      .then((res) => {
        if (cancelled) return;
        setTotal(res.total);
        setAllItems((prev) =>
          page <= 1 ? res.items : [...prev, ...res.items],
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof StaffStockNetworkError) {
          setLoadError(err.message);
        } else if (err instanceof StaffStockApiError) {
          setLoadError(err.detail);
        } else {
          setLoadError(STAFF_STOCK_LOAD_FAILED);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setLoadingMore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [businessId, page, debounced, status, op, retryTick]);

  const filterCount = countWarehouseActiveFilters(status, op);
  const displayRows = filterStaffStockRows(allItems, {
    status: "all",
    query: "",
    op: {
      ...STAFF_STOCK_OP_FILTERS_EMPTY,
      purchasedInPeriodOnly: op.purchasedInPeriodOnly,
    },
  });
  const emptyTitle =
    !loading && !loadError
      ? staffStockListEmptyTitle({
          itemCount: displayRows.length,
          status,
          query: debounced,
          advancedFilterCount: filterCount,
        })
      : null;
  const canLoadMore =
    !loading &&
    !loadingMore &&
    !loadError &&
    allItems.length < total &&
    allItems.length > 0;

  function openFilters(): void {
    setDraftOp(op);
    setFiltersOpen(true);
    setMoreOpen(false);
    setPeriodOpen(false);
  }

  function applyFilters(): void {
    setOp(draftOp);
    setFiltersOpen(false);
  }

  function clearAdvancedFilters(): void {
    setDraftOp(STAFF_STOCK_OP_FILTERS_EMPTY);
    setOp(STAFF_STOCK_OP_FILTERS_EMPTY);
    setStatus("all");
    setFiltersOpen(false);
  }

  function pickPeriod(p: HomePeriod): void {
    setPeriod(p);
    setPeriodOpen(false);
  }

  function openScan(): void {
    setMoreOpen(false);
    navigate(STAFF_STOCK_SCAN_PATH);
  }

  function openItem(row: StaffStockRow): void {
    const id = itemId(row);
    if (!id) return;
    navigate(`/catalog/item/${encodeURIComponent(id)}`);
  }

  function retryLoad(): void {
    setRetryTick((n) => n + 1);
  }

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
          <div className="staff-stock-appbar__actions" data-slot="actions">
            <button
              type="button"
              className="staff-stock-appbar__icon-btn"
              title={STAFF_STOCK_TOOLTIP_PERIOD}
              aria-label={STAFF_STOCK_TOOLTIP_PERIOD}
              data-action="period"
              onClick={() => {
                setPeriodOpen((v) => !v);
                setFiltersOpen(false);
                setMoreOpen(false);
              }}
            >
              ◷
              {period !== "allTime" ? (
                <span className="staff-stock-appbar__badge">
                  {STAFF_STOCK_PERIOD_BADGE[period]}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="staff-stock-appbar__icon-btn"
              title={STAFF_STOCK_TOOLTIP_FILTERS}
              aria-label={STAFF_STOCK_TOOLTIP_FILTERS}
              data-action="filters"
              onClick={openFilters}
            >
              ☰
              {filterCount > 0 ? (
                <span className="staff-stock-appbar__badge">{filterCount}</span>
              ) : null}
            </button>
            <button
              type="button"
              className="staff-stock-appbar__icon-btn"
              title={
                searchExpanded
                  ? STAFF_STOCK_TOOLTIP_HIDE_SEARCH
                  : STAFF_STOCK_TOOLTIP_SEARCH
              }
              aria-label={
                searchExpanded
                  ? STAFF_STOCK_TOOLTIP_HIDE_SEARCH
                  : STAFF_STOCK_TOOLTIP_SEARCH
              }
              data-action="search-toggle"
              onClick={() => {
                setSearchExpanded((v) => !v);
                setMoreOpen(false);
              }}
            >
              {searchExpanded ? "×" : "⌕"}
            </button>
            <div className="staff-stock-appbar__more-wrap">
              <button
                type="button"
                className="staff-stock-appbar__icon-btn"
                title="More"
                aria-label="More"
                data-action="more"
                onClick={() => {
                  setMoreOpen((v) => !v);
                  setPeriodOpen(false);
                  setFiltersOpen(false);
                }}
              >
                ⋮
              </button>
              {moreOpen ? (
                <div
                  className="staff-stock-more-menu"
                  data-slot="moreMenu"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    data-action="scan"
                    onClick={openScan}
                  >
                    {STAFF_STOCK_MENU_SCAN}
                  </button>
                  {/* Staff: no PDF/Excel/movement/add — stock_operational_top_bar */}
                </div>
              ) : null}
            </div>
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

      {periodOpen ? (
        <div
          className="staff-stock-sheet"
          data-slot="periodSheet"
          role="dialog"
          aria-label={STAFF_STOCK_PERIOD_SHEET_TITLE}
        >
          <div className="staff-stock-sheet__title">
            {STAFF_STOCK_PERIOD_SHEET_TITLE}
          </div>
          <ul className="staff-stock-sheet__list">
            {STAFF_STOCK_PERIOD_SHEET_ORDER.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  className={
                    period === key
                      ? "staff-stock-sheet__item staff-stock-sheet__item--active"
                      : "staff-stock-sheet__item"
                  }
                  data-period={key}
                  onClick={() => pickPeriod(key)}
                >
                  <span className="staff-stock-sheet__item-label">
                    {STAFF_STOCK_PERIOD_SHEET_LABELS[key]}
                  </span>
                  <span className="staff-stock-sheet__item-sub">
                    {STAFF_STOCK_PERIOD_SHEET_SUB[key]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="staff-stock-sheet__dismiss"
            onClick={() => setPeriodOpen(false)}
          >
            Close
          </button>
        </div>
      ) : null}

      {filtersOpen ? (
        <div
          className="staff-stock-sheet"
          data-slot="filterSheet"
          role="dialog"
          aria-label={STAFF_STOCK_FILTER_SHEET_TITLE}
        >
          <div className="staff-stock-sheet__title">
            {STAFF_STOCK_FILTER_SHEET_TITLE}
          </div>
          <label className="staff-stock-sheet__switch">
            <input
              type="checkbox"
              checked={draftOp.reorderOnly}
              onChange={(e) =>
                setDraftOp((o) => ({ ...o, reorderOnly: e.target.checked }))
              }
            />
            {STAFF_STOCK_FILTER_REORDER}
          </label>
          <label className="staff-stock-sheet__switch">
            <input
              type="checkbox"
              checked={draftOp.purchasedInPeriodOnly}
              onChange={(e) =>
                setDraftOp((o) => ({
                  ...o,
                  purchasedInPeriodOnly: e.target.checked,
                }))
              }
            />
            {STAFF_STOCK_FILTER_PURCHASED}
          </label>
          <label className="staff-stock-sheet__switch">
            <input
              type="checkbox"
              checked={draftOp.missingBarcodeOnly}
              onChange={(e) =>
                setDraftOp((o) => ({
                  ...o,
                  missingBarcodeOnly: e.target.checked,
                }))
              }
            />
            {STAFF_STOCK_FILTER_MISSING_BARCODE}
          </label>
          <label className="staff-stock-sheet__switch">
            <input
              type="checkbox"
              checked={draftOp.missingItemCodeOnly}
              onChange={(e) =>
                setDraftOp((o) => ({
                  ...o,
                  missingItemCodeOnly: e.target.checked,
                }))
              }
            />
            {STAFF_STOCK_FILTER_MISSING_CODE}
          </label>
          <div
            className="staff-stock-sheet__deferred"
            data-deferred="subcategory-supplier-pickers"
          />
          <div className="staff-stock-sheet__actions">
            <button type="button" onClick={clearAdvancedFilters}>
              {STAFF_STOCK_FILTER_CLEAR}
            </button>
            <button type="button" onClick={applyFilters}>
              {STAFF_STOCK_FILTER_APPLY}
            </button>
          </div>
        </div>
      ) : null}

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
            {searchExpanded ? (
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
            ) : (
              <div data-slot="search" hidden />
            )}
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
              {loading ? (
                <div className="staff-stock-results__empty" data-slot="loading">
                  {STAFF_STOCK_LOADING}
                </div>
              ) : null}
              {loadError && !loading ? (
                <div className="staff-stock-results__error" data-slot="error">
                  <div>{STAFF_STOCK_LOAD_FAILED}</div>
                  <div className="staff-stock-results__error-detail">
                    {loadError}
                  </div>
                  <button type="button" onClick={retryLoad}>
                    {STAFF_STOCK_RETRY}
                  </button>
                </div>
              ) : null}
              {!loading && !loadError && emptyTitle ? (
                <div className="staff-stock-results__empty" data-slot="empty">
                  {emptyTitle}
                </div>
              ) : null}
              {!loading && !loadError && displayRows.length > 0 ? (
                <div className="staff-stock-list" data-slot="list">
                  {displayRows.map((row, i) => {
                    const id = itemId(row);
                    const name = String(row.name ?? "").trim() || "—";
                    const low = stockRowIsLowOrCritical(row);
                    const diff = stockRowDiffLabel(row);
                    return (
                      <button
                        key={id || `row-${i}`}
                        type="button"
                        className={
                          low
                            ? "staff-stock-row staff-stock-row--low"
                            : "staff-stock-row"
                        }
                        data-slot="itemRow"
                        onClick={() => openItem(row)}
                      >
                        <div className="staff-stock-row__item">
                          <div className="staff-stock-row__name">{name}</div>
                          <div className="staff-stock-row__meta">
                            {stockRowMetaLine(row)}
                          </div>
                        </div>
                        <div className="staff-stock-row__metric">
                          {stockRowSystemLabel(row)}
                        </div>
                        <div className="staff-stock-row__metric">
                          {stockRowPhysicalLabel(row)}
                        </div>
                        <div
                          className={
                            diff.startsWith("-")
                              ? "staff-stock-row__metric staff-stock-row__metric--diff-neg"
                              : "staff-stock-row__metric"
                          }
                        >
                          {diff}
                        </div>
                      </button>
                    );
                  })}
                  {canLoadMore ? (
                    <button
                      type="button"
                      className="staff-stock-load-more"
                      data-action="load-more"
                      disabled={loadingMore}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {loadingMore ? STAFF_STOCK_LOADING : STAFF_STOCK_LOAD_MORE}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div
            className="staff-stock-activity"
            data-slot="activity"
            data-deferred="activity-feed"
          >
            {STAFF_STOCK_ACTIVITY_EMPTY}
          </div>
        )}
      </main>
    </div>
  );
}
