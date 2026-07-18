import { useState } from "react";
import "./HomePage.css";
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

/**
 * Owner `/home` — Step 3 FIELDS.
 * Period chips + client state (HomePeriodFilterRow / homePeriodProvider).
 * No KPI data or network calls.
 */
export function HomePage() {
  const [period, setPeriod] = useState<HomePeriod>("month");
  const [customRange, setCustomRange] = useState<HomeCustomRange>(() =>
    defaultCustomRange(),
  );

  function selectPeriod(next: HomePeriod) {
    setPeriod(next);
  }

  function onCustomFromChange(value: string) {
    const parsed = parseDateInputValue(value);
    if (!parsed) return;
    setCustomRange((prev) => ({
      start: parsed,
      endInclusive: prev.endInclusive,
    }));
  }

  function onCustomToChange(value: string) {
    const parsed = parseDateInputValue(value);
    if (!parsed) return;
    setCustomRange((prev) => ({
      start: prev.start,
      endInclusive: parsed,
    }));
  }

  return (
    <div className="home-page" data-testid="home-page">
      <header
        className="home-page__header"
        aria-label="Compact header"
        data-slot="compact-header"
      >
        <div className="home-page__avatar" aria-hidden="true">
          W
        </div>
        <div className="home-page__identity">
          <p className="home-page__title">Warehouse</p>
          <div className="home-page__meta">
            <span className="home-page__code">WH-0000</span>
            <span className="home-page__role">OWNER</span>
          </div>
        </div>
        <div className="home-page__header-actions">
          <span className="home-page__sync" aria-label="Sync status">
            <span className="home-page__sync-dot" aria-hidden="true" />
            Synced
          </span>
          <span className="home-page__icon" aria-hidden="true" title="Notifications">
            <BellIcon />
          </span>
          <span className="home-page__icon" aria-hidden="true" title="Settings">
            <SettingsIcon />
          </span>
        </div>
      </header>

      <div
        className="home-page__period"
        aria-label="Period filter"
        data-slot="sticky-period"
      >
        <div
          className="home-page__period-chips"
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
                className={`home-page__period-chip${selected ? " home-page__period-chip--selected" : ""}`}
                onClick={() => selectPeriod(key)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="home-page__period-caption">
          Applies to purchase center and warehouse activity
        </p>
        {period === "custom" ? (
          <div className="home-page__custom-range" data-testid="home-custom-range">
            <label className="home-page__custom-field">
              <span>From</span>
              <input
                type="date"
                value={toDateInputValue(customRange.start)}
                onChange={(e) => onCustomFromChange(e.target.value)}
              />
            </label>
            <label className="home-page__custom-field">
              <span>To</span>
              <input
                type="date"
                value={toDateInputValue(customRange.endInclusive)}
                onChange={(e) => onCustomToChange(e.target.value)}
              />
            </label>
            {!isValidCustomRange(customRange) ? (
              <p className="home-page__custom-error" role="alert">
                From date must be on or before To date
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <main className="home-page__body">
        <SectionCard slot="alerts" title="Alerts" />
        <SectionCard slot="kpi-grid" title="KPI grid" tall />
        <SectionCard slot="delivery" title="Delivery pipeline" />
        <SectionCard slot="purchase-center" title="Purchase control center" />
        <SectionCard slot="tools" title="Owner quick actions" />
        <SectionCard slot="activity" title="Warehouse activity" />
      </main>
    </div>
  );
}

function SectionCard({
  slot,
  title,
  tall,
}: {
  slot: string;
  title: string;
  tall?: boolean;
}) {
  return (
    <section
      className={`home-page__card${tall ? " home-page__card--tall" : ""}`}
      aria-label={title}
      data-slot={slot}
    >
      <h2 className="home-page__card-title">{title}</h2>
    </section>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.77 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.89 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.68.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.25.12.54.02.68-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  );
}
