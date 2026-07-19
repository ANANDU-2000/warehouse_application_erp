/**
 * Notification alert card — notification_alert_card.dart chrome + labels.
 */
import {
  NOTIFICATIONS_CARD_FALLBACK_TITLE,
  NOTIFICATIONS_ORDER_NOW,
} from "./notificationsCopy";
import type { NotificationUiItem } from "./notificationsFeed";
import { relativeTimeLabel } from "./notificationsFeed";

type Props = {
  item: NotificationUiItem;
  onTap: () => void;
  onOrderNow?: () => void;
};

function priorityColor(priority: string | null): string {
  switch (priority) {
    case "critical":
      return "#dc2626";
    case "high":
      return "#f59e0b";
    case "info":
      return "#5c6578";
    default:
      return "#159a8a";
  }
}

export function NotificationAlertCard({ item, onTap, onOrderNow }: Props) {
  const pri = priorityColor(item.priority);
  const title =
    item.title.trim().length > 0
      ? item.title
      : NOTIFICATIONS_CARD_FALLBACK_TITLE;
  const time = relativeTimeLabel(item.createdAt);

  return (
    <div
      className="notifications-page__card"
      data-testid={`notifications-card-${item.id}`}
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
    >
      <span
        className={
          item.isRead
            ? "notifications-page__card-priority notifications-page__card-priority--read"
            : "notifications-page__card-priority"
        }
        style={{ background: item.isRead ? "#cbd5e1" : pri }}
        aria-hidden="true"
      />
      <span
        className="notifications-page__card-glyph"
        style={{ color: pri }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            fill="currentColor"
            d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
          />
        </svg>
      </span>
      <span className="notifications-page__card-body">
        <span className="notifications-page__card-title">{title}</span>
        {item.subtitle.trim().length > 0 ? (
          <span className="notifications-page__card-sub">{item.subtitle}</span>
        ) : null}
        <span className="notifications-page__card-time">{time}</span>
        {onOrderNow ? (
          <button
            type="button"
            className="notifications-page__card-order"
            onClick={(e) => {
              e.stopPropagation();
              onOrderNow();
            }}
          >
            {NOTIFICATIONS_ORDER_NOW}
          </button>
        ) : null}
      </span>
      {!item.isRead ? (
        <span
          className="notifications-page__card-dot"
          style={{ background: pri }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
