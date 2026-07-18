/**
 * Owner home period windows — port of home_dashboard_provider.dart
 * HomePeriod / homePeriodRange (half-open [start, end)).
 */

export type HomePeriod =
  | "today"
  | "week"
  | "month"
  | "year"
  | "allTime"
  | "custom";

export const HOME_PERIOD_ORDER: HomePeriod[] = [
  "today",
  "week",
  "month",
  "year",
  "allTime",
  "custom",
];

export const HOME_PERIOD_LABELS: Record<HomePeriod, string> = {
  today: "Today",
  week: "Week",
  month: "Month",
  year: "Year",
  allTime: "All time",
  custom: "Custom",
};

export type HomeCustomRange = { start: Date; endInclusive: Date };

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

/** YYYY-MM-DD for date inputs (local calendar). */
export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateInputValue(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (
    d.getFullYear() !== y ||
    d.getMonth() !== mo ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

/** Default Custom picker initial: last 29 days → today (Flutter DateTimeRange). */
export function defaultCustomRange(now = new Date()): HomeCustomRange {
  const endInclusive = startOfLocalDay(now);
  const start = addDays(endInclusive, -29);
  return { start, endInclusive };
}

/**
 * Half-open window [start, end) in local date space.
 * Matches Dart homePeriodRange.
 */
export function homePeriodRange(
  period: HomePeriod,
  options?: {
    now?: Date;
    custom?: HomeCustomRange | null;
  },
): { start: Date; end: Date } {
  const t = options?.now ?? new Date();
  const endOfDay = addDays(startOfLocalDay(t), 1);
  const custom = options?.custom;

  if (period === "custom" && custom) {
    const s = startOfLocalDay(custom.start);
    const e = addDays(startOfLocalDay(custom.endInclusive), 1);
    return { start: s, end: e };
  }

  switch (period) {
    case "today":
      return { start: startOfLocalDay(t), end: endOfDay };
    case "week":
      return {
        start: addDays(startOfLocalDay(t), -6),
        end: endOfDay,
      };
    case "month":
      return {
        start: addDays(startOfLocalDay(t), -29),
        end: endOfDay,
      };
    case "year":
      return {
        start: new Date(t.getFullYear(), 0, 1),
        end: endOfDay,
      };
    case "allTime":
      return {
        start: new Date(1970, 0, 1),
        end: new Date(2099, 11, 31, 23, 59, 59, 999),
      };
    case "custom":
      return {
        start: new Date(t.getFullYear(), t.getMonth(), 1),
        end: endOfDay,
      };
  }
}

/** Client validation for Custom inclusive range. */
export function isValidCustomRange(custom: HomeCustomRange): boolean {
  return (
    startOfLocalDay(custom.start).getTime() <=
    startOfLocalDay(custom.endInclusive).getTime()
  );
}

/**
 * Inclusive API dates for home-overview `from`/`to`.
 * Formula source: home_dashboard_provider — lastInclusive = range.end - 1ms.
 */
export function homePeriodApiDates(
  period: HomePeriod,
  options?: {
    now?: Date;
    custom?: HomeCustomRange | null;
  },
): { from: string; to: string } {
  const range = homePeriodRange(period, options);
  const lastInclusive = new Date(range.end.getTime() - 1);
  return {
    from: toDateInputValue(range.start),
    to: toDateInputValue(lastInclusive),
  };
}
