/**
 * GET …/reports/home-overview — dashboard.md §16; reports_trade home-overview.
 * Do not call GET /dashboard from owner home UI.
 */
import { readTokens } from "../../shared/auth/tokenStore";

export type HomeOverviewSummary = {
  deals: number;
  total_purchase: number;
  total_landing: number;
  total_selling: number;
  total_profit: number;
  profit_percent: number | null;
  total_qty: number;
  pending_delivery_count: number;
  supplier_count: number;
  broker_count: number;
  received_delivery_count: number;
  negative_stock_count: number;
};

export type HomeOverviewUnitTotals = {
  total_kg: number;
  total_bags: number;
  total_boxes: number;
  total_tins: number;
};

export type HomeOverviewStockInHand = {
  total_value_inr: number;
  bags: number;
  boxes: number;
  tins: number;
  kg: number;
  item_count: number;
};

export type HomeOverviewOperational = {
  stock_status_counts: {
    all: number;
    low: number;
    critical: number;
    out: number;
    missing_code: number;
    missing_barcode: number;
  };
  delivery_pipeline: {
    pending_count: number;
    received_count: number;
  };
  notifications_unread: number;
};

export type HomeOverviewCategory = {
  category_id: string;
  category_name: string;
  total_purchase: number;
  total_qty: number;
  units: { bags: number; boxes: number; tins: number };
  subtitle_supplier?: string;
  subtitle_broker?: string;
  items?: unknown[];
};

export type HomeOverviewShell = {
  subcategories: Record<string, unknown>[];
  suppliers: Record<string, unknown>[];
  items: Record<string, unknown>[];
};

export type HomeOverviewPayload = {
  from: string;
  to: string;
  summary: HomeOverviewSummary;
  unit_totals: HomeOverviewUnitTotals;
  categories?: HomeOverviewCategory[];
  home_shell?: HomeOverviewShell;
  stock_in_hand?: HomeOverviewStockInHand;
  home_operational?: HomeOverviewOperational;
};

export class HomeOverviewApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "HomeOverviewApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class HomeOverviewNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomeOverviewNetworkError";
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

export async function fetchHomeOverview(opts: {
  businessId: string;
  from: string;
  to: string;
  accessToken?: string;
}): Promise<HomeOverviewPayload> {
  const token = opts.accessToken ?? readTokens()?.access_token;
  if (!token) {
    throw new HomeOverviewApiError(401, "Not signed in");
  }

  const qs = new URLSearchParams({
    from: opts.from,
    to: opts.to,
    compact: "true",
    shell_bundle: "true",
  });

  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/reports/home-overview?${qs}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new HomeOverviewNetworkError(msg);
  }

  if (!res.ok) {
    throw new HomeOverviewApiError(res.status, await readDetail(res));
  }

  return (await res.json()) as HomeOverviewPayload;
}
