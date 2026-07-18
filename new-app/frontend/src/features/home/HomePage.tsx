import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import {
  HOME_PERIOD_LABELS,
  HOME_PERIOD_ORDER,
  defaultCustomRange,
  homePeriodApiDates,
  isValidCustomRange,
  parseDateInputValue,
  toDateInputValue,
  type HomeCustomRange,
  type HomePeriod,
} from "./homePeriod";
import { HOME_OWNER_TOOLS } from "./homeOwnerTools";
import {
  fetchHomeOverview,
  type HomeOverviewPayload,
} from "./homeOverviewApi";
import {
  formatRupee,
  inventoryUnitsLine,
  purchasedUnitsLine,
} from "./homeFormatters";
import {
  displayWarehouseTitle,
  readPrimaryBusiness,
  warehouseCodeFromBusinessId,
} from "../../shared/auth/sessionStore";

/**
 * Owner `/home` — Step 5 WIRE.
 * GET …/reports/home-overview (compact + shell_bundle). Not GET /dashboard.
 */
export function HomePage() {
  const navigate = useNavigate();
  const session = readPrimaryBusiness();
  const [period, setPeriod] = useState<HomePeriod>("month");
  const [customRange, setCustomRange] = useState<HomeCustomRange>(() =>
    defaultCustomRange(),
  );
  const [overview, setOverview] = useState<HomeOverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  useEffect(() => {
    if (period === "custom" && !isValidCustomRange(customRange)) {
      return;
    }
    if (!session?.id) {
      setLoading(false);
      setLoadError("Sign in required");
      setOverview(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setLoadError(null);
        try {
          const { from, to } = homePeriodApiDates(period, {
            custom: period === "custom" ? customRange : null,
          });
          const data = await fetchHomeOverview({
            businessId: session.id,
            from,
            to,
          });
          if (!cancelled) {
            setOverview(data);
            setLoadError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setOverview(null);
            setLoadError(
              err instanceof Error ? err.message : "Failed to load dashboard",
            );
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [period, customRange, session?.id]);

  const title = session ? displayWarehouseTitle(session) : "Warehouse";
  const code = session
    ? warehouseCodeFromBusinessId(session.id)
    : "WH-0000";
  const role = (session?.role ?? "owner").toUpperCase();
  const initial = title.trim().charAt(0).toUpperCase() || "W";

  const status = overview?.home_operational?.stock_status_counts;
  const lowAlert = (status?.low ?? 0) + (status?.critical ?? 0);
  const outAlert = status?.out ?? 0;
  const pending =
    overview?.summary.pending_delivery_count ??
    overview?.home_operational?.delivery_pipeline.pending_count ??
    0;
  const received =
    overview?.summary.received_delivery_count ??
    overview?.home_operational?.delivery_pipeline.received_count ??
    0;
  const lowKpi = lowAlert + outAlert;
  const purchaseCount = overview?.summary.deals ?? 0;
  const stock = overview?.stock_in_hand;
  const warehouseValue =
    stock && inventoryUnitsLine(stock) !== "No stock on hand"
      ? inventoryUnitsLine(stock)
      : String(stock?.item_count ?? 0);
  const warehouseSub =
    stock && inventoryUnitsLine(stock) !== "No stock on hand"
      ? `${stock.item_count} items on hand`
      : "Active items";
  const periodLabel = HOME_PERIOD_LABELS[period];
  const unitsLine = overview
    ? purchasedUnitsLine(overview.unit_totals)
    : "";
  const showProfit =
    overview != null && Math.abs(overview.summary.total_profit) > 0.01;

  return (
    <div className="home-page" data-testid="home-page">
      <header
        className="home-page__header"
        aria-label="Compact header"
        data-slot="compact-header"
      >
        <div className="home-page__avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="home-page__identity">
          <p className="home-page__title">{title}</p>
          <div className="home-page__meta">
            <span className="home-page__code">{code}</span>
            <span className="home-page__role">{role}</span>
          </div>
        </div>
        <div className="home-page__header-actions">
          <span className="home-page__sync" aria-label="Sync status">
            <span className="home-page__sync-dot" aria-hidden="true" />
            Synced
          </span>
          <button
            type="button"
            className="home-page__icon-btn"
            title="Notifications"
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <BellIcon />
          </button>
          <button
            type="button"
            className="home-page__icon-btn"
            title="Settings"
            aria-label="Settings"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon />
          </button>
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
        {loading ? (
          <p className="home-page__loading" data-testid="home-loading">
            Loading dashboard…
          </p>
        ) : null}
        {loadError && !loading ? (
          <p className="home-page__load-error" role="alert">
            {loadError}
          </p>
        ) : null}

        <section
          className="home-page__card"
          aria-label="Alerts"
          data-slot="alerts"
        >
          <h2 className="home-page__card-title">Alerts</h2>
          <div className="home-page__alerts">
            {lowAlert > 0 ? (
              <button
                type="button"
                className="home-page__alert home-page__alert--amber"
                onClick={() => navigate("/stock/low-stock")}
              >
                Low stock · {lowAlert}
              </button>
            ) : null}
            {pending > 0 ? (
              <button
                type="button"
                className="home-page__alert home-page__alert--red home-page__alert--filled"
                onClick={() => navigate("/purchase?filter=pending_delivery")}
              >
                Pending delivery · {pending}
              </button>
            ) : null}
            {outAlert > 0 ? (
              <button
                type="button"
                className="home-page__alert home-page__alert--red"
                onClick={() => navigate("/stock?status=out")}
              >
                Out of stock · {outAlert}
              </button>
            ) : null}
            {!loading &&
            lowAlert === 0 &&
            pending === 0 &&
            outAlert === 0 ? (
              <p className="home-page__muted">No alerts</p>
            ) : null}
          </div>
        </section>

        <section
          className="home-page__card home-page__card--tall"
          aria-label="KPI grid"
          data-slot="kpi-grid"
        >
          <h2 className="home-page__card-title">KPI grid</h2>
          <div className="home-page__kpi-grid">
            <KpiTile
              label="Purchases"
              value={String(purchaseCount)}
              subtitle={periodLabel}
              onClick={() => navigate("/purchase")}
            />
            <KpiTile
              label="Pending delivery"
              value={String(pending)}
              subtitle={pending > 0 ? "Needs action" : "Clear"}
              accent={pending > 0}
              onClick={() => navigate("/purchase?filter=pending_delivery")}
            />
            <KpiTile
              label="Low stock"
              value={String(lowKpi)}
              subtitle="Items below reorder"
              onClick={() => navigate("/stock/low-stock")}
            />
            <KpiTile
              label="Warehouse"
              value={warehouseValue}
              subtitle={warehouseSub}
              onClick={() => navigate("/stock")}
            />
          </div>
        </section>

        <section
          className="home-page__card"
          aria-label="Delivery pipeline"
          data-slot="delivery"
        >
          <h2 className="home-page__card-title">Delivery pipeline</h2>
          <button
            type="button"
            className="home-page__pipeline"
            onClick={() => navigate("/purchase?filter=pending_delivery")}
          >
            <span>
              Pending <strong>{pending}</strong>
            </span>
            <span>
              Received <strong>{received}</strong>
            </span>
          </button>
        </section>

        <section
          className="home-page__card home-page__card--purchase"
          aria-label="Purchase control center"
          data-slot="purchase-center"
        >
          <h2 className="home-page__purchase-title">
            Purchases ({periodLabel})
          </h2>
          {unitsLine ? (
            <p className="home-page__purchase-units">{unitsLine}</p>
          ) : (
            <p className="home-page__muted">No purchases in period</p>
          )}
          {overview ? (
            <p className="home-page__purchase-amount">
              <span>{formatRupee(overview.summary.total_purchase)}</span>
              <span className="home-page__purchase-meta">
                {" "}
                · {purchaseCount} bills
              </span>
            </p>
          ) : null}
          <div className="home-page__purchase-chips">
            {received > 0 ? (
              <span className="home-page__meta-chip">{received} received</span>
            ) : null}
            {pending > 0 ? (
              <span className="home-page__meta-chip">
                {pending} pending delivery
              </span>
            ) : null}
            {(overview?.summary.supplier_count ?? 0) > 0 ? (
              <span className="home-page__meta-chip">
                {overview!.summary.supplier_count} suppliers
              </span>
            ) : null}
            {(overview?.summary.broker_count ?? 0) > 0 ? (
              <span className="home-page__meta-chip">
                {overview!.summary.broker_count} brokers
              </span>
            ) : null}
          </div>
          {showProfit && overview ? (
            <p className="home-page__profit">
              Profit {formatRupee(overview.summary.total_profit)}
              {overview.summary.profit_percent != null
                ? ` (${overview.summary.profit_percent.toFixed(1)}%)`
                : ""}
            </p>
          ) : null}
        </section>

        <section
          className="home-page__card"
          aria-label="Owner quick actions"
          data-slot="tools"
        >
          <h2 className="home-page__card-title">Tools</h2>
          <div className="home-page__tools" data-testid="home-owner-tools">
            {HOME_OWNER_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className="home-page__tool"
                style={
                  {
                    "--tool-color": tool.color,
                  } as CSSProperties
                }
                onClick={() => navigate(tool.path)}
              >
                <span className="home-page__tool-label">
                  {tool.label}
                  {tool.id === "low-stock" && lowKpi > 0
                    ? ` (${lowKpi})`
                    : ""}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="home-page__card"
          aria-label="Warehouse activity"
          data-slot="activity"
        >
          <div className="home-page__activity-head">
            <h2 className="home-page__card-title">Warehouse activity</h2>
            <button
              type="button"
              className="home-page__view-all"
              onClick={() => navigate("/home/activity")}
            >
              View all
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function KpiTile({
  label,
  value,
  subtitle,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  subtitle: string;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`home-page__kpi${accent ? " home-page__kpi--accent" : ""}`}
      onClick={onClick}
    >
      <span className="home-page__kpi-label">{label}</span>
      <span className="home-page__kpi-value">{value}</span>
      <span className="home-page__kpi-sub">{subtitle}</span>
    </button>
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
