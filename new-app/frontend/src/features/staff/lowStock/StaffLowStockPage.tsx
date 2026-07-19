/**
 * Staff low stock `/staff/low-stock` — WIRE (Step 5).
 * Source: lowStockOperationsPageProvider / groupLowStockOperationItems /
 * _notifyOwner → notifyOwnerStockItem · _receive / export empty snack.
 * Deferred: PDF/CSV bytes · + Stock / reorder sheets · summary endpoint.
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import {
  fetchStaffLowStockOperations,
  notifyOwnerStockItem,
  STAFF_LS_DEFAULT_PERIOD,
  STAFF_LS_OPS_MAX_PER_PAGE,
} from "./staffLowStockApi";
import {
  STAFF_LS_BACK_FALLBACK,
  STAFF_LS_CSV_TOOLTIP,
  STAFF_LS_DEBOUNCE_MS,
  STAFF_LS_EXPORT_EMPTY,
  STAFF_LS_FILTER_ALL_SUBS,
  STAFF_LS_FILTER_APPLY,
  STAFF_LS_FILTER_CLEAR,
  STAFF_LS_FILTER_SEARCH_IN,
  STAFF_LS_FILTER_SHEET_SUB,
  STAFF_LS_FILTER_SHEET_TITLE,
  STAFF_LS_FILTER_SUBCATEGORY,
  STAFF_LS_FILTER_TOOLTIP,
  STAFF_LS_INFORM,
  STAFF_LS_INFORM_OWNER,
  STAFF_LS_ITEM_PROFILE,
  STAFF_LS_LOADING,
  STAFF_LS_MORE,
  STAFF_LS_OWNER_INFORMED,
  STAFF_LS_PDF_TOOLTIP,
  STAFF_LS_PLUS_STOCK,
  STAFF_LS_RECEIVE,
  STAFF_LS_RETRY,
  STAFF_LS_SEARCH_HINT,
  STAFF_LS_SENT,
  STAFF_LS_SET_REORDER,
  STAFF_LS_TAB_ALL,
  STAFF_LS_TAB_BOUGHT,
  STAFF_LS_TAB_DELIVERY,
  STAFF_LS_TAB_OUT,
  STAFF_LS_TAB_PENDING,
  STAFF_LS_TITLE,
  staffLsAttentionLine,
  staffLsItemPath,
  staffLsOwnerNotified,
  staffLsReceivePath,
} from "./staffLowStockCopy";
import {
  STAFF_LS_DEFAULT_SCOPE,
  STAFF_LS_SCOPE_ORDER,
  type StaffLsSearchScope,
} from "./staffLowStockFilters";
import {
  countFilteredItems,
  countLowStockForTab,
  filterLowStockGrouped,
  groupLowStockOperationItems,
  lowStockItemPendingDelivery,
  lowStockSubcategoryOptions,
  staffLsEmptyTitle,
  staffLsFiltersActive,
  STAFF_LS_SCOPE_LABEL,
  type StaffLsGrouped,
  type StaffLsItem,
} from "./staffLowStockLogic";
import {
  mapStaffLsLoadSubtitle,
  mapStaffLsLoadTitle,
} from "./staffLowStockLoadSubtitle";
import {
  formatStaffLsQtyDisplay,
  staffLsHumanId,
  staffLsItemId,
  staffLsItemName,
  staffLsItemUnit,
  staffLsStatusKind,
  staffLsStatusLabel,
  staffLsSubcategory,
  staffLsSystemQty,
} from "./staffLowStockRow";
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
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const [tab, setTab] = useState<StaffLsTab>(() =>
    staffLsTabFromFilter(searchParams.get("filter")),
  );
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchScope, setSearchScope] = useState<StaffLsSearchScope>(
    STAFF_LS_DEFAULT_SCOPE,
  );
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(
    null,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<StaffLsSearchScope>(
    STAFF_LS_DEFAULT_SCOPE,
  );
  const [draftSub, setDraftSub] = useState<string | null>(null);
  const [informedOwnerIds, setInformedOwnerIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [detailItem, setDetailItem] = useState<StaffLsItem | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(
    () => new Set(),
  );
  const [toast, setToast] = useState<string | null>(null);
  const [grouped, setGrouped] = useState<StaffLsGrouped>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim().toLowerCase());
    }, STAFF_LS_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      setGrouped({});
      setLoadError("Not signed in");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void fetchStaffLowStockOperations(businessId, {
      page: 1,
      perPage: STAFF_LS_OPS_MAX_PER_PAGE,
      period: STAFF_LS_DEFAULT_PERIOD,
    })
      .then((res) => {
        if (cancelled) return;
        setGrouped(groupLowStockOperationItems(res.items));
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setGrouped({});
        setLoadError(e);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, retryTick]);

  const filtered = filterLowStockGrouped({
    grouped,
    tab,
    searchQuery: debounced,
    searchScope,
    subcategoryFilter,
  });
  const itemCount = countFilteredItems(filtered);
  const emptyTitle =
    loading || loadError
      ? null
      : staffLsEmptyTitle({
          itemCount,
          query: debounced,
          subcategoryFilter,
        });
  const filtersActive = staffLsFiltersActive({
    searchScope,
    subcategoryFilter,
  });
  const subOptions = lowStockSubcategoryOptions(grouped);
  const errorTitle = mapStaffLsLoadTitle(loadError);
  const errorSubtitle = mapStaffLsLoadSubtitle(loadError);

  const counts: Record<StaffLsTab, number> = {
    allLow: countLowStockForTab(grouped, "allLow"),
    outOfStock: countLowStockForTab(grouped, "outOfStock"),
    purchasedInPeriod: countLowStockForTab(grouped, "purchasedInPeriod"),
    pendingOrder: countLowStockForTab(grouped, "pendingOrder"),
    pendingDelivery: countLowStockForTab(grouped, "pendingDelivery"),
  };

  function retryLoad(): void {
    setRetryTick((n) => n + 1);
  }

  function openFilters(): void {
    setDraftScope(searchScope);
    setDraftSub(subcategoryFilter);
    setFiltersOpen(true);
  }

  function applyFilters(): void {
    setSearchScope(draftScope);
    setSubcategoryFilter(draftSub);
    setFiltersOpen(false);
  }

  function clearFilters(): void {
    setSearchScope(STAFF_LS_DEFAULT_SCOPE);
    setSubcategoryFilter(null);
    setDraftScope(STAFF_LS_DEFAULT_SCOPE);
    setDraftSub(null);
    setFiltersOpen(false);
  }

  /** Flutter empty export snack — PDF/CSV bytes deferred. */
  function onExportPdf(): void {
    if (itemCount === 0) {
      setToast(STAFF_LS_EXPORT_EMPTY);
      return;
    }
    setToast(STAFF_LS_EXPORT_EMPTY);
  }

  function onExportCsv(): void {
    if (itemCount === 0) {
      setToast(STAFF_LS_EXPORT_EMPTY);
      return;
    }
    setToast(STAFF_LS_EXPORT_EMPTY);
  }

  /** Flutter _notifyOwner → POST notify-owner */
  function onNotifyOwner(item: StaffLsItem): void {
    const id = staffLsItemId(item);
    const name = staffLsItemName(item);
    if (!id || !businessId || notifyingId) return;
    setNotifyingId(id);
    void notifyOwnerStockItem(businessId, id, "reorder")
      .then(() => {
        setInformedOwnerIds((prev) => new Set(prev).add(id));
        setDetailItem(null);
        setToast(staffLsOwnerNotified(name));
      })
      .catch((e: unknown) => {
        setToast(mapStaffLsLoadSubtitle(e));
      })
      .finally(() => {
        setNotifyingId(null);
      });
  }

  function onReceive(item: StaffLsItem): void {
    setDetailItem(null);
    navigate(staffLsReceivePath(staffLsHumanId(item)));
  }

  function openItemProfile(item: StaffLsItem): void {
    const id = staffLsItemId(item);
    setDetailItem(null);
    if (!id) return;
    navigate(staffLsItemPath(id));
  }

  function openDetails(item: StaffLsItem): void {
    setDetailItem(item);
  }

  function toggleCat(cat: string): void {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function renderCompactRow(item: StaffLsItem, serial: number) {
    const id = staffLsItemId(item);
    const kind = staffLsStatusKind(item);
    const informed = id ? informedOwnerIds.has(id) : false;
    const unit = staffLsItemUnit(item);
    const qty = formatStaffLsQtyDisplay(unit, staffLsSystemQty(item));
    const sub = staffLsSubcategory(item);
    return (
      <div
        key={id || `row-${serial}`}
        className="staff-ls-row"
        data-slot="compactRow"
        data-action="open-details"
        role="button"
        tabIndex={0}
        onClick={() => openDetails(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDetails(item);
          }
        }}
      >
        <span className="staff-ls-row__serial">{serial}</span>
        <span
          className={`staff-ls-row__bar staff-ls-row__bar--${kind}`}
          aria-hidden="true"
        />
        <div className="staff-ls-row__body">
          <div className="staff-ls-row__name">{staffLsItemName(item)}</div>
          <div className="staff-ls-row__meta">
            <span className="staff-ls-row__qty">{qty}</span>
            <span className={`staff-ls-status staff-ls-status--${kind}`}>
              {staffLsStatusLabel(kind)}
            </span>
          </div>
          {sub ? <div className="staff-ls-row__sub">{sub}</div> : null}
        </div>
        <button
          type="button"
          className={
            informed
              ? "staff-ls-row__inform staff-ls-row__inform--sent"
              : "staff-ls-row__inform staff-ls-row__inform--active"
          }
          data-action="inform-owner"
          disabled={informed || notifyingId === id}
          onClick={(e) => {
            e.stopPropagation();
            onNotifyOwner(item);
          }}
        >
          {informed ? STAFF_LS_SENT : STAFF_LS_INFORM}
        </button>
        <button
          type="button"
          className="staff-ls-row__more"
          aria-label={STAFF_LS_MORE}
          data-action="more-details"
          onClick={(e) => {
            e.stopPropagation();
            openDetails(item);
          }}
        >
          ⋮
        </button>
      </div>
    );
  }

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
              className="staff-ls-appbar__action staff-ls-appbar__action--active"
              title={STAFF_LS_PDF_TOOLTIP}
              aria-label={STAFF_LS_PDF_TOOLTIP}
              data-action="export-pdf"
              data-deferred="pdf-bytes"
              onClick={onExportPdf}
            >
              PDF
            </button>
            <button
              type="button"
              className="staff-ls-appbar__action staff-ls-appbar__action--active"
              title={STAFF_LS_CSV_TOOLTIP}
              aria-label={STAFF_LS_CSV_TOOLTIP}
              data-action="export-csv"
              data-deferred="csv-bytes"
              onClick={onExportCsv}
            >
              CSV
            </button>
          </div>
        </div>

        <div className="staff-ls-appbar__bottom" data-slot="appBarBottom">
          <div
            className="staff-ls-search-row staff-ls-search--active"
            data-slot="search"
          >
            <input
              className="staff-ls-search__input staff-ls-search__input--active"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={STAFF_LS_SEARCH_HINT}
              aria-label={STAFF_LS_SEARCH_HINT}
            />
            {query.trim().length > 0 ? (
              <button
                type="button"
                className="staff-ls-search__clear"
                aria-label="Clear"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            ) : null}
            <button
              type="button"
              className={
                filtersActive
                  ? "staff-ls-filter-btn staff-ls-filter-btn--active"
                  : "staff-ls-filter-btn"
              }
              title={STAFF_LS_FILTER_TOOLTIP}
              aria-label={STAFF_LS_FILTER_TOOLTIP}
              data-slot="filterButton"
              data-testid="staff-ls-filter"
              onClick={openFilters}
            >
              ⚙
            </button>
          </div>

          {subcategoryFilter && subcategoryFilter.trim() ? (
            <div className="staff-ls-subchip-row" data-slot="subcategoryChip">
              <button
                type="button"
                className="staff-ls-subchip"
                onClick={() => setSubcategoryFilter(null)}
              >
                {subcategoryFilter} ×
              </button>
            </div>
          ) : null}

          <p className="staff-ls-attention" data-slot="attention">
            {staffLsAttentionLine(counts.allLow)}
          </p>

          <div
            className="staff-ls-tabs staff-ls-tabs--active"
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
          {loading ? (
            <div
              className="staff-ls-results__loading"
              data-slot="loading"
              data-testid="staff-ls-loading"
              aria-busy="true"
            >
              {STAFF_LS_LOADING}
            </div>
          ) : null}

          {loadError && !loading ? (
            <div
              className="staff-ls-results__error"
              data-slot="error"
              data-testid="staff-ls-error"
              role="alert"
            >
              <p className="staff-ls-results__error-title">{errorTitle}</p>
              <p className="staff-ls-results__error-sub">{errorSubtitle}</p>
              <button
                type="button"
                className="staff-ls-results__retry"
                data-action="retry"
                onClick={retryLoad}
              >
                {STAFF_LS_RETRY}
              </button>
            </div>
          ) : null}

          {!loading && !loadError && emptyTitle ? (
            <div className="staff-ls-results__empty" data-slot="empty">
              {emptyTitle}
            </div>
          ) : null}

          {!loading && !loadError && itemCount > 0 ? (
            <div className="staff-ls-tree" data-slot="tree">
              {Object.entries(filtered).map(([cat, subMap]) => {
                const catItems = Object.values(subMap).flat();
                const open = !collapsedCats.has(cat);
                return (
                  <div
                    key={cat}
                    className="staff-ls-category"
                    data-slot="categoryCard"
                  >
                    <button
                      type="button"
                      className="staff-ls-category__header"
                      data-action="toggle-category"
                      onClick={() => toggleCat(cat)}
                    >
                      <span className="staff-ls-category__title">{cat}</span>
                      <span className="staff-ls-category__count staff-ls-category__count--critical">
                        {catItems.length}
                      </span>
                    </button>
                    {open
                      ? catItems.map((item, i) =>
                          renderCompactRow(item, i + 1),
                        )
                      : null}
                  </div>
                );
              })}
            </div>
          ) : (
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
                  </div>
                  <button
                    type="button"
                    className="staff-ls-row__inform"
                    data-action="inform-owner"
                    data-deferred="inform-owner-sample"
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
                    data-action="inform-owner"
                    data-deferred="inform-owner-sample"
                    disabled
                  >
                    {STAFF_LS_INFORM}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {toast ? (
        <div className="staff-ls-toast" data-slot="toast" role="status">
          {toast}
        </div>
      ) : null}

      {detailItem ? (
        <div
          className="staff-ls-detail"
          data-slot="detailSheet"
          role="dialog"
          aria-label={staffLsItemName(detailItem)}
        >
          <div className="staff-ls-detail__panel">
            <h2 className="staff-ls-detail__title">
              {staffLsItemName(detailItem)}
            </h2>
            <p className="staff-ls-detail__meta">
              {formatStaffLsQtyDisplay(
                staffLsItemUnit(detailItem),
                staffLsSystemQty(detailItem),
              )}{" "}
              · {staffLsStatusLabel(staffLsStatusKind(detailItem))}
            </p>
            <button
              type="button"
              className="staff-ls-detail__primary"
              data-action="inform-owner"
              disabled={
                !!notifyingId ||
                (!!staffLsItemId(detailItem) &&
                  informedOwnerIds.has(staffLsItemId(detailItem)))
              }
              onClick={() => onNotifyOwner(detailItem)}
            >
              {staffLsItemId(detailItem) &&
              informedOwnerIds.has(staffLsItemId(detailItem))
                ? STAFF_LS_OWNER_INFORMED
                : STAFF_LS_INFORM_OWNER}
            </button>
            {lowStockItemPendingDelivery(detailItem) ? (
              <button
                type="button"
                className="staff-ls-detail__link"
                data-action="receive"
                onClick={() => onReceive(detailItem)}
              >
                {STAFF_LS_RECEIVE}
              </button>
            ) : null}
            <button
              type="button"
              className="staff-ls-detail__link"
              data-action="item-profile"
              onClick={() => openItemProfile(detailItem)}
            >
              {STAFF_LS_ITEM_PROFILE}
            </button>
            <button
              type="button"
              className="staff-ls-detail__link"
              data-deferred="plus-stock"
              disabled
            >
              {STAFF_LS_PLUS_STOCK}
            </button>
            <button
              type="button"
              className="staff-ls-detail__link"
              data-deferred="set-reorder"
              disabled
            >
              {STAFF_LS_SET_REORDER}
            </button>
            <button
              type="button"
              className="staff-ls-detail__close"
              onClick={() => setDetailItem(null)}
            >
              Close
            </button>
          </div>
          <button
            type="button"
            className="staff-ls-detail__backdrop"
            aria-label="Close"
            onClick={() => setDetailItem(null)}
          />
        </div>
      ) : null}

      {filtersOpen ? (
        <div
          className="staff-ls-sheet"
          data-slot="filterSheet"
          role="dialog"
          aria-label={STAFF_LS_FILTER_SHEET_TITLE}
        >
          <div className="staff-ls-sheet__panel">
            <h2 className="staff-ls-sheet__title">
              {STAFF_LS_FILTER_SHEET_TITLE}
            </h2>
            <p className="staff-ls-sheet__sub">{STAFF_LS_FILTER_SHEET_SUB}</p>
            <p className="staff-ls-sheet__label">{STAFF_LS_FILTER_SEARCH_IN}</p>
            <div className="staff-ls-sheet__scopes" data-slot="searchScopes">
              {STAFF_LS_SCOPE_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={
                    draftScope === key
                      ? "staff-ls-scope staff-ls-scope--selected"
                      : "staff-ls-scope"
                  }
                  onClick={() => setDraftScope(key)}
                >
                  {STAFF_LS_SCOPE_LABEL[key]}
                </button>
              ))}
            </div>
            {subOptions.length > 1 ? (
              <>
                <p className="staff-ls-sheet__label">
                  {STAFF_LS_FILTER_SUBCATEGORY}
                </p>
                <select
                  className="staff-ls-sheet__select"
                  value={draftSub ?? ""}
                  onChange={(e) =>
                    setDraftSub(e.target.value === "" ? null : e.target.value)
                  }
                  aria-label={STAFF_LS_FILTER_SUBCATEGORY}
                >
                  <option value="">{STAFF_LS_FILTER_ALL_SUBS}</option>
                  {subOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
            <button
              type="button"
              className="staff-ls-sheet__apply"
              data-testid="staff-ls-filter-apply"
              onClick={applyFilters}
            >
              {STAFF_LS_FILTER_APPLY}
            </button>
            {filtersActive ||
            draftScope !== STAFF_LS_DEFAULT_SCOPE ||
            draftSub ? (
              <button
                type="button"
                className="staff-ls-sheet__clear"
                data-testid="staff-ls-filter-clear"
                onClick={clearFilters}
              >
                {STAFF_LS_FILTER_CLEAR}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="staff-ls-sheet__backdrop"
            aria-label="Close"
            onClick={() => setFiltersOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
