/**
 * Staff stock list WIRE — Flutter stockListProvider / hexa_api.listStock
 * GET /v1/businesses/{id}/stock/list?page=&per_page=50&status=&q=&sort=recent
 */
import { readTokens } from "../../../shared/auth/tokenStore";
import type { StaffStockOpFilters } from "./staffStockFilters";
import type { StaffStockStatus } from "./staffStockStatus";

export class StaffStockApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "StaffStockApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class StaffStockNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffStockNetworkError";
  }
}

/** Flutter StockListQuery.perPage default / bootstrap */
export const STAFF_STOCK_PER_PAGE = 50;

export type StaffStockListQuery = {
  page: number;
  perPage?: number;
  status: StaffStockStatus | string;
  q: string;
  sort?: string;
  op?: StaffStockOpFilters;
};

export type StaffStockListPage = {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  per_page: number;
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
    throw new StaffStockApiError(401, "Not authenticated");
  }
  return { Authorization: `Bearer ${tokens.access_token}` };
}

export async function fetchStaffStockListPage(
  businessId: string,
  query: StaffStockListQuery,
): Promise<StaffStockListPage> {
  const perPage = query.perPage ?? STAFF_STOCK_PER_PAGE;
  const qs = new URLSearchParams({
    page: String(Math.max(1, query.page)),
    per_page: String(perPage),
    status: query.status || "all",
    sort: query.sort ?? "recent",
  });
  const q = query.q.trim();
  if (q) qs.set("q", q);
  const op = query.op;
  if (op?.subcategory.trim()) qs.set("subcategory", op.subcategory.trim());
  if (op?.unit.trim()) qs.set("unit", op.unit.trim());
  if (op?.missingBarcodeOnly) qs.set("missing_barcode", "true");
  if (op?.missingItemCodeOnly) qs.set("missing_item_code", "true");
  if (op?.reorderOnly) qs.set("reorder_only", "true");

  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/stock/list?${qs}`,
      { headers: authHeaders() },
    );
  } catch {
    throw new StaffStockNetworkError("Network error");
  }
  if (!res.ok) {
    throw new StaffStockApiError(res.status, await readDetail(res));
  }
  const body = (await res.json()) as {
    items?: unknown[];
    total?: number;
    page?: number;
    per_page?: number;
  };
  const items = Array.isArray(body.items)
    ? body.items.filter(
        (e): e is Record<string, unknown> => !!e && typeof e === "object",
      )
    : [];
  return {
    items,
    total: Number(body.total ?? 0),
    page: Number(body.page ?? query.page),
    per_page: Number(body.per_page ?? perPage),
  };
}
