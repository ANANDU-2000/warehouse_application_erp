/**
 * Staff activity `/staff/activity` — SCAFFOLD (Step 1).
 * Source: staff_activity_page.dart StaffActivityPage.
 * Deferred: period selection → FIELDS; listActivityLog → WIRE;
 * ListSkeleton / HexaErrorCard → STATES.
 */
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
  /** SCAFFOLD: fixed today; FIELDS activates SegmentedButton. */
  const period: StaffActPeriod = STAFF_ACT_DEFAULT_PERIOD;

  return (
    <div className="staff-act-page" data-page="staff-activity">
      <header className="staff-act-appbar" data-slot="appBar">
        <button
          type="button"
          className="staff-act-appbar__back"
          aria-label="Back"
          data-testid="staff-act-back"
          onClick={() => popOrGo(navigate, STAFF_ACT_BACK_FALLBACK)}
        >
          ←
        </button>
        <h1 className="staff-act-appbar__title">{STAFF_ACT_TITLE}</h1>
      </header>

      <main className="staff-act-body" data-slot="body">
        <div
          className="staff-act-periods"
          data-slot="periods"
          data-deferred="period-select"
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
              disabled
              data-deferred="period-select"
            >
              {STAFF_ACT_PERIOD_LABEL[key]}
            </button>
          ))}
        </div>

        <div className="staff-act-results" data-slot="results">
          <div className="staff-act-empty" data-slot="empty">
            <div className="staff-act-empty__icon" aria-hidden="true">
              ⏱
            </div>
            <p className="staff-act-empty__title">{STAFF_ACT_EMPTY}</p>
            <p className="staff-act-empty__sub">{STAFF_ACT_EMPTY_SUB}</p>
          </div>

          {/* LAYOUT/WIRE sample row chrome — hidden until WIRE */}
          <ul
            className="staff-act-list"
            data-slot="list"
            data-deferred="activity-rows"
            aria-hidden="true"
            hidden
          >
            <li className="staff-act-row" data-slot="row">
              <span className="staff-act-row__avatar" aria-hidden="true" />
              <div className="staff-act-row__body">
                <div className="staff-act-row__title">Signed in</div>
                <div className="staff-act-row__sub" />
              </div>
              <div className="staff-act-row__meta">
                <span className="staff-act-row__ago">just now</span>
                <span className="staff-act-row__when">Jan 1 00:00</span>
              </div>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
