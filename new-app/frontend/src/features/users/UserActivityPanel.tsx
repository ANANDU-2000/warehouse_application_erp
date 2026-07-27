/**
 * User profile Activity tab body — user_activity_tab.dart sections + providers.
 */
import { useCallback, useEffect, useState } from "react";
import {
  USER_ACTIVITY_SECTION_LABELS,
  USER_ACTIVITY_SECTION_ORDER,
  type UserActivitySection,
} from "./userProfileFields";
import {
  USER_PROFILE_ACTIVITY_EMPTY_FEED,
  USER_PROFILE_ACTIVITY_EMPTY_ITEMS,
  USER_PROFILE_ACTIVITY_EMPTY_LEDGER,
  USER_PROFILE_ACTIVITY_EMPTY_PURCHASES,
  USER_PROFILE_ACTIVITY_EMPTY_STOCK,
  USER_PROFILE_ACTIVITY_LOAD_DEFAULT,
  USER_PROFILE_RETRY,
  USER_PROFILE_RETRY_SUBTITLE,
} from "./userProfileCopy";
import {
  listUserActivity,
  listUserCreatedItems,
  listUserLedgerGrouped,
  listUserPurchases,
  listUserStockAdjustments,
} from "./usersApi";
import { mapUserFacingError } from "./usersLoadSubtitle";
import {
  UserActivityTimeline,
  type ActivityTimelineRow,
} from "./UserActivityTimeline";

type Props = {
  businessId: string;
  userId: string;
  section: UserActivitySection;
  onSectionChange: (s: UserActivitySection) => void;
};

export function UserActivityPanel({
  businessId,
  userId,
  section,
  onSectionChange,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);
  const [rows, setRows] = useState<ActivityTimelineRow[]>([]);
  const [emptyMessage, setEmptyMessage] = useState(
    USER_PROFILE_ACTIVITY_EMPTY_FEED,
  );
  const [retryTick, setRetryTick] = useState(0);
  /** Feed errors use userFacingError; other sections use default FriendlyLoadError. */
  const [useFacingMessage, setUseFacingMessage] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRows([]);

    try {
      switch (section) {
        case "feed": {
          setUseFacingMessage(true);
          setEmptyMessage(USER_PROFILE_ACTIVITY_EMPTY_FEED);
          const data = await listUserActivity({
            businessId,
            userId,
            days: 30,
            perPage: 100,
          });
          setRows(
            data.map((r) => ({
              created_at: r.created_at,
              action_type: r.action_type,
              item_name: r.item_name,
            })),
          );
          break;
        }
        case "stock": {
          setUseFacingMessage(false);
          setEmptyMessage(USER_PROFILE_ACTIVITY_EMPTY_STOCK);
          const data = await listUserStockAdjustments({ businessId, userId });
          setRows(
            data.map((r) => ({
              created_at: r.updated_at,
              action_type: "stock_updated",
              item_name: `${r.item_name ?? ""} · ${r.old_qty} → ${r.new_qty}`,
            })),
          );
          break;
        }
        case "purchases": {
          setUseFacingMessage(false);
          setEmptyMessage(USER_PROFILE_ACTIVITY_EMPTY_PURCHASES);
          const data = await listUserPurchases({ businessId, userId });
          setRows(
            data.map((p) => ({
              created_at: p.purchase_date ?? null,
              action_type: "purchase_created",
              item_name: `${p.human_id ?? p.id} · ${p.status ?? ""}`,
            })),
          );
          break;
        }
        case "items": {
          setUseFacingMessage(false);
          setEmptyMessage(USER_PROFILE_ACTIVITY_EMPTY_ITEMS);
          const data = await listUserCreatedItems({ businessId, userId });
          setRows(
            data.map((it) => ({
              created_at: it.updated_at,
              action_type: "item_created",
              item_name: it.name,
            })),
          );
          break;
        }
        case "ledger": {
          setUseFacingMessage(false);
          setEmptyMessage(USER_PROFILE_ACTIVITY_EMPTY_LEDGER);
          const grouped = await listUserLedgerGrouped({ businessId, userId });
          const all: ActivityTimelineRow[] = [];
          for (const key of ["today", "yesterday", "this_week"] as const) {
            for (const e of grouped[key]) {
              all.push({
                created_at: e.at,
                action_type: e.kind || "ledger",
                item_name: `${e.title ?? ""} ${e.subtitle ?? ""}`.trim(),
              });
            }
          }
          setRows(all);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, section, userId]);

  useEffect(() => {
    void load();
  }, [load, retryTick]);

  return (
    <div data-testid="user-profile-activity">
      <div
        className="user-profile__activity-chips"
        data-testid="user-profile-activity-chips"
        role="tablist"
        aria-label="Activity section"
      >
        {USER_ACTIVITY_SECTION_ORDER.map((sec) => {
          const selected = section === sec;
          return (
            <button
              key={sec}
              type="button"
              role="tab"
              aria-selected={selected}
              className={
                selected
                  ? "user-profile__activity-chip user-profile__activity-chip--selected"
                  : "user-profile__activity-chip"
              }
              data-testid={`user-profile-activity-${sec}`}
              onClick={() => onSectionChange(sec)}
            >
              {USER_ACTIVITY_SECTION_LABELS[sec]}
            </button>
          );
        })}
      </div>

      <div
        className="user-profile__activity-panel"
        data-testid="user-profile-activity-panel"
      >
        {loading ? (
          <div
            className="user-profile__cold-load user-profile__cold-load--tab"
            data-testid="user-profile-activity-loading"
            aria-busy="true"
            aria-label="Loading"
          >
            <span className="user-profile__spinner-ring" aria-hidden="true" />
          </div>
        ) : null}

        {!loading && error != null ? (
          <div
            className="user-profile__friendly-error"
            role="alert"
            data-testid="user-profile-activity-error"
          >
            <p className="user-profile__friendly-error-msg">
              {useFacingMessage
                ? mapUserFacingError(error)
                : USER_PROFILE_ACTIVITY_LOAD_DEFAULT}
            </p>
            {!useFacingMessage ? (
              <p className="user-profile__friendly-error-sub">
                {USER_PROFILE_RETRY_SUBTITLE}
              </p>
            ) : null}
            <button
              type="button"
              className="user-profile__retry"
              data-testid="user-profile-activity-retry"
              onClick={() => setRetryTick((n) => n + 1)}
            >
              {USER_PROFILE_RETRY}
            </button>
          </div>
        ) : null}

        {!loading && error == null ? (
          <UserActivityTimeline rows={rows} emptyMessage={emptyMessage} />
        ) : null}
      </div>
    </div>
  );
}
