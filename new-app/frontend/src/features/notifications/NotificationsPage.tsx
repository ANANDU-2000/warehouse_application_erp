/**
 * Notifications `/notifications` — LAYOUT (Step 2).
 * Source: notifications_page.dart AppBar/search/_FilterChip;
 * notification_alert_card.dart row chrome; HexaColors (no API / no live rows).
 */
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import {
  NOTIFICATIONS_BACK_FALLBACK,
  NOTIFICATIONS_CLEAR_TOOLTIP,
  NOTIFICATIONS_MARK_ALL_READ,
  NOTIFICATIONS_SEARCH_HINT,
  NOTIFICATIONS_TITLE,
} from "./notificationsCopy";
import {
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
  const selected: NotificationCategoryFilter = "all";

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
            className="notifications-page__search-input"
            type="search"
            placeholder={NOTIFICATIONS_SEARCH_HINT}
            aria-label={NOTIFICATIONS_SEARCH_HINT}
            data-testid="notifications-search"
            readOnly
            tabIndex={-1}
          />
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
              aria-selected={selected === f}
              className={
                selected === f
                  ? "notifications-page__chip notifications-page__chip--selected"
                  : "notifications-page__chip"
              }
              data-testid={`notifications-filter-${f}`}
              tabIndex={-1}
            >
              {NOTIFICATIONS_FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        <section
          className="notifications-page__list"
          data-slot="list"
          data-testid="notifications-list-chrome"
          aria-label="Notifications list"
        >
          {/* Inert alert-card shells — notification_alert_card.dart shape; no copy/API */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="notifications-page__card-chrome"
              data-testid="notifications-card-chrome"
              aria-hidden="true"
            >
              <span className="notifications-page__card-priority" />
              <span className="notifications-page__card-icon" />
              <div className="notifications-page__card-lines">
                <span className="notifications-page__card-bar notifications-page__card-bar--title" />
                <span className="notifications-page__card-bar notifications-page__card-bar--sub" />
                <span className="notifications-page__card-bar notifications-page__card-bar--time" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
