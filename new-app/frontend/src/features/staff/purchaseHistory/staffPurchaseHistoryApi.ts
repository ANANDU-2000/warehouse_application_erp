/**
 * Staff purchase history WIRE —
 * staffTradePurchasesHistoryProvider / staffLowStockAlertsProvider
 * GET …/trade-purchases · GET …/stock/list?status=low&sort=stock_asc
 */
import { readTokens } from "../../../shared/auth/tokenStore";
import {
  fetchStaffStockListPage,
  StaffStockApiError,
  StaffStockNetworkError,
} from "../stock/staffStockApi";
import type { StaffPhPeriod } from "./staffPurchaseHistoryPeriod";
import { staffPhPeriodRange } from "./staffPurchaseHistoryPeriod";

export class StaffPhApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "StaffPhApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class StaffPhNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffPhNetworkError";
  }
}

/** Flutter pageSize / maxRows in staffTradePurchasesHistoryProvider */
export const STAFF_PH_PAGE_SIZE = 50;
export const STAFF_PH_MAX_ROWS = 500;

/** staffLowStockAlertsProvider perPage */
export const STAFF_PH_LOW_STOCK_PER_PAGE = 8;

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
    throw new StaffPhApiError(401, "Not authenticated");
  }
  return { Authorization: `Bearer ${tokens.access_token}` };
}

async function fetchTradePurchasesPage(
  businessId: string,
  opts: {
    limit: number;
    offset: number;
    purchaseFrom: string | null;
    purchaseTo: string | null;
  },
): Promise<Record<string, unknown>[]> {
  const qs = new URLSearchParams({
    limit: String(opts.limit),
    offset: String(opts.offset),
  });
  if (opts.purchaseFrom) qs.set("purchase_from", opts.purchaseFrom);
  if (opts.purchaseTo) qs.set("purchase_to", opts.purchaseTo);

  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/trade-purchases?${qs}`,
      { headers: authHeaders() },
    );
  } catch {
    throw new StaffPhNetworkError("Network error");
  }
  if (!res.ok) {
    throw new StaffPhApiError(res.status, await readDetail(res));
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((e) =>
    e && typeof e === "object" ? (e as Record<string, unknown>) : {},
  );
}

/**
 * Paginate trade purchases for a period — staffTradePurchasesHistoryProvider.
 */
export async function fetchStaffPhPurchases(
  businessId: string,
  period: StaffPhPeriod,
): Promise<Record<string, unknown>[]> {
  const { purchaseFrom, purchaseTo } = staffPhPeriodRange(period);
  const raw: Record<string, unknown>[] = [];
  let offset = 0;
  while (raw.length < STAFF_PH_MAX_ROWS) {
    const page = await fetchTradePurchasesPage(businessId, {
      limit: STAFF_PH_PAGE_SIZE,
      offset,
      purchaseFrom,
      purchaseTo,
    });
    if (page.length === 0) break;
    raw.push(...page);
    if (page.length < STAFF_PH_PAGE_SIZE) break;
    offset += STAFF_PH_PAGE_SIZE;
  }
  raw.sort((a, b) => {
    const da = String(a.purchase_date ?? a.purchaseDate ?? "");
    const db = String(b.purchase_date ?? b.purchaseDate ?? "");
    return db.localeCompare(da);
  });
  return raw;
}

/**
 * Low stock alerts — staffLowStockAlertsProvider
 * listStock page=1 perPage=8 status=low sort=stock_asc
 */
export async function fetchStaffPhLowStock(
  businessId: string,
): Promise<Record<string, unknown>[]> {
  try {
    const page = await fetchStaffStockListPage(businessId, {
      page: 1,
      perPage: STAFF_PH_LOW_STOCK_PER_PAGE,
      status: "low",
      q: "",
      sort: "stock_asc",
    });
    return page.items;
  } catch (err) {
    if (err instanceof StaffStockNetworkError) {
      throw new StaffPhNetworkError(err.message);
    }
    if (err instanceof StaffStockApiError) {
      throw new StaffPhApiError(err.status, err.detail);
    }
    throw err;
  }
}
