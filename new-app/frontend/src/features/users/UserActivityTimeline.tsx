/**
 * User activity timeline — user_activity_timeline.dart
 */
import type { ReactNode } from "react";

export type ActivityTimelineRow = {
  created_at: string | null | undefined;
  action_type: string;
  item_name?: string | null;
};

export function friendlyActionType(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .split(" ")
    .filter((w) => w.length > 0)
    .map((w) => `${w[0]!.toUpperCase()}${w.slice(1)}`)
    .join(" ");
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function activityDayLabel(at: Date | null, today: Date): string {
  if (at == null) return "Earlier";
  const local = at;
  const day = startOfLocalDay(local);
  const todayStart = startOfLocalDay(today);
  if (day.getTime() === todayStart.getTime()) return "Today";
  const yesterday = new Date(todayStart);
  yesterday.setDate(yesterday.getDate() - 1);
  if (day.getTime() === yesterday.getTime()) return "Yesterday";
  const diffDays = Math.floor(
    (todayStart.getTime() - day.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays > 0 && diffDays < 7) {
    return local.toLocaleDateString(undefined, { weekday: "long" });
  }
  return local.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function groupActivityByDay(
  rows: ActivityTimelineRow[],
  now: Date = new Date(),
): { label: string; rows: ActivityTimelineRow[] }[] {
  const sorted = [...rows].sort((a, b) => {
    const da = Date.parse(a.created_at?.toString() ?? "") || 0;
    const db = Date.parse(b.created_at?.toString() ?? "") || 0;
    return db - da;
  });
  const map = new Map<string, ActivityTimelineRow[]>();
  const order: string[] = [];
  for (const row of sorted) {
    const atRaw = row.created_at?.toString() ?? "";
    const at = atRaw ? new Date(atRaw) : null;
    const valid = at && !Number.isNaN(at.getTime()) ? at : null;
    const label = activityDayLabel(valid, now);
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(row);
  }
  return order.map((label) => ({ label, rows: map.get(label)! }));
}

export function formatActivityTime(createdAt: string | null | undefined): string {
  if (!createdAt) return "";
  const at = new Date(createdAt);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function UserActivityTimeline({
  rows,
  emptyMessage,
}: {
  rows: ActivityTimelineRow[];
  emptyMessage: string;
}): ReactNode {
  if (rows.length === 0) {
    return (
      <p
        className="user-profile__activity-empty"
        data-testid="user-profile-activity-empty"
      >
        {emptyMessage}
      </p>
    );
  }

  const grouped = groupActivityByDay(rows);

  return (
    <div
      className="user-profile__activity-timeline"
      data-testid="user-profile-activity-timeline"
    >
      {grouped.map((g) => (
        <div key={g.label} className="user-profile__activity-day">
          <h3 className="user-profile__activity-day-label">{g.label}</h3>
          {g.rows.map((row, i) => {
            const title = friendlyActionType(row.action_type);
            const item = row.item_name?.toString() ?? "";
            const time = formatActivityTime(row.created_at);
            return (
              <div
                key={`${g.label}-${i}-${row.action_type}-${row.created_at}`}
                className="user-profile__activity-row"
                data-testid="user-profile-activity-row"
              >
                <span className="user-profile__activity-dot" aria-hidden="true" />
                <div className="user-profile__activity-row-body">
                  <span className="user-profile__activity-row-title">{title}</span>
                  {item ? (
                    <span className="user-profile__activity-row-item">{item}</span>
                  ) : null}
                  {time ? (
                    <span className="user-profile__activity-row-time">{time}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
