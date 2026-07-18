/**
 * Owner `/home/activity` — Step 5 WIRE.
 * Source: home_warehouse_activity_page.dart + _fetchHomeWarehouseActivity.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  fetchHomeWarehouseActivity,
  type HomeActivityItem,
} from "./homeActivityFeed";
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
import { readPrimaryBusiness } from "../../shared/auth/sessionStore";
import { warehouseActivityDeliveryUnitsLabel } from "./homeActivityUnits";
import "./HomeWarehouseActivityPage.css";

/** Flutter navigation_ext.popOrGo — pop when stack allows, else go fallback. */
function popOrGo(navigate: ReturnType<typeof useNavigate>, fallback: string) {
  const idx =
    typeof window !== "undefined" &&
    window.history.state &&
    typeof (window.history.state as { idx?: unknown }).idx === "number"
      ? (window.history.state as { idx: number }).idx
      : 0;
  if (idx > 0) {
    navigate(-1);
    return;
  }
  navigate(fallback, { replace: true });
}

export const HOME_ACTIVITY_LOADING = "Loading activity…";

export function HomeWarehouseActivityPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<HomePeriod>("month");
  const [customRange, setCustomRange] = useState<HomeCustomRange>(() =>
    defaultCustomRange(),
  );
  const [items, setItems] = useState<HomeActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  function handleBack() {
    popOrGo(navigate, "/home");
  }

  useEffect(() => {
    if (period === "custom" && !isValidCustomRange(customRange)) {
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const session = readPrimaryBusiness();
      if (!session?.id) {
        setLoading(false);
        setLoadError("Session expired");
        setItems([]);
        return;
      }
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setLoadError(null);
      void fetchHomeWarehouseActivity({
        businessId: session.id,
        period,
        custom: period === "custom" ? customRange : null,
        signal: ac.signal,
      })
        .then((rows) => {
          if (ac.signal.aborted) return;
          setItems(rows);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted) return;
          const msg =
            err instanceof Error ? err.message : "Could not load activity";
          setLoadError(msg);
          setItems([]);
          setLoading(false);
        });
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [period, customRange]);

  const listTitle = homeActivityPeriodTitle(period);
  const eventsLabel = `${items.length} events in period`;

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
        <button
          type="button"
          className="home-activity-page__back"
          data-slot="appbar-leading"
          aria-label="Back"
          onClick={handleBack}
        >
          <BackIcon />
        </button>
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
                    disabled={loading}
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
                  disabled={loading}
                  onChange={(e) => onCustomFromChange(e.target.value)}
                />
              </label>
              <label className="home-activity-page__custom-field">
                <span>To</span>
                <input
                  type="date"
                  value={toDateInputValue(customRange.endInclusive)}
                  disabled={loading}
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
          aria-busy={loading}
        >
          {loading ? (
            <p className="home-activity-page__loading" role="status">
              {HOME_ACTIVITY_LOADING}
            </p>
          ) : null}
          {!loading && loadError ? (
            <p className="home-activity-page__load-error" role="alert">
              {loadError}
            </p>
          ) : null}
          {!loading && !loadError ? (
            <div className="home-activity-page__card">
              <div className="home-activity-page__card-head">
                <h2 className="home-activity-page__card-title">{listTitle}</h2>
                <p className="home-activity-page__card-meta">{eventsLabel}</p>
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
              {items.map((item, i) => (
                <ActivityRow key={`${item.kind}-${item.at.toISOString()}-${i}`} item={item} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: HomeActivityItem }) {
  const bill =
    item.humanId?.trim() ||
    item.createdBy?.trim() ||
    item.actor?.trim() ||
    item.subtitle;
  const entered = item.createdBy?.trim() || item.actor?.trim();
  const units = warehouseActivityDeliveryUnitsLabel({
    unitsLine: item.unitsLine,
    qtyChange: item.qtyChange,
  });
  const verified = item.verifiedBy?.trim() || "—";
  return (
    <div className="home-activity-page__row" role="row">
      <div className="home-activity-page__col home-activity-page__col--bill">
        <div className="home-activity-page__row-title">{item.title}</div>
        <div className="home-activity-page__row-sub">
          {bill}
          {entered ? ` · ${entered}` : ""}
        </div>
      </div>
      <div className="home-activity-page__col home-activity-page__col--qty">
        {units}
      </div>
      <div className="home-activity-page__col home-activity-page__col--verified">
        {verified}
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
