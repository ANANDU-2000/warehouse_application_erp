/**
 * Staff home WIRE APIs — Flutter-exact paths (dashboard.md §16 Staff).
 * Do not call owner reports overview from staff UI.
 */
import { readTokens } from "../../shared/auth/tokenStore";

export type MeProfile = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  is_super_admin: boolean;
};

export type DeliveryPipeline = {
  pending: number;
  dispatched: number;
  in_transit: number;
  arrived: number;
  staff_verifying: number;
  staff_verified: number;
  partial: number;
  stock_committed: number;
  cancelled: number;
  total_pending_amount: string;
};

export type StockListOut = {
  items: Array<{
    id: string;
    name: string;
    item_code: string | null;
    current_stock: number;
    reorder_level: number;
    unit: string | null;
  }>;
  total: number;
  page: number;
  per_page: number;
};

export type OpeningMissingOut = {
  items: unknown[];
  missing_count: number;
};

/** FastAPI StockTotalsOut */
export type StockTotalsOut = {
  total_items: number;
  total_bags: number;
  total_kg: number;
  total_boxes: number;
  total_tins: number;
};

export type StaffHomeShellCounts = {
  displayName: string;
  pending: number;
  delivered: number;
  lowStock: number;
  openingCount: number;
  missingCodeCount: number;
  mismatchCount: number;
};

export class StaffHomeApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "StaffHomeApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class StaffHomeNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffHomeNetworkError";
  }
}

async function readDetail(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (
      body &&
      typeof body === "object" &&
      "detail" in body &&
      typeof (body as { detail: unknown }).detail === "string"
    ) {
      return (body as { detail: string }).detail;
    }
  } catch {
    /* ignore */
  }
  return "Something went wrong. Please try again.";
}

async function authGet(url: string): Promise<Response> {
  const token = readTokens()?.access_token;
  if (!token) {
    throw new StaffHomeApiError(401, "Not signed in");
  }
  try {
    return await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new StaffHomeNetworkError(msg);
  }
}

/** Flutter deliveryPipelinePendingCount */
export function deliveryPipelinePendingCount(p: DeliveryPipeline): number {
  return (
    Number(p.pending || 0) +
    Number(p.dispatched || 0) +
    Number(p.in_transit || 0) +
    Number(p.arrived || 0) +
    Number(p.staff_verifying || 0) +
    Number(p.staff_verified || 0) +
    Number(p.partial || 0)
  );
}

export function displayNameFromProfile(p: MeProfile): string {
  const name = (p.name ?? "").trim();
  if (name) return name;
  const user = (p.username ?? "").trim();
  if (user) return user;
  return "Staff";
}

export function staffInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "S";
  return parts.map((w) => w[0]!.toUpperCase()).join("");
}

export async function fetchMeProfile(): Promise<MeProfile> {
  const res = await authGet("/v1/me/profile");
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  return (await res.json()) as MeProfile;
}

export async function fetchDeliveryPipeline(
  businessId: string,
): Promise<DeliveryPipeline> {
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/trade-purchases/delivery-pipeline`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  return (await res.json()) as DeliveryPipeline;
}

export async function fetchLowStockList(businessId: string): Promise<StockListOut> {
  const qs = new URLSearchParams({
    page: "1",
    per_page: "8",
    status: "low",
    sort: "stock_asc",
  });
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/stock/list?${qs}`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  return (await res.json()) as StockListOut;
}

export async function fetchOpeningMissing(
  businessId: string,
): Promise<OpeningMissingOut> {
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/stock/opening/missing`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  return (await res.json()) as OpeningMissingOut;
}

/**
 * Missing item_code count — FastAPI supports missing_item_code=true
 * (same filter as Flutter client empty item_code). Use total.
 */
export async function fetchMissingItemCodeTotal(
  businessId: string,
): Promise<number> {
  const qs = new URLSearchParams({
    page: "1",
    per_page: "1",
    status: "all",
    sort: "name",
    missing_item_code: "true",
  });
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/stock/list?${qs}`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  const body = (await res.json()) as StockListOut;
  return Number(body.total ?? 0);
}

export async function fetchVariancesTodayCount(
  businessId: string,
): Promise<number> {
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/stock/variances/today`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  const rows = (await res.json()) as unknown[];
  return Array.isArray(rows) ? rows.length : 0;
}

/**
 * GET …/stock/totals — on-hand when no period; purchased when period_start/end set.
 * Source: hexa_api.getStockTotals / stock_ops.stock_totals
 */
export async function fetchStockTotals(args: {
  businessId: string;
  periodStart?: string;
  periodEnd?: string;
}): Promise<StockTotalsOut> {
  const qs = new URLSearchParams();
  if (args.periodStart && args.periodEnd) {
    qs.set("period_start", args.periodStart);
    qs.set("period_end", args.periodEnd);
  }
  const q = qs.toString();
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(args.businessId)}/stock/totals${
      q ? `?${q}` : ""
    }`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  return (await res.json()) as StockTotalsOut;
}

/** AppPeriod.month — calendar month day 1 → today (app_period_provider.dart). */
export function staffAppPeriodMonthDates(now = new Date()): {
  periodStart: string;
  periodEnd: string;
} {
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const periodStart = `${y}-${pad(m + 1)}-01`;
  const periodEnd = `${y}-${pad(m + 1)}-${pad(now.getDate())}`;
  return { periodStart, periodEnd };
}

/** GET …/activity-log?period=today — staffTodayActivityProvider */
export async function fetchActivityLogToday(
  businessId: string,
): Promise<Record<string, unknown>[]> {
  const q = new URLSearchParams({
    period: "today",
    page: "1",
    per_page: "80",
  });
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/activity-log?${q}`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((e) =>
    e && typeof e === "object" ? (e as Record<string, unknown>) : {},
  );
}

/** GET …/stock/audit/feed?on=&limit=200 — staffTodayStockWorkProvider */
export async function fetchStockAuditFeedToday(
  businessId: string,
  onDate: string,
): Promise<Record<string, unknown>[]> {
  const q = new URLSearchParams({
    limit: "200",
    on: onDate,
  });
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/stock/audit/feed?${q}`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((e) =>
    e && typeof e === "object" ? (e as Record<string, unknown>) : {},
  );
}

/**
 * Recent trade purchases snapshot — api_read_snapshots tradePurchasesRecentSnapshot
 * listTradePurchases(limit: 50), include_lines default false.
 */
export async function fetchTradePurchasesRecent(
  businessId: string,
): Promise<Record<string, unknown>[]> {
  const want = 50;
  const out: Record<string, unknown>[] = [];
  let offset = 0;
  const pageMax = 50;
  while (out.length < want) {
    const pageSize = Math.min(pageMax, want - out.length);
    const q = new URLSearchParams({
      limit: String(pageSize),
      offset: String(offset),
      include_lines: "false",
    });
    const res = await authGet(
      `/v1/businesses/${encodeURIComponent(businessId)}/trade-purchases?${q}`,
    );
    if (!res.ok) {
      if (res.status === 422) return out;
      throw new StaffHomeApiError(res.status, await readDetail(res));
    }
    const data: unknown = await res.json();
    const page = Array.isArray(data)
      ? data.map((e) =>
          e && typeof e === "object" ? (e as Record<string, unknown>) : {},
        )
      : [];
    out.push(...page);
    if (page.length < pageSize) break;
    offset += page.length;
  }
  return out;
}

/** Parallel shell load — staff home WIRE scoped counts. */
export async function fetchStaffHomeShell(
  businessId: string,
): Promise<StaffHomeShellCounts> {
  const [profile, pipeline, low, opening, missing, mismatch] =
    await Promise.all([
      fetchMeProfile(),
      fetchDeliveryPipeline(businessId),
      fetchLowStockList(businessId),
      fetchOpeningMissing(businessId),
      fetchMissingItemCodeTotal(businessId),
      fetchVariancesTodayCount(businessId),
    ]);

  return {
    displayName: displayNameFromProfile(profile),
    pending: deliveryPipelinePendingCount(pipeline),
    delivered: Number(pipeline.stock_committed || 0),
    lowStock: low.items.length,
    openingCount: Number(opening.missing_count ?? 0),
    missingCodeCount: missing,
    mismatchCount: mismatch,
  };
}

/** FastAPI StockAlertsSummaryOut */
export type StockAlertsSummaryOut = {
  low_stock: number;
  critical_stock: number;
  out_of_stock: number;
  active_out_of_stock: number;
  missing_barcode: number;
  missing_item_code: number;
  missing_usage_logs: number;
  eviction_count: number;
  total_items: number;
};

/** GET …/stock/alerts/summary — stockStatusCountsProvider path */
export async function fetchStockAlertsSummary(
  businessId: string,
): Promise<StockAlertsSummaryOut> {
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/stock/alerts/summary`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  const data = (await res.json()) as Partial<StockAlertsSummaryOut>;
  return {
    low_stock: Number(data.low_stock ?? 0),
    critical_stock: Number(data.critical_stock ?? 0),
    out_of_stock: Number(data.out_of_stock ?? 0),
    active_out_of_stock: Number(data.active_out_of_stock ?? 0),
    missing_barcode: Number(data.missing_barcode ?? 0),
    missing_item_code: Number(data.missing_item_code ?? 0),
    missing_usage_logs: Number(data.missing_usage_logs ?? 0),
    eviction_count: Number(data.eviction_count ?? 0),
    total_items: Number(data.total_items ?? 0),
  };
}

/**
 * GET …/notifications — Flutter listAppNotifications (paginate like hexa_api).
 * Soft-fail empty on error is handled by caller for badge (orElse []).
 */
export async function fetchAppNotifications(
  businessId: string,
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  const perPage = 50;
  const maxPages = 20;
  for (let page = 1; page <= maxPages; page++) {
    const q = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    const res = await authGet(
      `/v1/businesses/${encodeURIComponent(businessId)}/notifications?${q}`,
    );
    if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    for (const e of data) {
      if (e && typeof e === "object") out.push(e as Record<string, unknown>);
    }
    if (data.length < perPage) break;
  }
  return out;
}

/** GET …/notifications/unread-count — bundle companion (badge uses merge). */
export async function fetchNotificationsUnreadCount(
  businessId: string,
): Promise<number> {
  const res = await authGet(
    `/v1/businesses/${encodeURIComponent(businessId)}/notifications/unread-count`,
  );
  if (!res.ok) throw new StaffHomeApiError(res.status, await readDetail(res));
  const data = (await res.json()) as { unread?: number };
  return Number(data.unread ?? 0);
}
