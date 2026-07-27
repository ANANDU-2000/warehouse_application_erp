/**
 * Notifications `/notifications` — STATES (Step 6).
 * Source: notifications_page.dart loading/error/empty + RefreshIndicator;
 * purchase-due alerts deferred (trade list lacks remaining/due_date).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  fetchOpeningMissing,
  fetchStockAlertsSummary,
  fetchTradePurchasesRecent,
  type StockAlertsSummaryOut,
} from "../staff/staffHomeApi";
import {
  staffPendingDeliveriesFromRows,
  type TradePurchaseListRow,
} from "../staff/staffPendingDeliveries";
import { NotificationAlertCard } from "./NotificationAlertCard";
import {
  clearAllAppNotifications,
  listAppNotifications,
  markAllAppNotificationsRead,
  patchAppNotificationRead,
} from "./notificationsApi";
import {
  NOTIFICATIONS_BACK_FALLBACK,
  NOTIFICATIONS_CLEAR_DIALOG_BODY,
  NOTIFICATIONS_CLEAR_DIALOG_CANCEL,
  NOTIFICATIONS_CLEAR_DIALOG_CONFIRM,
  NOTIFICATIONS_CLEAR_DIALOG_TITLE,
  NOTIFICATIONS_CLEAR_TOOLTIP,
  NOTIFICATIONS_CTA_NEW_PURCHASE,
  NOTIFICATIONS_CTA_PATH_OWNER,
  NOTIFICATIONS_CTA_PATH_STAFF,
  NOTIFICATIONS_CTA_RECEIVE,
  NOTIFICATIONS_EMPTY_SUB_FILTER_HIDDEN,
  NOTIFICATIONS_EMPTY_SUB_SEARCH,
  NOTIFICATIONS_EMPTY_TITLE_SEARCH,
  NOTIFICATIONS_LOAD_ERROR,
  NOTIFICATIONS_MARK_ALL_READ,
  NOTIFICATIONS_RETRY,
  NOTIFICATIONS_SEARCH_HINT,
  NOTIFICATIONS_SECTION_EARLIER,
  NOTIFICATIONS_SECTION_TODAY,
  NOTIFICATIONS_SECTION_YESTERDAY,
  NOTIFICATIONS_SHOW_ALL_ALERTS,
  NOTIFICATIONS_SHOWING_MID,
  NOTIFICATIONS_SHOWING_PREFIX,
  NOTIFICATIONS_SHOWING_SUFFIX,
  NOTIFICATIONS_TITLE,
} from "./notificationsCopy";
import {
  mergeNotificationFeed,
  notificationMatchesCategoryFilter,
  type NotificationUiItem,
} from "./notificationsFeed";
import {
  NOTIFICATIONS_EMPTY_SUBTITLE,
  NOTIFICATIONS_EMPTY_TITLE,
  NOTIFICATIONS_FILTER_LABELS,
  NOTIFICATIONS_FILTER_ORDER_OWNER,
  NOTIFICATIONS_FILTER_ORDER_STAFF,
  type NotificationCategoryFilter,
} from "./notificationsFilters";
import { mapNotificationsLoadSubtitle } from "./notificationsLoadSubtitle";
import "./NotificationsPage.css";

/** Flutter navigation_ext.popOrGo — pop when stack allows, else go fallback. */
function popOrGo(
  navigate: ReturnType<typeof useNavigate>,
  fallback: string,
): void {
  const idx =
    typeof window !== "undefined" &&
    window.history.state &&
    typeof (window.history.state as { idx?: unknown }).idx === "number"
      ? (window.history.state as { idx: number }).idx
      : 0;
  if (idx > 0) {
    navigate(-1);
    return;
  }
  navigate(fallback, { replace: true });
}

function day0(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  /** sessionIsStaff — post_auth_route.dart (primary role === staff) */
  const staff = (session?.role ?? "").toLowerCase() === "staff";
  const filters = staff
    ? NOTIFICATIONS_FILTER_ORDER_STAFF
    : NOTIFICATIONS_FILTER_ORDER_OWNER;

  const [filter, setFilter] = useState<NotificationCategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  /** serverAsync.isLoading — LinearProgressIndicator */
  const [serverLoading, setServerLoading] = useState(true);
  /** stockStatusCountsProvider.isLoading — gates empty HexaEmptyState */
  const [stockLoading, setStockLoading] = useState(true);
  const [serverError, setServerError] = useState<unknown>(null);
  const [serverRows, setServerRows] = useState<Record<string, unknown>[]>([]);
  const [alerts, setAlerts] = useState<StockAlertsSummaryOut | null>(null);
  const [openingCount, setOpeningCount] = useState(0);
  const [pending, setPending] = useState<
    { supplierName: string | null; purchaseDate: Date }[]
  >([]);
  const [warehouseReadIds, setWarehouseReadIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [manualReadIds, setManualReadIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [retryTick, setRetryTick] = useState(0);
  const listRef = useRef<HTMLElement | null>(null);
  const pullStartY = useRef<number | null>(null);

  const load = useCallback(async () => {
    if (!businessId) {
      setServerLoading(false);
      setStockLoading(false);
      setServerError(new Error("Not authenticated"));
      return;
    }
    setServerLoading(true);
    setStockLoading(true);

    try {
      const rows = await listAppNotifications(businessId);
      setServerRows(rows);
      setServerError(null);
    } catch (e) {
      setServerError(e);
      setServerRows([]);
    } finally {
      setServerLoading(false);
    }

    try {
      const [summary, opening, trades] = await Promise.all([
        fetchStockAlertsSummary(businessId).catch(() => null),
        fetchOpeningMissing(businessId).catch(() => ({
          items: [],
          missing_count: 0,
        })),
        staff
          ? fetchTradePurchasesRecent(businessId).catch(() => [])
          : Promise.resolve([] as Record<string, unknown>[]),
      ]);
      setAlerts(summary);
      setOpeningCount(Number(opening.missing_count ?? 0));
      if (staff) {
        const pendingList = staffPendingDeliveriesFromRows(
          trades as TradePurchaseListRow[],
        );
        const byId = new Map(
          trades.map((r) => [String(r.id ?? ""), r] as const),
        );
        setPending(
          pendingList.map((p) => {
            const raw = byId.get(p.id);
            const sn =
              raw && raw.supplier_name != null
                ? String(raw.supplier_name).trim()
                : "";
            return {
              supplierName: sn.length > 0 ? sn : null,
              purchaseDate: new Date(p.purchaseDate),
            };
          }),
        );
      } else {
        setPending([]);
      }
    } finally {
      setStockLoading(false);
    }
  }, [businessId, staff]);

  useEffect(() => {
    void load();
  }, [load, retryTick]);

  const items = useMemo(
    () =>
      mergeNotificationFeed({
        serverRows,
        alerts,
        openingCount,
        pending,
        staff,
        warehouseReadIds,
        manualReadIds,
      }),
    [
      serverRows,
      alerts,
      openingCount,
      pending,
      staff,
      warehouseReadIds,
      manualReadIds,
    ],
  );

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      items.filter((n) => notificationMatchesCategoryFilter(n, filter)),
    [items, filter],
  );
  const visible = useMemo(
    () =>
      q.length === 0
        ? filtered
        : filtered.filter((n) =>
            `${n.title} ${n.subtitle}`.toLowerCase().includes(q),
          ),
    [filtered, q],
  );
  const filterEmptyButHasItems =
    items.length > 0 && filtered.length === 0 && q.length === 0;
  const showShowing = filter !== "all" || q.length > 0;
  /** Flutter showEmptyState — hide empty while server/stock loading */
  const showEmptyState =
    visible.length === 0 && !serverLoading && !stockLoading;
  /** Flutter hasUnread = visible.any */
  const hasUnread = visible.some((n) => !n.isRead);
  const clearDisabled = serverRows.length === 0;
  const showProgress = serverLoading;

  const emptyTitle =
    q.length > 0
      ? NOTIFICATIONS_EMPTY_TITLE_SEARCH
      : NOTIFICATIONS_EMPTY_TITLE[filter];
  const emptySubtitle =
    q.length > 0
      ? NOTIFICATIONS_EMPTY_SUB_SEARCH
      : filterEmptyButHasItems
        ? NOTIFICATIONS_EMPTY_SUB_FILTER_HIDDEN
        : NOTIFICATIONS_EMPTY_SUBTITLE[filter];

  const sections = useMemo(() => {
    const today0 = day0(new Date());
    const yest0 = new Date(today0);
    yest0.setDate(yest0.getDate() - 1);
    const today: NotificationUiItem[] = [];
    const yesterday: NotificationUiItem[] = [];
    const earlier: NotificationUiItem[] = [];
    for (const n of visible) {
      const d = day0(n.createdAt);
      if (d.getTime() === today0.getTime()) today.push(n);
      else if (d.getTime() === yest0.getTime()) yesterday.push(n);
      else earlier.push(n);
    }
    return { today, yesterday, earlier };
  }, [visible]);

  async function markAllRead(): Promise<void> {
    if (!businessId) return;
    try {
      await markAllAppNotificationsRead(businessId);
    } catch {
      /* Flutter swallows mark-all API errors */
    }
    const whIds = new Set(warehouseReadIds);
    const manIds = new Set(manualReadIds);
    for (const n of items) {
      if (n.isRead) continue;
      if (n.id.startsWith("wh_")) whIds.add(n.id);
      else if (!n.serverNotificationId) manIds.add(n.id);
    }
    setWarehouseReadIds(whIds);
    setManualReadIds(manIds);
    setRetryTick((t) => t + 1);
  }

  async function confirmClearServer(): Promise<void> {
    setClearOpen(false);
    if (!businessId) return;
    try {
      await clearAllAppNotifications(businessId);
      setRetryTick((t) => t + 1);
    } catch {
      /* keep dialog closed; STATES expands errors */
    }
  }

  async function handleCardTap(n: NotificationUiItem): Promise<void> {
    const sid = n.serverNotificationId;
    if (sid) {
      if (businessId) {
        try {
          await patchAppNotificationRead({
            businessId,
            notificationId: sid,
          });
          setRetryTick((t) => t + 1);
        } catch {
          /* ignore */
        }
      }
    } else if (n.id.startsWith("wh_")) {
      setWarehouseReadIds((prev) => new Set([...prev, n.id]));
    } else {
      setManualReadIds((prev) => new Set([...prev, n.id]));
    }
    if (n.actionRoute) {
      navigate(n.actionRoute);
    }
  }

  function renderCard(n: NotificationUiItem) {
    const isReorder = n.serverKind === "reorder_request";
    return (
      <NotificationAlertCard
        key={n.id}
        item={n}
        onTap={() => {
          void handleCardTap(n);
        }}
        onOrderNow={
          isReorder
            ? () => {
                void handleCardTap(n).then(() => {
                  navigate(NOTIFICATIONS_CTA_PATH_OWNER);
                });
              }
            : undefined
        }
      />
    );
  }

  return (
    <div
      className="notifications-page"
      data-testid="notifications-page"
      data-back-fallback={NOTIFICATIONS_BACK_FALLBACK}
    >
      <header className="notifications-page__appbar" data-slot="appBar">
        <div
          className="notifications-page__appbar-leading"
          data-slot="appBar.leading"
        >
          <button
            type="button"
            className="notifications-page__icon-btn"
            title="Back"
            aria-label="Back"
            data-testid="notifications-back"
            onClick={() => popOrGo(navigate, NOTIFICATIONS_BACK_FALLBACK)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
          </button>
        </div>
        <h1 className="notifications-page__title">{NOTIFICATIONS_TITLE}</h1>
        <div
          className="notifications-page__appbar-actions"
          data-slot="appBar.actions"
        >
          {hasUnread ? (
            <button
              type="button"
              className="notifications-page__text-btn"
              data-testid="notifications-mark-all-read"
              onClick={() => {
                void markAllRead();
              }}
            >
              {NOTIFICATIONS_MARK_ALL_READ}
            </button>
          ) : null}
          <button
            type="button"
            className="notifications-page__icon-btn"
            title={NOTIFICATIONS_CLEAR_TOOLTIP}
            aria-label={NOTIFICATIONS_CLEAR_TOOLTIP}
            data-testid="notifications-clear"
            disabled={clearDisabled}
            onClick={() => {
              if (clearDisabled) return;
              setClearOpen(true);
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="notifications-page__body" data-slot="body">
        {showProgress ? (
          <div
            className="notifications-page__progress"
            data-testid="notifications-loading"
            role="progressbar"
            aria-label="Loading"
          />
        ) : null}
        {serverError != null ? (
          <div
            className="notifications-page__error"
            data-testid="notifications-error"
          >
            <span
              className="notifications-page__error-icon"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path
                  fill="currentColor"
                  d="M12 5.99 19.53 19H4.47L12 5.99M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"
                />
              </svg>
            </span>
            <div className="notifications-page__error-text">
              <p className="notifications-page__error-title">
                {NOTIFICATIONS_LOAD_ERROR}
              </p>
              <p className="notifications-page__error-sub">
                {mapNotificationsLoadSubtitle(serverError)}
              </p>
            </div>
            <button
              type="button"
              className="notifications-page__icon-btn"
              data-testid="notifications-retry"
              aria-label={NOTIFICATIONS_RETRY}
              onClick={() => setRetryTick((t) => t + 1)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7c2.76 0 5 2.24 5 5a5 5 0 0 1-8.9 3.1L6.7 16.5A7.97 7.97 0 0 0 12 20c4.42 0 8-3.58 8-8 0-2.21-.9-4.21-2.35-5.65z"
                />
              </svg>
            </button>
          </div>
        ) : null}

        <div
          className="notifications-page__search"
          data-slot="search"
          data-testid="notifications-search-chrome"
        >
          <span className="notifications-page__search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
            </svg>
          </span>
          <input
            className="notifications-page__search-input notifications-page__search-input--active"
            type="search"
            placeholder={NOTIFICATIONS_SEARCH_HINT}
            aria-label={NOTIFICATIONS_SEARCH_HINT}
            data-testid="notifications-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 0 ? (
            <button
              type="button"
              className="notifications-page__search-clear"
              data-testid="notifications-search-clear"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          ) : null}
        </div>

        <div
          className="notifications-page__filters"
          data-slot="filters"
          data-testid="notifications-filters"
          role="tablist"
          aria-label="Notification filters"
        >
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={
                filter === f
                  ? "notifications-page__chip notifications-page__chip--selected notifications-page__chip--active"
                  : "notifications-page__chip notifications-page__chip--active"
              }
              data-testid={`notifications-filter-${f}`}
              onClick={() => setFilter(f)}
            >
              {NOTIFICATIONS_FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {showShowing ? (
          <p
            className="notifications-page__showing"
            data-testid="notifications-showing"
          >
            {NOTIFICATIONS_SHOWING_PREFIX}
            {visible.length}
            {NOTIFICATIONS_SHOWING_MID}
            {items.length}
            {NOTIFICATIONS_SHOWING_SUFFIX}
          </p>
        ) : null}

        <section
          className="notifications-page__list"
          data-slot="list"
          data-testid="notifications-list-chrome"
          aria-label="Notifications list"
          ref={listRef}
          onTouchStart={(e) => {
            const el = listRef.current;
            if (!el || el.scrollTop > 0) {
              pullStartY.current = null;
              return;
            }
            pullStartY.current = e.touches[0]?.clientY ?? null;
          }}
          onTouchEnd={(e) => {
            const start = pullStartY.current;
            pullStartY.current = null;
            if (start == null) return;
            const endY = e.changedTouches[0]?.clientY ?? start;
            if (endY - start > 64 && !serverLoading && !stockLoading) {
              setRetryTick((t) => t + 1);
            }
          }}
        >
          {showEmptyState ? (
            <div
              className="notifications-page__empty"
              data-testid="notifications-empty"
            >
              <span
                className="notifications-page__empty-icon"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" width="40" height="40">
                  <path
                    fill="currentColor"
                    d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  />
                </svg>
              </span>
              <h2 className="notifications-page__empty-title">{emptyTitle}</h2>
              <p className="notifications-page__empty-sub">{emptySubtitle}</p>
              <div className="notifications-page__empty-actions">
                {filterEmptyButHasItems ? (
                  <button
                    type="button"
                    className="notifications-page__empty-btn notifications-page__empty-btn--filled"
                    data-testid="notifications-show-all"
                    onClick={() => setFilter("all")}
                  >
                    {NOTIFICATIONS_SHOW_ALL_ALERTS}
                  </button>
                ) : null}
                {items.length === 0 ? (
                  <button
                    type="button"
                    className="notifications-page__empty-btn notifications-page__empty-btn--filled"
                    data-testid="notifications-empty-cta"
                    onClick={() =>
                      navigate(
                        staff
                          ? NOTIFICATIONS_CTA_PATH_STAFF
                          : NOTIFICATIONS_CTA_PATH_OWNER,
                      )
                    }
                  >
                    {staff
                      ? NOTIFICATIONS_CTA_RECEIVE
                      : NOTIFICATIONS_CTA_NEW_PURCHASE}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="notifications-page__feed" data-testid="notifications-feed">
              {sections.today.length > 0 ? (
                <>
                  <h3 className="notifications-page__section">
                    {NOTIFICATIONS_SECTION_TODAY}
                  </h3>
                  {sections.today.map(renderCard)}
                </>
              ) : null}
              {sections.yesterday.length > 0 ? (
                <>
                  <h3 className="notifications-page__section">
                    {NOTIFICATIONS_SECTION_YESTERDAY}
                  </h3>
                  {sections.yesterday.map(renderCard)}
                </>
              ) : null}
              {sections.earlier.length > 0 ? (
                <>
                  <h3 className="notifications-page__section">
                    {NOTIFICATIONS_SECTION_EARLIER}
                  </h3>
                  {sections.earlier.map(renderCard)}
                </>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {clearOpen ? (
        <div
          className="notifications-page__dialog-backdrop"
          data-testid="notifications-clear-dialog"
          onClick={() => setClearOpen(false)}
        >
          <div
            className="notifications-page__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="notifications-clear-title"
            aria-describedby="notifications-clear-body"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="notifications-clear-title"
              className="notifications-page__dialog-title"
            >
              {NOTIFICATIONS_CLEAR_DIALOG_TITLE}
            </h2>
            <p
              id="notifications-clear-body"
              className="notifications-page__dialog-body"
            >
              {NOTIFICATIONS_CLEAR_DIALOG_BODY}
            </p>
            <div className="notifications-page__dialog-actions">
              <button
                type="button"
                className="notifications-page__dialog-cancel"
                data-testid="notifications-clear-cancel"
                onClick={() => setClearOpen(false)}
              >
                {NOTIFICATIONS_CLEAR_DIALOG_CANCEL}
              </button>
              <button
                type="button"
                className="notifications-page__dialog-confirm"
                data-testid="notifications-clear-confirm"
                onClick={() => {
                  void confirmClearServer();
                }}
              >
                {NOTIFICATIONS_CLEAR_DIALOG_CONFIRM}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
