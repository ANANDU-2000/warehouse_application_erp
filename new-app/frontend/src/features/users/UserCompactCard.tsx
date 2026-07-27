/**
 * Compact user row — user_compact_card.dart (WIRE display subset; no overflow menu).
 */
import type { BusinessUserListItem } from "./usersApi";
import {
  displayUserRole,
  userIsOnlineNow,
  userLastActiveLabel,
  userStatusLabel,
} from "./userLastActive";
import "./UserCompactCard.css";

export function UserCompactCard({
  user,
  selectMode,
  selected,
  onTap,
  onToggleSelect,
}: {
  user: BusinessUserListItem;
  selectMode: boolean;
  selected: boolean;
  onTap: () => void;
  onToggleSelect: () => void;
}) {
  const name = user.name?.toString() || "—";
  const email = user.email?.toString() || "";
  const role = user.role?.toString() || "";
  const blocked = user.is_blocked === true;
  const active = user.is_active === true && !blocked;
  const online = userIsOnlineNow(user.last_active_at) && active;
  const lastActive = userLastActiveLabel(
    user.last_active_at,
    user.created_at,
  );
  const status = userStatusLabel({ blocked, active });
  const initial = name !== "—" ? name[0]!.toUpperCase() : "?";

  return (
    <button
      type="button"
      className={
        selected
          ? "user-card user-card--selected"
          : "user-card"
      }
      data-testid={`user-card-${user.id}`}
      onClick={onTap}
    >
      {selectMode ? (
        <input
          type="checkbox"
          className="user-card__check"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${name}`}
        />
      ) : null}
      <span
        className={
          online ? "user-card__avatar user-card__avatar--online" : "user-card__avatar"
        }
        aria-hidden="true"
      >
        {initial}
      </span>
      <span className="user-card__body">
        <span className="user-card__name">{name}</span>
        <span className="user-card__role">{displayUserRole(role)}</span>
        {email ? <span className="user-card__email">{email}</span> : null}
        <span className="user-card__meta">Last active: {lastActive}</span>
        <span
          className={
            blocked
              ? "user-card__status user-card__status--blocked"
              : active
                ? "user-card__status user-card__status--active"
                : "user-card__status"
          }
        >
          Status: {status}
        </span>
      </span>
    </button>
  );
}
