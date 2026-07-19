/**
 * Staff activity `/staff/activity` — WIRE (Step 5).
 * Source: staff_activity_page.dart — listActivityLog(period);
 * `_staffActivityLabel` / `_timeAgo` / ListTile display-only (no onTap).
 * Deferred: ListSkeleton / HexaErrorCard polish → STATES.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readPrimaryBusiness } from "../../../shared/auth/sessionStore";
import {
  fetchStaffActivityLog,
  type StaffActLogRow,
} from "./staffActivityApi";
import {
  staffActLabel,
  staffActParseWhen,
  staffActRowKind,
  staffActTimeAgo,
  staffActWhenStamp,
} from "./staffActivityFormat";
import {
  STAFF_ACT_BACK_FALLBACK,
  STAFF_ACT_DEFAULT_PERIOD,
  STAFF_ACT_EMPTY,
  STAFF_ACT_EMPTY_SUB,
  STAFF_ACT_LOAD_FAILED,
  STAFF_ACT_PERIOD_LABEL,
  STAFF_ACT_PERIOD_ORDER,
  STAFF_ACT_TITLE,
  type StaffActPeriod,
} from "./staffActivityCopy";
import "./StaffActivityPage.css";

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

type RowView = {
  key: string;
  actionRaw: string;
  action: string;
  item: string;
  kind: "purchase" | "history";
  ago: string;
  whenStamp: string;
};

function mapRows(rows: StaffActLogRow[], now = new Date()): RowView[] {
  return rows.map((r, i) => {
    const actionRaw = String(r.action_type ?? "");
    const itemName = r.item_name != null ? String(r.item_name) : "";
    const when = staffActParseWhen(r.created_at, now);
    return {
      key: String(r.id ?? `${actionRaw}-${r.created_at ?? i}`),
      actionRaw,
      action: staffActLabel(actionRaw),
      item: itemName.trim(),
      kind: staffActRowKind(actionRaw),
      ago: staffActTimeAgo(when, now),
      whenStamp: staffActWhenStamp(when),
    };
  });
}

export function StaffActivityPage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const businessId = session?.id ?? "";
  const [period, setPeriod] = useState<StaffActPeriod>(STAFF_ACT_DEFAULT_PERIOD);
  const [rows, setRows] = useState<RowView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      setRows([]);
      setLoadError("Not signed in");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void fetchStaffActivityLog(businessId, period)
      .then((data) => {
        if (cancelled) return;
        setRows(mapRows(data));
        setLoadError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setRows([]);
        setLoadError(e);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, period, retryTick]);

  function onBack(): void {
    popOrGo(navigate, STAFF_ACT_BACK_FALLBACK);
  }

  function retryLoad(): void {
    setRetryTick((n) => n + 1);
  }

  const showLoading = loading;
  const showError = !loading && loadError != null;
  const showEmpty = !loading && loadError == null && rows.length === 0;
  const showList = !loading && loadError == null && rows.length > 0;

  return (
    <div
      className="staff-act-page"
      data-page="staff-activity"
      data-period={period}
      data-step="wire"
    >
      <header className="staff-act-appbar" data-slot="appBar">
        <button
          type="button"
          className="staff-act-appbar__back"
          aria-label="Back"
          data-testid="staff-act-back"
          data-action="back"
          onClick={onBack}
        >
          ←
        </button>
        <h1 className="staff-act-appbar__title">{STAFF_ACT_TITLE}</h1>
      </header>

      <main className="staff-act-body" data-slot="body">
        <div
          className="staff-act-periods staff-act-periods--active"
          data-slot="periods"
          role="tablist"
          aria-label="Activity period"
        >
          {STAFF_ACT_PERIOD_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={period === key}
              className={
                period === key
                  ? "staff-act-period staff-act-period--selected"
                  : "staff-act-period"
              }
              data-action="select-period"
              data-period={key}
              onClick={() => setPeriod(key)}
            >
              {STAFF_ACT_PERIOD_LABEL[key]}
            </button>
          ))}
        </div>

        <div className="staff-act-results" data-slot="results">
          {showLoading ? (
            <div className="staff-act-loading" data-slot="loading" role="status">
              Loading…
            </div>
          ) : null}

          {showError ? (
            <div className="staff-act-error" data-slot="error" role="alert">
              <p className="staff-act-error__title">{STAFF_ACT_LOAD_FAILED}</p>
              <button
                type="button"
                className="staff-act-error__retry"
                data-action="retry"
                onClick={retryLoad}
              >
                Retry
              </button>
            </div>
          ) : null}

          {showEmpty ? (
            <div className="staff-act-empty" data-slot="empty">
              <div
                className="staff-act-empty__icon"
                data-slot="emptyIcon"
                aria-hidden="true"
              />
              <p className="staff-act-empty__title">{STAFF_ACT_EMPTY}</p>
              <p className="staff-act-empty__sub">{STAFF_ACT_EMPTY_SUB}</p>
            </div>
          ) : null}

          {showList ? (
            <ul
              className="staff-act-list"
              data-slot="list"
              data-interactive="false"
            >
              {rows.map((row) => (
                <li
                  key={row.key}
                  className="staff-act-row"
                  data-slot="row"
                  data-kind={row.kind}
                  data-interactive="false"
                >
                  <span
                    className={
                      row.kind === "purchase"
                        ? "staff-act-row__avatar staff-act-row__avatar--purchase"
                        : "staff-act-row__avatar staff-act-row__avatar--history"
                    }
                    aria-hidden="true"
                  />
                  <div className="staff-act-row__body">
                    <div className="staff-act-row__title">{row.action}</div>
                    <div className="staff-act-row__sub">{row.item}</div>
                  </div>
                  <div className="staff-act-row__meta">
                    <span className="staff-act-row__ago">{row.ago}</span>
                    <span className="staff-act-row__when">{row.whenStamp}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </main>
    </div>
  );
}
