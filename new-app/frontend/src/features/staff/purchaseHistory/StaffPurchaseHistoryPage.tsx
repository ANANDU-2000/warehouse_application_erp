/**
 * Staff purchase history `/staff/purchase-history` — STATES (Step 6).
 * Source: staff_purchase_history_page.dart ListSkeleton / FriendlyLoadError /
 * RefreshIndicator; staffTradePurchasesHistoryProvider keepAlive 2m.
 * Deferred: full pack · delivery badge · detail body · staff ₹ redact.
 */
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import {
  fetchStaffPhLowStock,
  fetchStaffPhPurchases,
  StaffPhApiError,
  StaffPhNetworkError,
} from "./staffPurchaseHistoryApi";
import {
  STAFF_PH_BACK_FALLBACK,
  STAFF_PH_CACHE_TTL_MS,
  STAFF_PH_DEBOUNCE_MS,
  STAFF_PH_INFORM_OWNER,
  STAFF_PH_LOW_ALL,
  STAFF_PH_LOW_CRITICAL,
  STAFF_PH_LOW_STOCK_PATH,
  STAFF_PH_RETRY,
  STAFF_PH_SEARCH_HINT,
  STAFF_PH_SEARCH_HINT_LOW,
  STAFF_PH_SKELETON_LOW_HEIGHT_PX,
  STAFF_PH_SKELETON_LOW_ROWS,
  STAFF_PH_SKELETON_PURCHASE_HEIGHT_PX,
  STAFF_PH_SKELETON_PURCHASE_ROWS,
  STAFF_PH_STATUS_ALL,
  STAFF_PH_STATUS_DELIVERED,
  STAFF_PH_STATUS_UNDELIVERED,
  STAFF_PH_TAB_ALL,
  STAFF_PH_TAB_LOW,
  STAFF_PH_TAB_TODAY,
  STAFF_PH_TAB_WEEK,
  STAFF_PH_TITLE,
  staffPhDetailPath,
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
  buildGroupedPurchaseHistory,
  purchaseBrokerName,
  purchaseHistoryItemHeadline,
  purchaseHumanId,
  purchaseIdOf,
  purchaseStatusChipMod,
  purchaseStatusLabel,
  purchaseSupplierLabel,
} from "./staffPurchaseHistoryGrouping";
import {
  filterStaffPhLowStock,
  filterStaffPhPurchases,
  lowStockIsCritical,
  lowStockMetaLine,
  lowStockName,
  staffPhLowEmptyTitle,
  staffPhPurchasesEmptyTitle,
  type StaffPhLowStockRow,
  type StaffPhPurchaseRow,
} from "./staffPurchaseHistoryLogic";
import {
  mapStaffPhLoadSubtitle,
  mapStaffPhLoadTitle,
} from "./staffPurchaseHistoryLoadSubtitle";
import {
  staffPhTabToPeriod,
  type StaffPhPeriod,
} from "./staffPurchaseHistoryPeriod";
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

const STATUS_CHIP_MOD: Record<StaffPhStatusFilter, string> = {
  all: "staff-ph-chip--all",
  pending: "staff-ph-chip--pending",
  delivered: "staff-ph-chip--delivered",
};

const LOW_LABEL: Record<StaffPhLowFilter, string> = {
  all: STAFF_PH_LOW_ALL,
  critical: STAFF_PH_LOW_CRITICAL,
};

const LOW_CHIP_MOD: Record<StaffPhLowFilter, string> = {
  all: "staff-ph-chip--low-all",
  critical: "staff-ph-chip--critical",
};

type PhPurchasesCache = { at: number; rows: StaffPhPurchaseRow[] };
type PhLowCache = { at: number; rows: StaffPhLowStockRow[] };

/** Flutter keepAlive 2m — keyed by business + period / low. */
const purchasesCache = new Map<string, PhPurchasesCache>();
const lowStockCache = new Map<string, PhLowCache>();

function purchasesCacheKey(businessId: string, period: StaffPhPeriod): string {
  return `${businessId}|${period}`;
}

function lowCacheKey(businessId: string): string {
  return businessId;
}

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
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const [tab, setTab] = useState<StaffPhTab>(() =>
    staffPhTabFromQuery(searchParams.get("tab")),
  );
  const [status, setStatus] = useState<StaffPhStatusFilter>(
    STAFF_PH_DEFAULT_STATUS,
  );
  const [lowFilter, setLowFilter] = useState<StaffPhLowFilter>(
    STAFF_PH_DEFAULT_LOW,
  );
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [purchases, setPurchases] = useState<StaffPhPurchaseRow[]>([]);
  const [lowRows, setLowRows] = useState<StaffPhLowStockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const pullStartY = useRef<number | null>(null);

  const isLow = tab === "lowStock";
  const period = staffPhTabToPeriod(tab);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim().toLowerCase());
    }, STAFF_PH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setHasLoadedOnce(false);
    setLoadError(null);
    setLoading(true);
  }, [tab, period, isLow, retryTick]);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      setLoadError("Not signed in");
      setPurchases([]);
      setLowRows([]);
      setHasLoadedOnce(true);
      return;
    }
    let cancelled = false;

    /** Serve keepAlive cache when not an explicit retry. */
    if (retryTick === 0) {
      const lowCached = lowStockCache.get(lowCacheKey(businessId));
      if (lowCached && Date.now() - lowCached.at < STAFF_PH_CACHE_TTL_MS) {
        setLowRows(lowCached.rows);
      }
      if (!isLow && period) {
        const pCached = purchasesCache.get(
          purchasesCacheKey(businessId, period),
        );
        if (pCached && Date.now() - pCached.at < STAFF_PH_CACHE_TTL_MS) {
          setPurchases(pCached.rows);
          setLoading(false);
          setLoadError(null);
          setHasLoadedOnce(true);
          return;
        }
      } else if (isLow) {
        const lowHit = lowStockCache.get(lowCacheKey(businessId));
        if (lowHit && Date.now() - lowHit.at < STAFF_PH_CACHE_TTL_MS) {
          setLowRows(lowHit.rows);
          setLoading(false);
          setLoadError(null);
          setHasLoadedOnce(true);
          return;
        }
      }
    }

    setLoading(true);
    setLoadError(null);

    const lowP = fetchStaffPhLowStock(businessId).then(
      (rows) => {
        if (!cancelled) {
          setLowRows(rows);
          lowStockCache.set(lowCacheKey(businessId), {
            at: Date.now(),
            rows,
          });
        }
        return null as unknown;
      },
      (err: unknown) => err,
    );

    const purchaseP = !isLow
      ? fetchStaffPhPurchases(businessId, period ?? "allTime").then(
          (rows) => {
            if (!cancelled) {
              setPurchases(rows);
              if (period) {
                purchasesCache.set(purchasesCacheKey(businessId, period), {
                  at: Date.now(),
                  rows,
                });
              }
            }
            return null as unknown;
          },
          (err: unknown) => err,
        )
      : Promise.resolve().then(() => {
          if (!cancelled) setPurchases([]);
          return null as unknown;
        });

    void Promise.all([lowP, purchaseP]).then(([lowErr, purchaseErr]) => {
      if (cancelled) return;
      if (isLow && lowErr != null) {
        setLowRows([]);
        setLoadError(
          lowErr instanceof StaffPhNetworkError ||
            lowErr instanceof StaffPhApiError
            ? lowErr
            : lowErr,
        );
      } else if (!isLow && purchaseErr != null) {
        setPurchases([]);
        setLoadError(
          purchaseErr instanceof StaffPhNetworkError ||
            purchaseErr instanceof StaffPhApiError
            ? purchaseErr
            : purchaseErr,
        );
      } else {
        setLoadError(null);
      }
      setHasLoadedOnce(true);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [businessId, tab, period, isLow, retryTick]);

  const filteredPurchases = filterStaffPhPurchases(purchases, {
    status,
    query: debounced,
  });
  const filteredLow = filterStaffPhLowStock(lowRows, {
    low: lowFilter,
    query: debounced,
  });
  const grouped = buildGroupedPurchaseHistory(filteredPurchases);

  /** Flutter: Expanded only — AppBar/search/chips stay; list area skeleton/error. */
  const showInitialSkeleton =
    loading &&
    loadError == null &&
    (isLow ? lowRows.length === 0 : purchases.length === 0);
  const showError =
    loadError != null &&
    (isLow ? lowRows.length === 0 : purchases.length === 0);
  const showListData =
    !showInitialSkeleton &&
    !showError &&
    (hasLoadedOnce ||
      (isLow ? lowRows.length > 0 : purchases.length > 0));
  const errorTitle = mapStaffPhLoadTitle(loadError, { isLow });
  const errorSubtitle = mapStaffPhLoadSubtitle(loadError);

  const emptyTitle =
    showListData && !loading && !loadError
      ? isLow
        ? staffPhLowEmptyTitle({
            itemCount: filteredLow.length,
            query: debounced,
          })
        : staffPhPurchasesEmptyTitle({
            itemCount: filteredPurchases.length,
            query: debounced,
          })
      : null;

  function openPurchase(row: StaffPhPurchaseRow): void {
    const id = purchaseIdOf(row);
    if (!id) return;
    navigate(staffPhDetailPath(id));
  }

  function openLowStock(): void {
    navigate(STAFF_PH_LOW_STOCK_PATH);
  }

  function retryLoad(): void {
    if (businessId) {
      lowStockCache.delete(lowCacheKey(businessId));
      if (period) {
        purchasesCache.delete(purchasesCacheKey(businessId, period));
      }
    }
    setRetryTick((n) => n + 1);
  }

  /** RefreshIndicator — purchases list only (Flutter). */
  function onPullTouchStart(e: TouchEvent): void {
    if (isLow) return;
    pullStartY.current = e.touches[0]?.clientY ?? null;
  }

  function onPullTouchEnd(e: TouchEvent): void {
    if (isLow) return;
    const start = pullStartY.current;
    pullStartY.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientY ?? start;
    if (end - start > 72) retryLoad();
  }

  const skeletonRows = isLow
    ? STAFF_PH_SKELETON_LOW_ROWS
    : STAFF_PH_SKELETON_PURCHASE_ROWS;
  const skeletonHeight = isLow
    ? STAFF_PH_SKELETON_LOW_HEIGHT_PX
    : STAFF_PH_SKELETON_PURCHASE_HEIGHT_PX;

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
          className="staff-ph-tabs staff-ph-tabs--active"
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
              onClick={() => setTab(key)}
            >
              {key === "lowStock" && lowRows.length > 0
                ? `${TAB_LABEL[key]} (${lowRows.length})`
                : TAB_LABEL[key]}
            </button>
          ))}
        </div>
      </header>

      <main className="staff-ph-body" data-slot="body">
        <div
          className="staff-ph-search staff-ph-search--active"
          data-slot="search"
        >
          <input
            className="staff-ph-search__input staff-ph-search__input--active"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isLow ? STAFF_PH_SEARCH_HINT_LOW : STAFF_PH_SEARCH_HINT}
            aria-label={isLow ? STAFF_PH_SEARCH_HINT_LOW : STAFF_PH_SEARCH_HINT}
          />
          {query.trim().length > 0 ? (
            <button
              type="button"
              className="staff-ph-search__clear"
              aria-label="Clear"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          ) : null}
        </div>

        {!isLow ? (
          <div
            className="staff-ph-chips staff-ph-chips--active"
            data-slot="statusChips"
          >
            {STAFF_PH_STATUS_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className={[
                  "staff-ph-chip",
                  STATUS_CHIP_MOD[key],
                  status === key ? "staff-ph-chip--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setStatus(key)}
              >
                {STATUS_LABEL[key]}
              </button>
            ))}
          </div>
        ) : (
          <div
            className="staff-ph-chips staff-ph-chips--active"
            data-slot="lowStockChips"
          >
            {STAFF_PH_LOW_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className={[
                  "staff-ph-chip",
                  LOW_CHIP_MOD[key],
                  lowFilter === key ? "staff-ph-chip--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setLowFilter(key)}
              >
                {LOW_LABEL[key]}
              </button>
            ))}
          </div>
        )}

        <div
          className="staff-ph-results"
          data-slot="results"
          onTouchStart={onPullTouchStart}
          onTouchEnd={onPullTouchEnd}
        >
          {showInitialSkeleton ? (
            <div
              className="staff-ph-skeleton"
              data-slot="loading"
              data-testid="staff-ph-loading"
              aria-label="ListSkeleton"
            >
              {Array.from({ length: skeletonRows }, (_, i) => (
                <div
                  key={i}
                  className="staff-ph-skeleton__row"
                  style={{ height: skeletonHeight }}
                />
              ))}
            </div>
          ) : null}

          {showError ? (
            <div
              className="staff-ph-friendly-error"
              data-slot="error"
              data-testid="staff-ph-error"
              role="alert"
            >
              <div
                className="staff-ph-friendly-error__icon"
                aria-hidden="true"
              >
                !
              </div>
              <p className="staff-ph-friendly-error__title">{errorTitle}</p>
              <p className="staff-ph-friendly-error__sub">{errorSubtitle}</p>
              <button
                type="button"
                className="staff-ph-friendly-error__retry"
                data-testid="staff-ph-retry"
                onClick={retryLoad}
              >
                {STAFF_PH_RETRY}
              </button>
            </div>
          ) : null}

          {emptyTitle ? (
            <div className="staff-ph-results__empty" data-slot="empty">
              {emptyTitle}
            </div>
          ) : null}

          {showListData &&
          !loading &&
          !loadError &&
          !isLow &&
          filteredPurchases.length > 0 ? (
            <div className="staff-ph-list" data-slot="list">
              {grouped.map((entry, i) => {
                if (entry.kind === "header") {
                  return (
                    <div
                      key={`h-${entry.label}-${i}`}
                      className="staff-ph-date-header"
                      data-slot="dateHeader"
                    >
                      {entry.label}
                    </div>
                  );
                }
                const row = entry.purchase;
                const id = purchaseIdOf(row);
                const headline = purchaseHistoryItemHeadline(row);
                const broker = purchaseBrokerName(row);
                const humanId = purchaseHumanId(row);
                return (
                  <button
                    key={id || `p-${i}`}
                    type="button"
                    className="staff-ph-row"
                    data-slot="purchaseRow"
                    data-action="open-purchase"
                    onClick={() => openPurchase(row)}
                  >
                    <div className="staff-ph-row__supplier">
                      {purchaseSupplierLabel(row)}
                    </div>
                    {headline ? (
                      <div className="staff-ph-row__headline">{headline}</div>
                    ) : null}
                    <div className="staff-ph-row__meta">
                      <span data-deferred="pack-summary" />
                      {humanId ? <span>{humanId}</span> : null}
                      {broker ? (
                        <>
                          <span className="staff-ph-row__dot">·</span>
                          <span>{broker}</span>
                        </>
                      ) : null}
                    </div>
                    <div className="staff-ph-row__badges">
                      <span
                        className={`staff-ph-status-chip ${purchaseStatusChipMod(row)}`}
                      >
                        {purchaseStatusLabel(row)}
                      </span>
                      <span data-deferred="delivery-badge" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {showListData &&
          !loading &&
          !loadError &&
          isLow &&
          filteredLow.length > 0 ? (
            <div className="staff-ph-list" data-slot="list">
              {filteredLow.map((item, i) => {
                const critical = lowStockIsCritical(item);
                return (
                  <div
                    key={String(item.id ?? i)}
                    className="staff-ph-low-row"
                    data-slot="lowStockRow"
                    role="button"
                    tabIndex={0}
                    onClick={openLowStock}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLowStock();
                      }
                    }}
                  >
                    <span
                      className={
                        critical
                          ? "staff-ph-low-row__icon staff-ph-low-row__icon--critical"
                          : "staff-ph-low-row__icon"
                      }
                      aria-hidden="true"
                    >
                      {critical ? "!" : "⚠"}
                    </span>
                    <div className="staff-ph-low-row__body">
                      <div className="staff-ph-low-row__name">
                        {lowStockName(item)}
                      </div>
                      <div className="staff-ph-low-row__meta">
                        {lowStockMetaLine(item)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="staff-ph-low-row__inform"
                      data-action="inform-owner"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLowStock();
                      }}
                    >
                      {STAFF_PH_INFORM_OWNER}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {emptyTitle && showListData ? (
            <div
              className="staff-ph-list"
              data-slot="list"
              data-deferred="purchase-rows"
              hidden
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
