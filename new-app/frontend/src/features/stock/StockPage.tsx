/**
 * Owner stock `/stock` — STAGE 2 FIELDS: inputs + client validation.
 * Source: stock_page.dart; stock_status_quick_chips.dart; stock_inline_search_bar.dart;
 *         stock_delivery_filter_chips.dart; operational_stock_filter_sheet.dart.
 * Deferred: API wire, CTA handlers, skeleton/error/empty states.
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import type { HomePeriod } from "../../home/homePeriod";
import {
  STOCK_BACK_HOME,
  STOCK_DEBOUNCE_MS,
  STOCK_FILTER_APPLY,
  STOCK_FILTER_CLEAR,
  STOCK_FILTER_MISSING_BARCODE,
  STOCK_FILTER_MISSING_CODE,
  STOCK_FILTER_PURCHASED,
  STOCK_FILTER_REORDER,
  STOCK_FILTER_SHEET_TITLE,
  STOCK_HDR_DIFF,
  STOCK_HDR_ITEM,
  STOCK_HDR_PHYS,
  STOCK_HDR_SYS,
  STOCK_SEARCH_HINT,
  STOCK_STATUS_ALL,
  STOCK_STATUS_LOW,
  STOCK_STATUS_OUT,
  STOCK_TAB_LABEL,
  STOCK_TITLE,
  STOCK_TOOLTIP_FILTERS,
  STOCK_TOOLTIP_HIDE_SEARCH,
  STOCK_TOOLTIP_PERIOD,
  STOCK_TOOLTIP_SEARCH,
} from "./stockCopy";
import {
  STOCK_DELIVERY_COUNTS_EMPTY,
  STOCK_DELIVERY_FILTER_LABELS,
  STOCK_DELIVERY_FILTER_ORDER,
  type StockDeliveryCounts,
  type StockDeliveryFilter,
} from "./stockDeliveryFilter";
import {
  STOCK_OP_FILTERS_EMPTY,
  countWarehouseActiveFilters,
  type StockOpFilters,
} from "./stockFilters";
import {
  STOCK_DEFAULT_PERIOD,
  STOCK_PERIOD_BADGE,
  STOCK_PERIOD_SHEET_LABELS,
  STOCK_PERIOD_SHEET_ORDER,
  STOCK_PERIOD_SHEET_SUB,
} from "./stockPeriod";
import { stockStatusFromQuery, type StockStatus } from "./stockStatus";
import { stockTabFromQuery, type StockTab } from "./stockTabs";
import "./StockPage.css";

const STATUS_CHIP_MOD: Record<StockStatus, string> = {
  all: "owner-stock-chip--all",
  shortage: "owner-stock-chip--low",
  out: "owner-stock-chip--out",
};

export function StockPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";

  /* ─── Tab / Status / Period ─── */
  const [tab, setTab] = useState<StockTab>(() =>
    stockTabFromQuery(searchParams.get("tab")),
  );
  const [status, setStatus] = useState<StockStatus>(() =>
    stockStatusFromQuery(searchParams.get("status")),
  );
  const [period, setPeriod] = useState<HomePeriod>(STOCK_DEFAULT_PERIOD);
  const [periodOpen, setPeriodOpen] = useState(false);

  /* ─── Search ─── */
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim());
    }, STOCK_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  /* ─── Delivery filter ─── */
  const [deliveryFilter, setDeliveryFilter] =
    useState<StockDeliveryFilter>("all");

  /* ─── Advanced filters ─── */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [op, setOp] = useState<StockOpFilters>(STOCK_OP_FILTERS_EMPTY);
  const [draftOp, setDraftOp] = useState<StockOpFilters>(
    STOCK_OP_FILTERS_EMPTY,
  );

  /* ─── Subcategory / Supplier pickers (text draft for sheet) ─── */
  const [draftSubcategory, setDraftSubcategory] = useState("");
  const [draftSupplier, setDraftSupplier] = useState("");
  const [draftUnit, setDraftUnit] = useState("");
  const [draftSort, setDraftSort] = useState("recent");

  /* ─── Delivery counts (placeholder — will be wired in WIRE stage) ─── */
  const [deliveryCounts] = useState<StockDeliveryCounts>(
    STOCK_DELIVERY_COUNTS_EMPTY,
  );

  /* ─── Status counts (placeholder — will be wired in WIRE stage) ─── */
  const [statusCounts] = useState<Record<string, number>>({
    all: 0,
    low: 0,
    critical: 0,
    out: 0,
  });

  /* ─── Filter count ─── */
  const filterCount = countWarehouseActiveFilters(status, op);

  /* ─── Period sheet handlers ─── */
  function pickPeriod(p: HomePeriod): void {
    setPeriod(p);
    setPeriodOpen(false);
  }

  /* ─── Filter sheet handlers ─── */
  function openFilters(): void {
    setDraftOp(op);
    setDraftSubcategory(op.subcategory);
    setDraftSupplier(op.supplier);
    setDraftUnit(op.unit);
    setDraftSort("recent");
    setFiltersOpen(true);
    setPeriodOpen(false);
  }

  function applyFilters(): void {
    setOp({
      ...draftOp,
      subcategory: draftSubcategory.trim(),
      supplier: draftSupplier.trim(),
      unit: draftUnit.trim(),
    });
    setFiltersOpen(false);
  }

  function clearAdvancedFilters(): void {
    setDraftOp(STOCK_OP_FILTERS_EMPTY);
    setOp(STOCK_OP_FILTERS_EMPTY);
    setStatus("all");
    setDraftSubcategory("");
    setDraftSupplier("");
    setDraftUnit("");
    setDraftSort("recent");
    setFiltersOpen(false);
  }

  /* ─── Delivery chip count helper ─── */
  const lowCount = (statusCounts["low"] ?? 0) + (statusCounts["critical"] ?? 0);

  return (
    <div
      className="owner-stock-page"
      data-page="owner-stock"
      data-business-id={businessId || undefined}
    >
      {/* ─── App bar ─── */}
      <header className="owner-stock-appbar" data-slot="appBar">
        <div className="owner-stock-appbar__row">
          <button
            type="button"
            className="owner-stock-appbar__back"
            aria-label="Home"
            onClick={() => navigate(STOCK_BACK_HOME)}
          >
            ←
          </button>
          <h1 className="owner-stock-appbar__title">{STOCK_TITLE}</h1>
          <div className="owner-stock-appbar__actions" data-slot="actions">
            <button
              type="button"
              className="owner-stock-appbar__icon-btn"
              title={STOCK_TOOLTIP_PERIOD}
              aria-label={STOCK_TOOLTIP_PERIOD}
              data-action="period"
              onClick={() => {
                setPeriodOpen((v) => !v);
                setFiltersOpen(false);
              }}
            >
              ◷
              {period !== "allTime" ? (
                <span className="owner-stock-appbar__badge">
                  {STOCK_PERIOD_BADGE[period]}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="owner-stock-appbar__icon-btn"
              title={STOCK_TOOLTIP_FILTERS}
              aria-label={STOCK_TOOLTIP_FILTERS}
              data-action="filters"
              onClick={openFilters}
            >
              ☰
              {filterCount > 0 ? (
                <span className="owner-stock-appbar__badge">{filterCount}</span>
              ) : null}
            </button>
            <button
              type="button"
              className="owner-stock-appbar__icon-btn"
              title={
                searchExpanded
                  ? STOCK_TOOLTIP_HIDE_SEARCH
                  : STOCK_TOOLTIP_SEARCH
              }
              aria-label={
                searchExpanded
                  ? STOCK_TOOLTIP_HIDE_SEARCH
                  : STOCK_TOOLTIP_SEARCH
              }
              data-action="search-toggle"
              onClick={() => setSearchExpanded((v) => !v)}
            >
              {searchExpanded ? "×" : "⌕"}
            </button>
          </div>
        </div>
        <div className="owner-stock-tabs" data-slot="tabs" role="tablist">
          {(["stock", "activity"] as StockTab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={
                tab === key
                  ? "owner-stock-tab owner-stock-tab--active"
                  : "owner-stock-tab"
              }
              onClick={() => setTab(key)}
            >
              {STOCK_TAB_LABEL[key]}
            </button>
          ))}
        </div>
      </header>

      {/* ─── Period sheet ─── */}
      {periodOpen ? (
        <div
          className="owner-stock-sheet"
          data-slot="periodSheet"
          role="dialog"
          aria-label="Filter by period"
        >
          <div className="owner-stock-sheet__title">Filter by period</div>
          <ul className="owner-stock-sheet__list">
            {STOCK_PERIOD_SHEET_ORDER.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  className={
                    period === key
                      ? "owner-stock-sheet__item owner-stock-sheet__item--active"
                      : "owner-stock-sheet__item"
                  }
                  data-period={key}
                  onClick={() => pickPeriod(key)}
                >
                  <span className="owner-stock-sheet__item-label">
                    {STOCK_PERIOD_SHEET_LABELS[key]}
                  </span>
                  <span className="owner-stock-sheet__item-sub">
                    {STOCK_PERIOD_SHEET_SUB[key]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="owner-stock-sheet__dismiss"
            onClick={() => setPeriodOpen(false)}
          >
            Close
          </button>
        </div>
      ) : null}

      {/* ─── Advanced filter sheet ─── */}
      {filtersOpen ? (
        <div
          className="owner-stock-sheet"
          data-slot="filterSheet"
          role="dialog"
          aria-label={STOCK_FILTER_SHEET_TITLE}
        >
          <div className="owner-stock-sheet__title">
            {STOCK_FILTER_SHEET_TITLE}
          </div>

          {/* Toggle filters */}
          <label className="owner-stock-sheet__switch">
            <input
              type="checkbox"
              checked={draftOp.reorderOnly}
              onChange={(e) =>
                setDraftOp((o) => ({ ...o, reorderOnly: e.target.checked }))
              }
            />
            {STOCK_FILTER_REORDER}
          </label>
          <label className="owner-stock-sheet__switch">
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
            {STOCK_FILTER_PURCHASED}
          </label>
          <label className="owner-stock-sheet__switch">
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
            {STOCK_FILTER_MISSING_BARCODE}
          </label>
          <label className="owner-stock-sheet__switch">
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
            {STOCK_FILTER_MISSING_CODE}
          </label>

          {/* Subcategory picker */}
          <div className="owner-stock-sheet__field">
            <span className="owner-stock-sheet__field-label">Subcategory</span>
            <input
              type="text"
              className="owner-stock-sheet__field-input"
              placeholder="All subcategories"
              value={draftSubcategory}
              onChange={(e) => setDraftSubcategory(e.target.value)}
            />
          </div>

          {/* Supplier picker */}
          <div className="owner-stock-sheet__field">
            <span className="owner-stock-sheet__field-label">Supplier</span>
            <input
              type="text"
              className="owner-stock-sheet__field-input"
              placeholder="All suppliers"
              value={draftSupplier}
              onChange={(e) => setDraftSupplier(e.target.value)}
            />
          </div>

          {/* Unit chips */}
          <div className="owner-stock-sheet__field">
            <span className="owner-stock-sheet__field-label">Unit</span>
            <div className="owner-stock-sheet__chip-row">
              {["bag", "kg", "box", "tin", "piece"].map((u) => (
                <button
                  key={u}
                  type="button"
                  className={
                    draftUnit === u
                      ? "owner-stock-sheet__chip owner-stock-sheet__chip--active"
                      : "owner-stock-sheet__chip"
                  }
                  onClick={() => setDraftUnit(draftUnit === u ? "" : u)}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="owner-stock-sheet__field">
            <span className="owner-stock-sheet__field-label">Sort</span>
            <select
              className="owner-stock-sheet__field-select"
              value={draftSort}
              onChange={(e) => setDraftSort(e.target.value)}
            >
              <option value="name">Name A–Z</option>
              <option value="stock_asc">Stock ↑</option>
              <option value="stock_desc">Stock ↓</option>
              <option value="recent">Recent</option>
            </select>
          </div>

          <div className="owner-stock-sheet__actions">
            <button type="button" onClick={clearAdvancedFilters}>
              {STOCK_FILTER_CLEAR}
            </button>
            <button type="button" onClick={applyFilters}>
              {STOCK_FILTER_APPLY}
            </button>
          </div>
        </div>
      ) : null}

      {/* ─── Body ─── */}
      <main className="owner-stock-body" data-slot="body">
        {/* Debounce progress */}
        {query.trim() !== debounced ? (
          <div
            className="owner-stock-debounce-progress"
            data-slot="debounceProgress"
            role="progressbar"
            aria-label="Updating search"
          />
        ) : null}

        {/* Status chips */}
        <div
          className="owner-stock-status-chips"
          data-slot="statusChips"
        >
          {(["all", "shortage", "out"] as StockStatus[]).map((key) => {
            const count =
              key === "all"
                ? statusCounts["all"]
                : key === "shortage"
                  ? lowCount
                  : statusCounts["out"];
            return (
              <button
                key={key}
                type="button"
                className={[
                  "owner-stock-chip",
                  STATUS_CHIP_MOD[key],
                  status === key ? "owner-stock-chip--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setStatus(key)}
              >
                {key === "all"
                  ? STOCK_STATUS_ALL
                  : key === "shortage"
                    ? STOCK_STATUS_LOW
                    : STOCK_STATUS_OUT}
                {count != null ? (
                  <span className="owner-stock-chip__count">
                    {count > 999 ? "999+" : count}
                  </span>
                ) : (
                  <span className="owner-stock-chip__count owner-stock-chip__count--muted">
                    —
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        {searchExpanded ? (
          <div className="owner-stock-search" data-slot="search">
            <svg
              className="owner-stock-search__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="#9CA3AF"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              className="owner-stock-search__input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={STOCK_SEARCH_HINT}
              aria-label={STOCK_SEARCH_HINT}
            />
            {query.trim().length > 0 ? (
              <button
                type="button"
                className="owner-stock-search__clear"
                aria-label="Clear"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Delivery chips */}
        {deliveryCounts.pending > 0 || deliveryCounts.delivered > 0 ? (
          <div className="owner-stock-delivery-chips" data-slot="deliveryChips">
            {STOCK_DELIVERY_FILTER_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className={
                  deliveryFilter === key
                    ? "owner-stock-delivery-chip owner-stock-delivery-chip--active"
                    : "owner-stock-delivery-chip"
                }
                onClick={() => setDeliveryFilter(key)}
              >
                {STOCK_DELIVERY_FILTER_LABELS[key]}
                {key === "pending" && deliveryCounts.pending > 0 ? (
                  <span className="owner-stock-delivery-chip__count owner-stock-delivery-chip__count--pending">
                    {deliveryCounts.pending}
                  </span>
                ) : null}
                {key === "delivered" && deliveryCounts.delivered > 0 ? (
                  <span className="owner-stock-delivery-chip__count owner-stock-delivery-chip__count--delivered">
                    {deliveryCounts.delivered}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        {/* Table header */}
        <div className="owner-stock-table-header" data-slot="tableHeader">
          <div className="owner-stock-table-header__item">
            {STOCK_HDR_ITEM}
          </div>
          <div className="owner-stock-table-header__metric">
            {STOCK_HDR_SYS}
          </div>
          <div className="owner-stock-table-header__metric">
            {STOCK_HDR_PHYS}
          </div>
          <div className="owner-stock-table-header__metric">
            {STOCK_HDR_DIFF}
          </div>
        </div>

        {/* List placeholder — will be filled in WIRE stage */}
        <div
          className="owner-stock-scaffold-placeholder"
          data-slot="listPlaceholder"
        >
          STAGE 2 — fields rendered. Next stages add list rows + API.
        </div>
      </main>
    </div>
  );
}
