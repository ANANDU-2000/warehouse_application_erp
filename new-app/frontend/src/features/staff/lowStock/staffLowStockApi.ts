/**
 * Staff low stock WIRE — Flutter listLowStockOperations / notifyOwnerStockItem
 * GET …/stock/low-stock/operations
 * POST …/stock/:itemId/notify-owner?alert=reorder
 */
import { readTokens } from "../../../shared/auth/tokenStore";
import { homePeriodApiDates, type HomePeriod } from "../../home/homePeriod";

export class StaffLsApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "StaffLsApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class StaffLsNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffLsNetworkError";
  }
}

/** Flutter LowStockOperationsQuery.perPage / HexaApi.lowStockOperationsMaxPerPage */
export const STAFF_LS_OPS_PER_PAGE = 50;
export const STAFF_LS_OPS_MAX_PER_PAGE = 200;

/** Matches Flutter homePeriodProvider default */
export const STAFF_LS_DEFAULT_PERIOD: HomePeriod = "month";

export type StaffLsOpsPage = {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  per_page: number;
  summary_slice?: {
    total_attention?: number;
    out_of_stock?: number;
    pending_purchase?: number;
  };
};

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

function authHeaders(): HeadersInit {
  const tokens = readTokens();
  if (!tokens) {
    throw new StaffLsApiError(401, "Not authenticated");
  }
  return { Authorization: `Bearer ${tokens.access_token}` };
}

export function staffLsPeriodQuery(
  period: HomePeriod = STAFF_LS_DEFAULT_PERIOD,
): { period_start: string; period_end: string } {
  const { from, to } = homePeriodApiDates(period);
  return { period_start: from, period_end: to };
}

export async function fetchStaffLowStockOperations(
  businessId: string,
  opts?: {
    page?: number;
    perPage?: number;
    q?: string;
    period?: HomePeriod;
  },
): Promise<StaffLsOpsPage> {
  const page = Math.max(1, opts?.page ?? 1);
  const perPage = Math.min(
    STAFF_LS_OPS_MAX_PER_PAGE,
    Math.max(1, opts?.perPage ?? STAFF_LS_OPS_PER_PAGE),
  );
  const dates = staffLsPeriodQuery(opts?.period ?? STAFF_LS_DEFAULT_PERIOD);
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    filter: "all",
    sort: "priority",
    period_start: dates.period_start,
    period_end: dates.period_end,
  });
  const q = (opts?.q ?? "").trim();
  if (q) qs.set("q", q);

  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/stock/low-stock/operations?${qs}`,
      { headers: authHeaders() },
    );
  } catch {
    throw new StaffLsNetworkError("Network error");
  }
  if (!res.ok) {
    throw new StaffLsApiError(res.status, await readDetail(res));
  }
  const body = (await res.json()) as {
    items?: unknown[];
    total?: number;
    page?: number;
    per_page?: number;
    summary_slice?: StaffLsOpsPage["summary_slice"];
  };
  const items = Array.isArray(body.items)
    ? body.items.filter(
        (e): e is Record<string, unknown> => !!e && typeof e === "object",
      )
    : [];
  return {
    items,
    total: Number(body.total ?? 0),
    page: Number(body.page ?? page),
    per_page: Number(body.per_page ?? perPage),
    summary_slice: body.summary_slice,
  };
}

export async function notifyOwnerStockItem(
  businessId: string,
  itemId: string,
  alert: "reorder" | "missing_barcode" = "reorder",
): Promise<{ ok: boolean; notifications_created: number }> {
  const qs = new URLSearchParams({ alert });
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/stock/${encodeURIComponent(itemId)}/notify-owner?${qs}`,
      { method: "POST", headers: authHeaders() },
    );
  } catch {
    throw new StaffLsNetworkError("Network error");
  }
  if (!res.ok) {
    throw new StaffLsApiError(res.status, await readDetail(res));
  }
  const body = (await res.json()) as {
    ok?: boolean;
    notifications_created?: number;
  };
  return {
    ok: body.ok !== false,
    notifications_created: Number(body.notifications_created ?? 0),
  };
}
