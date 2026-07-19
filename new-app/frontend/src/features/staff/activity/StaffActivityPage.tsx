/**
 * Staff activity `/staff/activity` — BUTTONS (Step 4).
 * Source: staff_activity_page.dart — AppBar back popOrGo; ListTile has **no** onTap
 * (display-only rows). Period chips already FIELDS.
 * Deferred: listActivityLog → WIRE; ListSkeleton / HexaErrorCard → STATES.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  STAFF_ACT_BACK_FALLBACK,
  STAFF_ACT_DEFAULT_PERIOD,
  STAFF_ACT_EMPTY,
  STAFF_ACT_EMPTY_SUB,
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

export function StaffActivityPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<StaffActPeriod>(STAFF_ACT_DEFAULT_PERIOD);

  function onBack(): void {
    popOrGo(navigate, STAFF_ACT_BACK_FALLBACK);
  }

  return (
    <div
      className="staff-act-page"
      data-page="staff-activity"
      data-period={period}
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
          <div className="staff-act-empty" data-slot="empty">
            <div
              className="staff-act-empty__icon"
              data-slot="emptyIcon"
              aria-hidden="true"
            />
            <p className="staff-act-empty__title">{STAFF_ACT_EMPTY}</p>
            <p className="staff-act-empty__sub">{STAFF_ACT_EMPTY_SUB}</p>
          </div>

          {/* Flutter ListTile: no onTap — display-only until WIRE fills rows */}
          <ul
            className="staff-act-list"
            data-slot="list"
            data-deferred="activity-rows"
            data-interactive="false"
            aria-hidden="true"
            hidden
          >
            <li
              className="staff-act-row"
              data-slot="row"
              data-kind="history"
              data-interactive="false"
            >
              <span
                className="staff-act-row__avatar staff-act-row__avatar--history"
                aria-hidden="true"
              />
              <div className="staff-act-row__body">
                <div className="staff-act-row__title">Signed in</div>
                <div className="staff-act-row__sub" />
              </div>
              <div className="staff-act-row__meta">
                <span className="staff-act-row__ago">just now</span>
                <span className="staff-act-row__when">Jan 1 00:00</span>
              </div>
            </li>
            <li
              className="staff-act-row"
              data-slot="row"
              data-kind="purchase"
              data-interactive="false"
            >
              <span
                className="staff-act-row__avatar staff-act-row__avatar--purchase"
                aria-hidden="true"
              />
              <div className="staff-act-row__body">
                <div className="staff-act-row__title">Purchase saved</div>
                <div className="staff-act-row__sub">Item</div>
              </div>
              <div className="staff-act-row__meta">
                <span className="staff-act-row__ago">1h ago</span>
                <span className="staff-act-row__when">Jan 1 00:00</span>
              </div>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
