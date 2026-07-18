/**
 * Owner `/home/activity` — Step 3 FIELDS.
 * Source: home_period_filter_row.dart + `_periodTitle` on activity page.
 * Period chips + custom dates (client state). No back navigate / API.
 */
import { useState } from "react";
import {
  HOME_ACTIVITY_APPBAR_TITLE,
  HOME_ACTIVITY_COL_BILL,
  HOME_ACTIVITY_COL_QTY,
  HOME_ACTIVITY_COL_VERIFIED,
  HOME_ACTIVITY_CUSTOM_RANGE_ERROR,
  HOME_ACTIVITY_PERIOD_CAPTION,
  homeActivityPeriodTitle,
} from "./homeActivityCopy";
import {
  HOME_PERIOD_LABELS,
  HOME_PERIOD_ORDER,
  defaultCustomRange,
  isValidCustomRange,
  parseDateInputValue,
  toDateInputValue,
  type HomeCustomRange,
  type HomePeriod,
} from "./homePeriod";
import "./HomeWarehouseActivityPage.css";

export function HomeWarehouseActivityPage() {
  const [period, setPeriod] = useState<HomePeriod>("month");
  const [customRange, setCustomRange] = useState<HomeCustomRange>(() =>
    defaultCustomRange(),
  );

  function selectPeriod(next: HomePeriod) {
    if (next === "custom" && period !== "custom") {
      setCustomRange(defaultCustomRange());
    }
    setPeriod(next);
  }

  function onCustomFromChange(value: string) {
    const parsed = parseDateInputValue(value);
    if (!parsed) return;
    setCustomRange((prev) => ({ ...prev, start: parsed }));
  }

  function onCustomToChange(value: string) {
    const parsed = parseDateInputValue(value);
    if (!parsed) return;
    setCustomRange((prev) => ({ ...prev, endInclusive: parsed }));
  }

  const listTitle = homeActivityPeriodTitle(period);

  return (
    <div
      className="home-activity-page"
      data-testid="home-warehouse-activity-page"
    >
      <header
        className="home-activity-page__appbar"
        data-slot="appbar"
        data-testid="home-activity-slot-appbar"
      >
        <span
          className="home-activity-page__back"
          data-slot="appbar-leading"
          aria-hidden="true"
        >
          <BackIcon />
        </span>
        <h1 className="home-activity-page__title">{HOME_ACTIVITY_APPBAR_TITLE}</h1>
      </header>

      <div className="home-activity-page__body">
        <div className="home-activity-page__period-block">
          <section
            className="home-activity-page__period-filter"
            data-slot="period-filter"
            data-testid="home-activity-slot-period-filter"
            aria-label="Period filter"
          >
            <div
              className="home-activity-page__period-chips"
              role="listbox"
              aria-label="Period"
            >
              {HOME_PERIOD_ORDER.map((key) => {
                const label = HOME_PERIOD_LABELS[key];
                const selected = period === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`home-activity-page__period-chip${selected ? " home-activity-page__period-chip--selected" : ""}`}
                    onClick={() => selectPeriod(key)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
          <p
            className="home-activity-page__period-caption"
            data-slot="period-caption"
            data-testid="home-activity-slot-period-caption"
          >
            {HOME_ACTIVITY_PERIOD_CAPTION}
          </p>
          {period === "custom" ? (
            <div
              className="home-activity-page__custom-range"
              data-testid="home-activity-custom-range"
            >
              <label className="home-activity-page__custom-field">
                <span>From</span>
                <input
                  type="date"
                  value={toDateInputValue(customRange.start)}
                  onChange={(e) => onCustomFromChange(e.target.value)}
                />
              </label>
              <label className="home-activity-page__custom-field">
                <span>To</span>
                <input
                  type="date"
                  value={toDateInputValue(customRange.endInclusive)}
                  onChange={(e) => onCustomToChange(e.target.value)}
                />
              </label>
              {!isValidCustomRange(customRange) ? (
                <p className="home-activity-page__custom-error" role="alert">
                  {HOME_ACTIVITY_CUSTOM_RANGE_ERROR}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <section
          className="home-activity-page__list"
          data-slot="activity-list"
          data-testid="home-activity-slot-activity-list"
          aria-label="Activity list"
        >
          <div className="home-activity-page__card">
            <div className="home-activity-page__card-head">
              <h2 className="home-activity-page__card-title">{listTitle}</h2>
            </div>
            <div className="home-activity-page__table-header" role="row">
              <span className="home-activity-page__col home-activity-page__col--bill">
                {HOME_ACTIVITY_COL_BILL}
              </span>
              <span className="home-activity-page__col home-activity-page__col--qty">
                {HOME_ACTIVITY_COL_QTY}
              </span>
              <span className="home-activity-page__col home-activity-page__col--verified">
                {HOME_ACTIVITY_COL_VERIFIED}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      className="home-activity-page__back-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H19v-2z" />
    </svg>
  );
}
