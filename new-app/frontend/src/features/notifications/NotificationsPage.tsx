/**
 * Notifications `/notifications` — FIELDS (Step 3).
 * Source: notifications_page.dart search/filter/showing/empty catalogs;
 * no API list rows (WIRE); back/clear/mark-all CTAs deferred BUTTONS.
 */
import { useMemo, useState } from "react";
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  NOTIFICATIONS_BACK_FALLBACK,
  NOTIFICATIONS_CLEAR_TOOLTIP,
  NOTIFICATIONS_CTA_NEW_PURCHASE,
  NOTIFICATIONS_CTA_RECEIVE,
  NOTIFICATIONS_EMPTY_SUB_FILTER_HIDDEN,
  NOTIFICATIONS_EMPTY_SUB_SEARCH,
  NOTIFICATIONS_EMPTY_TITLE_SEARCH,
  NOTIFICATIONS_MARK_ALL_READ,
  NOTIFICATIONS_SEARCH_HINT,
  NOTIFICATIONS_SHOW_ALL_ALERTS,
  NOTIFICATIONS_SHOWING_MID,
  NOTIFICATIONS_SHOWING_PREFIX,
  NOTIFICATIONS_SHOWING_SUFFIX,
  NOTIFICATIONS_TITLE,
} from "./notificationsCopy";
import {
  NOTIFICATIONS_EMPTY_SUBTITLE,
  NOTIFICATIONS_EMPTY_TITLE,
  NOTIFICATIONS_FILTER_LABELS,
  NOTIFICATIONS_FILTER_ORDER_OWNER,
  NOTIFICATIONS_FILTER_ORDER_STAFF,
  type NotificationCategoryFilter,
} from "./notificationsFilters";
import "./NotificationsPage.css";

export function NotificationsPage() {
  const session = readPrimaryBusiness();
  /** sessionIsStaff — post_auth_route.dart (primary role === staff) */
  const staff = (session?.role ?? "").toLowerCase() === "staff";
  const filters = staff
    ? NOTIFICATIONS_FILTER_ORDER_STAFF
    : NOTIFICATIONS_FILTER_ORDER_OWNER;

  const [filter, setFilter] = useState<NotificationCategoryFilter>("all");
  const [search, setSearch] = useState("");
  /** Local feed until WIRE — empty matches cold empty HexaEmptyState. */
  const items = useMemo(() => [] as { title: string; subtitle: string }[], []);

  const q = search.trim().toLowerCase();
  const filtered = items;
  const visible =
    q.length === 0
      ? filtered
      : filtered.filter((n) =>
          `${n.title} ${n.subtitle}`.toLowerCase().includes(q),
        );
  const filterEmptyButHasItems =
    items.length > 0 && filtered.length === 0 && q.length === 0;
  const showShowing = filter !== "all" || q.length > 0;
  const showEmptyState = visible.length === 0;

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
            tabIndex={-1}
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
          <button
            type="button"
            className="notifications-page__text-btn"
            data-testid="notifications-mark-all-read"
            tabIndex={-1}
            aria-hidden="true"
          >
            {NOTIFICATIONS_MARK_ALL_READ}
          </button>
          <button
            type="button"
            className="notifications-page__icon-btn"
            title={NOTIFICATIONS_CLEAR_TOOLTIP}
            aria-label={NOTIFICATIONS_CLEAR_TOOLTIP}
            data-testid="notifications-clear"
            tabIndex={-1}
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
                    tabIndex={-1}
                    aria-disabled="true"
                  >
                    {staff
                      ? NOTIFICATIONS_CTA_RECEIVE
                      : NOTIFICATIONS_CTA_NEW_PURCHASE}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
