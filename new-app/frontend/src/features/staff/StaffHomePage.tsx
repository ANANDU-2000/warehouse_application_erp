import { useCallback, useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearPrimaryBusiness,
  readPrimaryBusiness,
} from "../../shared/auth/sessionStore";
import { clearTokens } from "../../shared/auth/tokenStore";
import {
  STAFF_HOME_ATTENTION,
  STAFF_HOME_FLOOR_KPI_LABELS,
  STAFF_HOME_GREETING_AVATAR_FALLBACK,
  STAFF_HOME_GREETING_NAME_FALLBACK,
  STAFF_HOME_ROLE_LABEL,
  STAFF_HOME_SECTION,
} from "./staffHomeCopy";
import {
  STAFF_HOME_FOCUS_HEADING,
  STAFF_HOME_FOCUS_LABELS,
  STAFF_HOME_FOCUS_ORDER,
  readStaffHomeFocus,
  staffHomeShowsBarcodeTools,
  staffHomeShowsPurchaseTools,
  writeStaffHomeFocus,
  type StaffHomeFocus,
} from "./staffHomeFocus";
import {
  fetchActivityLogToday,
  fetchStaffHomeShell,
  fetchStockAuditFeedToday,
  fetchStockTotals,
  fetchTradePurchasesRecent,
  staffAppPeriodMonthDates,
  StaffHomeApiError,
  StaffHomeNetworkError,
  staffInitials,
  type StaffHomeShellCounts,
  type StockTotalsOut,
} from "./staffHomeApi";
import {
  STAFF_HOME_ACTIVITY_EMPTY,
  STAFF_HOME_ACTIVITY_ERROR,
  STAFF_HOME_ACTIVITY_FULL_LOG,
  STAFF_HOME_ACTIVITY_INNER_SUBTITLE,
  STAFF_HOME_ACTIVITY_INNER_TITLE,
  STAFF_HOME_FLOOR_LOAD_ERROR,
  STAFF_HOME_MARK_ARRIVED,
  STAFF_HOME_NO_CONNECTION,
  STAFF_HOME_PURCHASE_STATS_ERROR,
  STAFF_HOME_RETRY_LABEL,
  STAFF_HOME_RETRY_SUBTITLE,
  STAFF_HOME_SESSION_EXPIRED,
  STAFF_HOME_SHIFT_EMPTY,
  STAFF_HOME_SHIFT_EMPTY_SUBTITLE,
  STAFF_HOME_SHIFT_TILE_LABELS,
  STAFF_HOME_STATS_PURCHASES_SUBTITLE,
  STAFF_HOME_STATS_PURCHASES_TITLE,
  STAFF_HOME_STATS_UNIT_LABELS,
  STAFF_HOME_STATS_WAREHOUSE_SUBTITLE,
  STAFF_HOME_STATS_WAREHOUSE_TITLE,
  STAFF_HOME_VERIFY,
  STAFF_HOME_WAREHOUSE_STATS_ERROR,
  staffHomeViewAllDeliveries,
} from "./staffHomeLoadCopy";
import {
  cardSubtitle,
  cardTitle,
  deliveryNeedsStaffAction,
  showMarkArrived,
  staffPendingDeliveriesFromRows,
  type StaffPendingPurchase,
  type TradePurchaseListRow,
} from "./staffPendingDeliveries";
import {
  emptyStaffTodaySummary,
  staffTodayApiDate,
  staffTodayTotal,
  summarizeStaffToday,
  type StaffTodayActivitySummary,
} from "./staffShiftSummary";
import {
  buildStaffRecentActivity,
  loadBarcodeRecentScans,
  staffActivityTimeAgo,
  type StaffRecentActivityItem,
} from "./staffRecentActivity";
import {
  STAFF_HOME_CLOSE_LABEL,
  STAFF_HOME_LOGOUT_BODY,
  STAFF_HOME_LOGOUT_CANCEL,
  STAFF_HOME_LOGOUT_LABEL,
  STAFF_HOME_LOGOUT_TITLE,
  STAFF_HOME_QUICK_ACTIONS,
  STAFF_HOME_SCAN_CTA_LABEL,
  STAFF_HOME_SCAN_CTA_PATH,
  STAFF_HOME_SETTINGS_LABEL,
  STAFF_HOME_SETTINGS_PATH,
  staffHomeToolsForFocus,
} from "./staffHomeTools";
import "./StaffHomePage.css";

/**
 * Staff home through STATES — exact Flutter load/error/empty copy.
 * Source: staff_home_dashboard_widgets.dart + section_inline_error.dart
 * COMPARE next.
 */

type LoadKind = "session" | "network" | "floor" | null;

function staffHomeLayoutDateLabel(now: Date): string {
  const weekday = now.toLocaleDateString("en-GB", { weekday: "short" });
  const day = String(now.getDate());
  const month = now.toLocaleDateString("en-GB", { month: "short" });
  return `${weekday} ${day} ${month}`;
}

function StaffHomeSectionHeader(props: {
  title: string;
  subtitle: string;
}): ReactElement {
  return (
    <header className="staff-home-section-header">
      <h2 className="staff-home-section-title">{props.title}</h2>
      <p className="staff-home-section-subtitle">{props.subtitle}</p>
    </header>
  );
}

function StaffHomeFocusRadios(props: {
  focus: StaffHomeFocus;
  onFocusChange: (next: StaffHomeFocus) => void;
  name: string;
}): ReactElement {
  return (
    <div
      className="staff-home-focus-list"
      role="radiogroup"
      aria-label={STAFF_HOME_FOCUS_HEADING}
      data-testid="staff-home-focus"
    >
      {STAFF_HOME_FOCUS_ORDER.map((value) => {
        const selected = props.focus === value;
        const inputId = `${props.name}-${value}`;
        return (
          <label
            key={value}
            className={
              selected
                ? "staff-home-focus-option staff-home-focus-option--selected"
                : "staff-home-focus-option"
            }
            htmlFor={inputId}
          >
            <input
              id={inputId}
              type="radio"
              name={props.name}
              value={value}
              checked={selected}
              onChange={() => props.onFocusChange(value)}
            />
            <span
              className="staff-home-focus-radio"
              aria-hidden="true"
              data-selected={selected ? "true" : "false"}
            />
            <span className="staff-home-focus-label">
              {STAFF_HOME_FOCUS_LABELS[value]}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function StaffFloorKpiSkeleton(): ReactElement {
  return (
    <div
      className="staff-home-floor-kpis staff-home-floor-kpis--skeleton"
      data-testid="staff-home-floor-skeleton"
      aria-busy="true"
      aria-label="Loading floor counts"
    >
      <div className="staff-home-kpi-skel" />
      <div className="staff-home-kpi-skel" />
      <div className="staff-home-kpi-skel" />
    </div>
  );
}

function SectionInlineError(props: {
  message: string;
  onRetry: () => void;
  testId?: string;
}): ReactElement {
  return (
    <div
      className="staff-home-inline-error"
      role="alert"
      data-testid={props.testId ?? "staff-home-floor-error"}
    >
      <p className="staff-home-inline-error-msg">{props.message}</p>
      <button
        type="button"
        className="staff-home-retry"
        onClick={props.onRetry}
      >
        {STAFF_HOME_RETRY_LABEL}
      </button>
    </div>
  );
}

/** Flutter StaffHomeWarehousePurchaseStats._fmtNum */
function fmtStatsNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) < 0.001) return String(rounded);
  return n.toFixed(1);
}

const EMPTY_TOTALS: StockTotalsOut = {
  total_items: 0,
  total_bags: 0,
  total_kg: 0,
  total_boxes: 0,
  total_tins: 0,
};

function UnitStatsGrid(props: { totals: StockTotalsOut }): ReactElement {
  const { totals } = props;
  const cells: Array<{ label: string; value: number; color: string }> = [
    {
      label: STAFF_HOME_STATS_UNIT_LABELS.bags,
      value: Number(totals.total_bags ?? 0),
      color: "#0E4F46",
    },
    {
      label: STAFF_HOME_STATS_UNIT_LABELS.kg,
      value: Number(totals.total_kg ?? 0),
      color: "#1565C0",
    },
    {
      label: STAFF_HOME_STATS_UNIT_LABELS.box,
      value: Number(totals.total_boxes ?? 0),
      color: "#6A1B9A",
    },
    {
      label: STAFF_HOME_STATS_UNIT_LABELS.tin,
      value: Number(totals.total_tins ?? 0),
      color: "#E65100",
    },
  ];
  return (
    <div className="staff-home-unit-grid">
      <div className="staff-home-unit-row">
        {cells.slice(0, 2).map((c) => (
          <div key={c.label} className="staff-home-unit-cell">
            <span className="staff-home-unit-value" style={{ color: c.color }}>
              {fmtStatsNum(c.value)}
            </span>
            <span className="staff-home-unit-label">{c.label}</span>
          </div>
        ))}
      </div>
      <div className="staff-home-unit-row">
        {cells.slice(2).map((c) => (
          <div key={c.label} className="staff-home-unit-cell">
            <span className="staff-home-unit-value" style={{ color: c.color }}>
              {fmtStatsNum(c.value)}
            </span>
            <span className="staff-home-unit-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarehousePurchaseStats(props: {
  onHand: StockTotalsOut | null;
  purchases: StockTotalsOut | null;
  loadingOnHand: boolean;
  loadingPurchases: boolean;
  errorOnHand: boolean;
  errorPurchases: boolean;
  onRetryOnHand: () => void;
  onRetryPurchases: () => void;
  onOpenWarehouse: () => void;
  onOpenPurchases: () => void;
}): ReactElement {
  return (
    <div
      className="staff-home-warehouse-stats"
      data-testid="staff-home-warehouse-stats"
    >
      <button
        type="button"
        className="staff-home-stats-box"
        onClick={props.onOpenWarehouse}
        data-testid="staff-home-stats-warehouse"
      >
        <span className="staff-home-stats-box-title">
          {STAFF_HOME_STATS_WAREHOUSE_TITLE}
        </span>
        <span className="staff-home-stats-box-sub">
          {STAFF_HOME_STATS_WAREHOUSE_SUBTITLE}
        </span>
        <div className="staff-home-stats-box-body">
          {props.loadingOnHand ? (
            <div
              className="staff-home-stats-progress"
              role="status"
              aria-label="Loading"
            />
          ) : null}
          {props.errorOnHand ? (
            <SectionInlineError
              message={STAFF_HOME_WAREHOUSE_STATS_ERROR}
              onRetry={props.onRetryOnHand}
              testId="staff-home-warehouse-error"
            />
          ) : null}
          {!props.loadingOnHand && !props.errorOnHand && props.onHand ? (
            <UnitStatsGrid totals={props.onHand} />
          ) : null}
        </div>
      </button>
      <button
        type="button"
        className="staff-home-stats-box"
        onClick={props.onOpenPurchases}
        data-testid="staff-home-stats-purchases"
      >
        <span className="staff-home-stats-box-title">
          {STAFF_HOME_STATS_PURCHASES_TITLE}
        </span>
        <span className="staff-home-stats-box-sub">
          {STAFF_HOME_STATS_PURCHASES_SUBTITLE}
        </span>
        <div className="staff-home-stats-box-body">
          {props.loadingPurchases ? (
            <div
              className="staff-home-stats-progress"
              role="status"
              aria-label="Loading"
            />
          ) : null}
          {props.errorPurchases ? (
            <SectionInlineError
              message={STAFF_HOME_PURCHASE_STATS_ERROR}
              onRetry={props.onRetryPurchases}
              testId="staff-home-purchases-error"
            />
          ) : null}
          {!props.loadingPurchases &&
          !props.errorPurchases &&
          props.purchases ? (
            <UnitStatsGrid totals={props.purchases} />
          ) : null}
        </div>
      </button>
    </div>
  );
}

/**
 * StaffHomePendingDeliveryCards — display + CTAs navigate to /staff/receive
 * until mark-arrived / verify write APIs exist.
 */
function PendingDeliveryCards(props: {
  pending: StaffPendingPurchase[];
  onOpenReceive: () => void;
}): ReactElement | null {
  if (props.pending.length === 0) return null;
  const shown = props.pending.slice(0, 3);
  return (
    <div
      className="staff-home-pending-list"
      data-testid="staff-home-pending-cards"
    >
      {shown.map((p) => {
        const mark = showMarkArrived(p.deliveryStatus);
        const verify = deliveryNeedsStaffAction(p.deliveryStatus);
        return (
          <div key={p.id} className="staff-home-delivery-card">
            <p className="staff-home-delivery-title">{cardTitle(p)}</p>
            <p className="staff-home-delivery-meta">{cardSubtitle(p)}</p>
            {mark || verify ? (
              <div className="staff-home-delivery-actions">
                {mark ? (
                  <button
                    type="button"
                    className="staff-home-delivery-btn staff-home-delivery-btn--filled"
                    onClick={props.onOpenReceive}
                  >
                    {STAFF_HOME_MARK_ARRIVED}
                  </button>
                ) : null}
                {verify ? (
                  <button
                    type="button"
                    className="staff-home-delivery-btn staff-home-delivery-btn--outline"
                    onClick={props.onOpenReceive}
                  >
                    {STAFF_HOME_VERIFY}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
      {props.pending.length > 3 ? (
        <button
          type="button"
          className="staff-home-view-all-deliveries"
          onClick={props.onOpenReceive}
        >
          {staffHomeViewAllDeliveries(props.pending.length)}
        </button>
      ) : null}
    </div>
  );
}

/** Minimal Material-style icons — StaffHomeShiftSnapshotRow _ShiftTile */
function ShiftTileIcon(props: { kind: "scans" | "stock" | "purchases" | "deliveries" }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const,
  };
  if (props.kind === "scans") {
    return (
      <svg {...common}>
        <path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
      </svg>
    );
  }
  if (props.kind === "stock") {
    return (
      <svg {...common}>
        <path d="M21 8l-9-4-9 4v8l9 4 9-4V8z" />
        <path d="M3 8l9 4 9-4M12 12v8" />
      </svg>
    );
  }
  if (props.kind === "purchases") {
    return (
      <svg {...common}>
        <path d="M8 6h13v14H8z" />
        <path d="M8 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
        <path d="M11 11h7M11 15h7" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  );
}

/** StaffHomeShiftSnapshotRow — Scans / Stock / Purchases / Deliveries */
function ShiftSnapshotRow(props: {
  scans: string;
  stock: string;
  purchases: string;
  deliveries: string;
}): ReactElement {
  const tiles: {
    value: string;
    label: string;
    kind: "scans" | "stock" | "purchases" | "deliveries";
  }[] = [
    {
      value: props.scans,
      label: STAFF_HOME_SHIFT_TILE_LABELS.scans,
      kind: "scans",
    },
    {
      value: props.stock,
      label: STAFF_HOME_SHIFT_TILE_LABELS.stock,
      kind: "stock",
    },
    {
      value: props.purchases,
      label: STAFF_HOME_SHIFT_TILE_LABELS.purchases,
      kind: "purchases",
    },
    {
      value: props.deliveries,
      label: STAFF_HOME_SHIFT_TILE_LABELS.deliveries,
      kind: "deliveries",
    },
  ];
  return (
    <div
      className="staff-home-shift-row"
      data-testid="staff-home-shift-row"
    >
      {tiles.map((t, i) => (
        <div key={t.label} className="staff-home-shift-tile-wrap">
          {i > 0 ? (
            <div className="staff-home-shift-divider" aria-hidden="true" />
          ) : null}
          <div className="staff-home-shift-tile">
            <span className="staff-home-shift-icon">
              <ShiftTileIcon kind={t.kind} />
            </span>
            <span className="staff-home-shift-value">{t.value}</span>
            <span className="staff-home-shift-label">{t.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShiftSnapshotStrip(props: {
  loading: boolean;
  error: boolean;
  summary: StaffTodayActivitySummary;
  pendingDel: number;
  onOpenScan: () => void;
}): ReactElement {
  if (props.loading) {
    return (
      <ShiftSnapshotRow
        scans="–"
        stock="–"
        purchases="–"
        deliveries="–"
      />
    );
  }
  if (props.error) {
    return (
      <ShiftSnapshotRow
        scans="–"
        stock="–"
        purchases="–"
        deliveries={props.pendingDel > 0 ? String(props.pendingDel) : "–"}
      />
    );
  }
  if (staffTodayTotal(props.summary) === 0 && props.pendingDel === 0) {
    return (
      <button
        type="button"
        className="staff-home-shift-empty"
        onClick={props.onOpenScan}
        data-testid="staff-home-shift-empty"
      >
        <span className="staff-home-shift-empty-title">
          {STAFF_HOME_SHIFT_EMPTY}
        </span>
        <span className="staff-home-shift-empty-sub">
          {STAFF_HOME_SHIFT_EMPTY_SUBTITLE}
        </span>
      </button>
    );
  }
  return (
    <ShiftSnapshotRow
      scans={String(props.summary.scanned)}
      stock={String(props.summary.stockUpdates)}
      purchases={String(props.summary.purchases)}
      deliveries={String(props.pendingDel)}
    />
  );
}

/** StaffHomeRecentActivitySection — activity log + local scans */
function RecentActivitySection(props: {
  loading: boolean;
  error: boolean;
  items: StaffRecentActivityItem[];
  onOpenActivity: () => void;
  onOpenItem: (itemId: string) => void;
}): ReactElement {
  return (
    <div
      className="staff-home-recent-activity"
      data-testid="staff-home-recent-activity"
    >
      <StaffHomeSectionHeader
        title={STAFF_HOME_ACTIVITY_INNER_TITLE}
        subtitle={STAFF_HOME_ACTIVITY_INNER_SUBTITLE}
      />
      {props.loading ? (
        <div
          className="staff-home-recent-loading"
          data-testid="staff-home-recent-loading"
        >
          <div className="staff-home-recent-spinner" aria-label="Loading" />
        </div>
      ) : null}
      {!props.loading && props.error ? (
        <p className="staff-home-recent-error">{STAFF_HOME_ACTIVITY_ERROR}</p>
      ) : null}
      {!props.loading && !props.error && props.items.length === 0 ? (
        <p className="staff-home-empty-copy">{STAFF_HOME_ACTIVITY_EMPTY}</p>
      ) : null}
      {!props.loading && !props.error && props.items.length > 0 ? (
        <ul className="staff-home-recent-list">
          {props.items.map((item, idx) => {
            const tap =
              item.itemId != null && item.itemId.length > 0
                ? () => props.onOpenItem(item.itemId!)
                : undefined;
            return (
              <li key={`${item.label}-${item.when.getTime()}-${idx}`}>
                {tap ? (
                  <button
                    type="button"
                    className="staff-home-recent-row"
                    onClick={tap}
                  >
                    <RecentActivityRowBody item={item} />
                  </button>
                ) : (
                  <div className="staff-home-recent-row staff-home-recent-row--static">
                    <RecentActivityRowBody item={item} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
      <div className="staff-home-recent-footer">
        <button
          type="button"
          className="staff-home-recent-full-log"
          onClick={props.onOpenActivity}
        >
          {STAFF_HOME_ACTIVITY_FULL_LOG}
        </button>
      </div>
    </div>
  );
}

function RecentActivityRowBody(props: {
  item: StaffRecentActivityItem;
}): ReactElement {
  return (
    <>
      <span
        className={`staff-home-recent-avatar${
          props.item.isScan ? " staff-home-recent-avatar--scan" : ""
        }`}
        aria-hidden="true"
      />
      <span className="staff-home-recent-text">
        <span className="staff-home-recent-title">{props.item.label}</span>
        {props.item.subtitle ? (
          <span className="staff-home-recent-sub">{props.item.subtitle}</span>
        ) : null}
      </span>
      <span className="staff-home-recent-when">
        {staffActivityTimeAgo(props.item.when)}
      </span>
    </>
  );
}

function FriendlyLoadError(props: {
  message: string;
  subtitle: string;
  onRetry: () => void;
}): ReactElement {
  return (
    <div
      className="staff-home-friendly-error"
      role="alert"
      data-testid="staff-home-friendly-error"
    >
      <p className="staff-home-friendly-error-msg">{props.message}</p>
      <p className="staff-home-friendly-error-sub">{props.subtitle}</p>
      <button
        type="button"
        className="staff-home-retry"
        onClick={props.onRetry}
      >
        {STAFF_HOME_RETRY_LABEL}
      </button>
    </div>
  );
}

const EMPTY_COUNTS: StaffHomeShellCounts = {
  displayName: STAFF_HOME_GREETING_NAME_FALLBACK,
  pending: 0,
  delivered: 0,
  lowStock: 0,
  openingCount: 0,
  missingCodeCount: 0,
  mismatchCount: 0,
};

export function StaffHomePage(): ReactElement {
  const navigate = useNavigate();
  const dateLabel = staffHomeLayoutDateLabel(new Date());
  const [focus, setFocus] = useState<StaffHomeFocus>(() => readStaffHomeFocus());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [counts, setCounts] = useState<StaffHomeShellCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [loadKind, setLoadKind] = useState<LoadKind>(null);
  const [retryTick, setRetryTick] = useState(0);

  const [onHand, setOnHand] = useState<StockTotalsOut | null>(null);
  const [purchases, setPurchases] = useState<StockTotalsOut | null>(null);
  const [loadingOnHand, setLoadingOnHand] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [errorOnHand, setErrorOnHand] = useState(false);
  const [errorPurchases, setErrorPurchases] = useState(false);
  const [whRetryTick, setWhRetryTick] = useState(0);
  const [puRetryTick, setPuRetryTick] = useState(0);
  const [pendingDeliveries, setPendingDeliveries] = useState<
    StaffPendingPurchase[]
  >([]);
  const [shiftSummary, setShiftSummary] = useState<StaffTodayActivitySummary>(
    emptyStaffTodaySummary(),
  );
  const [shiftLoading, setShiftLoading] = useState(true);
  const [shiftError, setShiftError] = useState(false);
  const [recentItems, setRecentItems] = useState<StaffRecentActivityItem[]>(
    [],
  );
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(false);

  const reloadShell = useCallback(() => {
    setRetryTick((n) => n + 1);
  }, []);

  const reloadOnHand = useCallback(() => {
    setWhRetryTick((n) => n + 1);
  }, []);

  const reloadPurchases = useCallback(() => {
    setPuRetryTick((n) => n + 1);
  }, []);

  useEffect(() => {
    const biz = readPrimaryBusiness();
    if (!biz?.id) {
      setLoading(false);
      setLoadKind("session");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadKind(null);
    void fetchStaffHomeShell(biz.id)
      .then((shell) => {
        if (!cancelled) {
          setCounts(shell);
          setLoadKind(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoading(false);
        if (
          err instanceof StaffHomeApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          setLoadKind("session");
          return;
        }
        if (err instanceof StaffHomeNetworkError) {
          setLoadKind("network");
          return;
        }
        setLoadKind("floor");
      });
    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  /* WIRE-2a: stockOnHandTotalsProvider + stockTotalsProvider(AppPeriod.month) */
  useEffect(() => {
    const biz = readPrimaryBusiness();
    if (!biz?.id) {
      setLoadingOnHand(false);
      setOnHand(EMPTY_TOTALS);
      setErrorOnHand(false);
      return;
    }
    let cancelled = false;
    setLoadingOnHand(true);
    setErrorOnHand(false);
    void fetchStockTotals({ businessId: biz.id })
      .then((data) => {
        if (!cancelled) {
          setOnHand(data);
          setLoadingOnHand(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOnHand(null);
          setErrorOnHand(true);
          setLoadingOnHand(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [whRetryTick]);

  useEffect(() => {
    const biz = readPrimaryBusiness();
    if (!biz?.id) {
      setLoadingPurchases(false);
      setPurchases(EMPTY_TOTALS);
      setErrorPurchases(false);
      return;
    }
    let cancelled = false;
    setLoadingPurchases(true);
    setErrorPurchases(false);
    const { periodStart, periodEnd } = staffAppPeriodMonthDates();
    void fetchStockTotals({
      businessId: biz.id,
      periodStart,
      periodEnd,
    })
      .then((data) => {
        if (!cancelled) {
          setPurchases(data);
          setLoadingPurchases(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPurchases(null);
          setErrorPurchases(true);
          setLoadingPurchases(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [puRetryTick]);

  /* WIRE-2b: staffPendingDeliveriesProvider via trade-purchases limit 50 */
  useEffect(() => {
    const biz = readPrimaryBusiness();
    if (!biz?.id) {
      setPendingDeliveries([]);
      return;
    }
    let cancelled = false;
    void fetchTradePurchasesRecent(biz.id)
      .then((rows) => {
        if (cancelled) return;
        setPendingDeliveries(
          staffPendingDeliveriesFromRows(rows as TradePurchaseListRow[]),
        );
      })
      .catch(() => {
        if (!cancelled) setPendingDeliveries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  /* WIRE-2c: staffTodayActivity + staffTodayStockWork → summarizeStaffToday */
  useEffect(() => {
    const biz = readPrimaryBusiness();
    if (!biz?.id) {
      setShiftLoading(false);
      setShiftSummary(emptyStaffTodaySummary());
      setShiftError(false);
      return;
    }
    let cancelled = false;
    setShiftLoading(true);
    setShiftError(false);
    const onDate = staffTodayApiDate();
    void Promise.all([
      fetchActivityLogToday(biz.id),
      fetchStockAuditFeedToday(biz.id, onDate),
    ])
      .then(([activityRows, auditRows]) => {
        if (cancelled) return;
        setShiftSummary(summarizeStaffToday({ activityRows, auditRows }));
        setShiftLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setShiftSummary(emptyStaffTodaySummary());
        setShiftError(true);
        setShiftLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  /* WIRE-2d: staffRecentActivityProvider — activity-log + local scans */
  useEffect(() => {
    const biz = readPrimaryBusiness();
    if (!biz?.id) {
      setRecentLoading(false);
      setRecentItems([]);
      setRecentError(false);
      return;
    }
    let cancelled = false;
    setRecentLoading(true);
    setRecentError(false);
    void fetchActivityLogToday(biz.id)
      .then((activityRows) => {
        if (cancelled) return;
        const scans = loadBarcodeRecentScans(8);
        setRecentItems(buildStaffRecentActivity({ activityRows, scans }));
        setRecentLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setRecentItems([]);
        setRecentError(true);
        setRecentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  function onFocusChange(next: StaffHomeFocus): void {
    setFocus(next);
    writeStaffHomeFocus(next);
  }

  function confirmLogout(): void {
    clearTokens();
    clearPrimaryBusiness();
    setLogoutOpen(false);
    setSheetOpen(false);
    navigate("/login", { replace: true });
  }

  function onSessionExpiredRetry(): void {
    clearTokens();
    clearPrimaryBusiness();
    navigate("/login", { replace: true });
  }

  const tools = staffHomeToolsForFocus(focus);
  const displayName = counts.displayName || STAFF_HOME_GREETING_NAME_FALLBACK;
  const avatarLetter =
    staffInitials(displayName) || STAFF_HOME_GREETING_AVATAR_FALLBACK;

  const showOpening = counts.openingCount > 0;
  const showMissing =
    staffHomeShowsBarcodeTools(focus) && counts.missingCodeCount > 0;
  const showMismatch = counts.mismatchCount > 0;
  const showAttentionFlag =
    (staffHomeShowsPurchaseTools(focus) && counts.pending > 0) ||
    counts.lowStock > 0 ||
    counts.openingCount > 0 ||
    (staffHomeShowsBarcodeTools(focus) && counts.missingCodeCount > 0) ||
    counts.mismatchCount > 0;
  const showAttentionSection =
    showAttentionFlag && (showOpening || showMissing || showMismatch);

  const showBlockingError =
    !loading && (loadKind === "session" || loadKind === "network");
  const showMain = !showBlockingError;

  return (
    <div className="staff-home-page" data-testid="staff-home-page">
      <div className="staff-home-scroll">
        <div className="staff-home-inner">
          <header
            className="staff-home-greeting"
            data-slot="greeting"
            data-testid="staff-home-slot-greeting"
          >
            <button
              type="button"
              className="staff-home-greeting-main staff-home-greeting-main--button"
              onClick={() => setSheetOpen(true)}
              aria-label="Open profile"
              disabled={loading}
            >
              <div className="staff-home-avatar" aria-hidden="true">
                {avatarLetter}
              </div>
              <div className="staff-home-greeting-text">
                <p className="staff-home-greeting-name-row">
                  <span className="staff-home-greeting-name">{displayName}</span>
                  <span className="staff-home-greeting-role">
                    {STAFF_HOME_ROLE_LABEL}
                  </span>
                </p>
                <p className="staff-home-greeting-date">{dateLabel}</p>
              </div>
            </button>
            <button
              type="button"
              className="staff-home-bell"
              aria-label="Notifications"
              title="Notifications"
              disabled={loading}
              onClick={() => navigate("/notifications")}
            >
              <span className="staff-home-bell-icon" aria-hidden="true" />
            </button>
          </header>

          {!loading && loadKind === "session" ? (
            <FriendlyLoadError
              message={STAFF_HOME_SESSION_EXPIRED}
              subtitle={STAFF_HOME_RETRY_SUBTITLE}
              onRetry={onSessionExpiredRetry}
            />
          ) : null}

          {!loading && loadKind === "network" ? (
            <FriendlyLoadError
              message={STAFF_HOME_NO_CONNECTION}
              subtitle={STAFF_HOME_RETRY_SUBTITLE}
              onRetry={reloadShell}
            />
          ) : null}

          {showMain ? (
            <>
              <section
                className="staff-home-card"
                data-slot="floor-kpis"
                data-testid="staff-home-slot-floor-kpis"
                aria-label="Floor KPIs"
              >
                {loading ? (
                  <StaffFloorKpiSkeleton />
                ) : loadKind === "floor" ? (
                  <SectionInlineError
                    message={STAFF_HOME_FLOOR_LOAD_ERROR}
                    onRetry={reloadShell}
                  />
                ) : (
                  <div className="staff-home-floor-kpis">
                    <button
                      type="button"
                      className="staff-home-kpi"
                      onClick={() => navigate("/staff/deliveries")}
                    >
                      <span className="staff-home-kpi-value">
                        {counts.pending}
                      </span>
                      <span className="staff-home-kpi-label">
                        {STAFF_HOME_FLOOR_KPI_LABELS.pending}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="staff-home-kpi"
                      onClick={() => navigate("/staff/deliveries")}
                    >
                      <span className="staff-home-kpi-value">
                        {counts.delivered}
                      </span>
                      <span className="staff-home-kpi-label">
                        {STAFF_HOME_FLOOR_KPI_LABELS.delivered}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="staff-home-kpi"
                      onClick={() => navigate("/staff/low-stock")}
                    >
                      <span className="staff-home-kpi-value">
                        {counts.lowStock}
                      </span>
                      <span className="staff-home-kpi-label">
                        {STAFF_HOME_FLOOR_KPI_LABELS.lowStock}
                      </span>
                    </button>
                  </div>
                )}
              </section>

              <section
                className="staff-home-card"
                data-slot="warehouse"
                data-testid="staff-home-slot-warehouse"
              >
                <StaffHomeSectionHeader
                  title={STAFF_HOME_SECTION.warehouse.title}
                  subtitle={STAFF_HOME_SECTION.warehouse.subtitle}
                />
                <WarehousePurchaseStats
                  onHand={onHand}
                  purchases={purchases}
                  loadingOnHand={loadingOnHand}
                  loadingPurchases={loadingPurchases}
                  errorOnHand={errorOnHand}
                  errorPurchases={errorPurchases}
                  onRetryOnHand={reloadOnHand}
                  onRetryPurchases={reloadPurchases}
                  onOpenWarehouse={() => navigate("/staff/stock")}
                  onOpenPurchases={() => navigate("/staff/deliveries")}
                />
              </section>

              {pendingDeliveries.length > 0 ? (
                <section
                  className="staff-home-card"
                  data-slot="pending-deliveries"
                  data-testid="staff-home-slot-pending-deliveries"
                >
                  <StaffHomeSectionHeader
                    title={STAFF_HOME_SECTION.pendingDeliveries.title}
                    subtitle={STAFF_HOME_SECTION.pendingDeliveries.subtitle}
                  />
                  <PendingDeliveryCards
                    pending={pendingDeliveries}
                    onOpenReceive={() => navigate("/staff/receive")}
                  />
                </section>
              ) : (
                <section
                  className="staff-home-card"
                  data-slot="pending-deliveries"
                  data-testid="staff-home-slot-pending-deliveries"
                  hidden
                  aria-hidden="true"
                />
              )}

              <section
                className="staff-home-card"
                data-slot="shift-today"
                data-testid="staff-home-slot-shift-today"
              >
                <StaffHomeSectionHeader
                  title={STAFF_HOME_SECTION.shiftToday.title}
                  subtitle={STAFF_HOME_SECTION.shiftToday.subtitle}
                />
                <ShiftSnapshotStrip
                  loading={shiftLoading}
                  error={shiftError}
                  summary={shiftSummary}
                  pendingDel={counts.pending}
                  onOpenScan={() => navigate("/barcode/scan")}
                />
              </section>

              <section
                className="staff-home-card"
                data-slot="tools"
                data-testid="staff-home-slot-tools"
              >
                <StaffHomeSectionHeader
                  title={STAFF_HOME_SECTION.tools.title}
                  subtitle={STAFF_HOME_SECTION.tools.subtitle}
                />
                <div className="staff-home-tools-grid">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      className="staff-home-tool"
                      style={{
                        ["--staff-tool-color" as string]: tool.color,
                      }}
                      disabled={loading}
                      onClick={() => navigate(tool.path)}
                    >
                      <span className="staff-home-tool-label">
                        {tool.label}
                        {tool.badgeKey === "lowStock" && counts.lowStock > 0
                          ? ` (${counts.lowStock})`
                          : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section
                className="staff-home-card"
                data-slot="quick-actions"
                data-testid="staff-home-slot-quick-actions"
              >
                <StaffHomeSectionHeader
                  title={STAFF_HOME_SECTION.quickActions.title}
                  subtitle={STAFF_HOME_SECTION.quickActions.subtitle}
                />
                <div className="staff-home-quick-actions">
                  {STAFF_HOME_QUICK_ACTIONS.map((action) => {
                    let badge = 0;
                    if (action.id === "deliveries") badge = counts.pending;
                    if (action.id === "low-stock") badge = counts.lowStock;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        className="staff-home-quick-action"
                        disabled={loading}
                        onClick={() => navigate(action.path)}
                      >
                        {action.label}
                        {badge > 0 ? ` (${badge})` : ""}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section
                className="staff-home-card"
                data-slot="scan-cta"
                data-testid="staff-home-slot-scan-cta"
              >
                <StaffHomeSectionHeader
                  title={STAFF_HOME_SECTION.scanCta.title}
                  subtitle={STAFF_HOME_SECTION.scanCta.subtitle}
                />
                <button
                  type="button"
                  className="staff-home-scan-cta"
                  disabled={loading}
                  onClick={() => navigate(STAFF_HOME_SCAN_CTA_PATH)}
                >
                  {STAFF_HOME_SCAN_CTA_LABEL}
                </button>
              </section>

              {showAttentionSection && !loading && loadKind === null ? (
                <section
                  className="staff-home-card"
                  data-slot="needs-attention"
                  data-testid="staff-home-slot-needs-attention"
                >
                  <StaffHomeSectionHeader
                    title={STAFF_HOME_SECTION.needsAttention.title}
                    subtitle={STAFF_HOME_SECTION.needsAttention.subtitle}
                  />
                  <div className="staff-home-attention-list">
                    {showOpening ? (
                      <button
                        type="button"
                        className="staff-home-attention"
                        onClick={() =>
                          navigate(STAFF_HOME_ATTENTION.opening.path)
                        }
                      >
                        <span className="staff-home-attention-title">
                          {STAFF_HOME_ATTENTION.opening.title}
                        </span>
                        <span className="staff-home-attention-sub">
                          {STAFF_HOME_ATTENTION.opening.subtitle}
                        </span>
                        <span className="staff-home-attention-count">
                          {counts.openingCount}
                        </span>
                      </button>
                    ) : null}
                    {showMissing ? (
                      <button
                        type="button"
                        className="staff-home-attention"
                        onClick={() =>
                          navigate(STAFF_HOME_ATTENTION.missingBarcodes.path)
                        }
                      >
                        <span className="staff-home-attention-title">
                          {STAFF_HOME_ATTENTION.missingBarcodes.title}
                        </span>
                        <span className="staff-home-attention-sub">
                          {STAFF_HOME_ATTENTION.missingBarcodes.subtitle}
                        </span>
                        <span className="staff-home-attention-count">
                          {counts.missingCodeCount}
                        </span>
                      </button>
                    ) : null}
                    {showMismatch ? (
                      <button
                        type="button"
                        className="staff-home-attention"
                        onClick={() =>
                          navigate(STAFF_HOME_ATTENTION.mismatch.path)
                        }
                      >
                        <span className="staff-home-attention-title">
                          {STAFF_HOME_ATTENTION.mismatch.title}
                        </span>
                        <span className="staff-home-attention-sub">
                          {STAFF_HOME_ATTENTION.mismatch.subtitle}
                        </span>
                        <span className="staff-home-attention-count">
                          {counts.mismatchCount}
                        </span>
                      </button>
                    ) : null}
                  </div>
                </section>
              ) : (
                <section
                  className="staff-home-card"
                  data-slot="needs-attention"
                  data-testid="staff-home-slot-needs-attention"
                >
                  <StaffHomeSectionHeader
                    title={STAFF_HOME_SECTION.needsAttention.title}
                    subtitle={STAFF_HOME_SECTION.needsAttention.subtitle}
                  />
                </section>
              )}

              <section
                className="staff-home-card"
                data-slot="recent-activity"
                data-testid="staff-home-slot-recent-activity"
              >
                <StaffHomeSectionHeader
                  title={STAFF_HOME_SECTION.recentActivity.title}
                  subtitle={STAFF_HOME_SECTION.recentActivity.subtitle}
                />
                <RecentActivitySection
                  loading={recentLoading}
                  error={recentError}
                  items={recentItems}
                  onOpenActivity={() => navigate("/staff/activity")}
                  onOpenItem={(itemId) =>
                    navigate(`/catalog/item/${itemId}?source=scan`)
                  }
                />
              </section>
            </>
          ) : null}
        </div>
      </div>

      {sheetOpen ? (
        <div
          className="staff-home-sheet-backdrop"
          role="presentation"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="staff-home-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Staff profile"
            data-testid="staff-home-profile-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-home-sheet-profile">
              <div className="staff-home-avatar staff-home-avatar--sheet">
                {avatarLetter}
              </div>
              <div>
                <p className="staff-home-sheet-name">{displayName}</p>
                <p className="staff-home-sheet-role">Role: Staff</p>
              </div>
            </div>

            <button
              type="button"
              className="staff-home-sheet-row"
              onClick={() => {
                setSheetOpen(false);
                navigate(STAFF_HOME_SETTINGS_PATH);
              }}
            >
              {STAFF_HOME_SETTINGS_LABEL}
            </button>

            <h2 className="staff-home-focus-heading">{STAFF_HOME_FOCUS_HEADING}</h2>
            <StaffHomeFocusRadios
              focus={focus}
              onFocusChange={onFocusChange}
              name="staff-home-focus-sheet"
            />

            <button
              type="button"
              className="staff-home-sheet-logout"
              onClick={() => setLogoutOpen(true)}
            >
              {STAFF_HOME_LOGOUT_LABEL}
            </button>

            <button
              type="button"
              className="staff-home-sheet-close"
              onClick={() => setSheetOpen(false)}
            >
              {STAFF_HOME_CLOSE_LABEL}
            </button>
          </div>
        </div>
      ) : null}

      {logoutOpen ? (
        <div
          className="staff-home-dialog-backdrop"
          role="presentation"
          onClick={() => setLogoutOpen(false)}
        >
          <div
            className="staff-home-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="staff-home-logout-title"
            aria-describedby="staff-home-logout-body"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="staff-home-logout-title" className="staff-home-dialog-title">
              {STAFF_HOME_LOGOUT_TITLE}
            </h2>
            <p id="staff-home-logout-body" className="staff-home-dialog-body">
              {STAFF_HOME_LOGOUT_BODY}
            </p>
            <div className="staff-home-dialog-actions">
              <button
                type="button"
                className="staff-home-dialog-cancel"
                onClick={() => setLogoutOpen(false)}
              >
                {STAFF_HOME_LOGOUT_CANCEL}
              </button>
              <button
                type="button"
                className="staff-home-dialog-confirm"
                onClick={confirmLogout}
              >
                {STAFF_HOME_LOGOUT_LABEL}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
