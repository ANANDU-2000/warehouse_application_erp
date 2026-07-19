/**
 * Staff gallery stock list — Flutter staffGalleryStockProvider / hexa_api.listStock
 * GET /v1/businesses/{id}/stock/list?page=&per_page=500&status=all&sort=name
 */
import { readTokens } from "../../../shared/auth/tokenStore";
import type { StaffGalleryItem } from "./staffItemGalleryLogic";

export class StaffGalleryApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "StaffGalleryApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class StaffGalleryNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffGalleryNetworkError";
  }
}

export type StockListPage = {
  items: StaffGalleryItem[];
  total: number;
  page: number;
  per_page: number;
};

/** Flutter staffGalleryStockProvider pageSize */
export const STAFF_GALLERY_PAGE_SIZE = 500;
/** Flutter while page <= 40 */
export const STAFF_GALLERY_MAX_PAGES = 40;

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
    throw new StaffGalleryApiError(401, "Not authenticated");
  }
  return { Authorization: `Bearer ${tokens.access_token}` };
}

/**
 * Normalize StockListItemOut → gallery row keys Flutter filters use.
 * Maps opening_stock_set_at → opening_stock_set / needs_opening_stock.
 */
export function normalizeGalleryStockItem(
  raw: Record<string, unknown>,
): StaffGalleryItem {
  const setAt = raw.opening_stock_set_at;
  const openingSet = setAt != null && String(setAt).trim() !== "";
  const unit =
    (typeof raw.stock_unit === "string" && raw.stock_unit) ||
    (typeof raw.default_unit === "string" && raw.default_unit) ||
    (typeof raw.unit === "string" && raw.unit) ||
    null;
  const sub =
    (typeof raw.subcategory_name === "string" && raw.subcategory_name) ||
    (typeof raw.type_name === "string" && raw.type_name) ||
    null;
  return {
    ...raw,
    stock_unit: unit,
    default_unit: unit,
    subcategory_name: sub,
    type_name: sub,
    opening_stock_set: openingSet,
    needs_opening_stock: !openingSet,
  };
}

async function fetchStockListPage(
  businessId: string,
  page: number,
  perPage: number,
): Promise<StockListPage> {
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    status: "all",
    sort: "name",
  });
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/stock/list?${qs}`,
      { headers: authHeaders() },
    );
  } catch {
    throw new StaffGalleryNetworkError("Network error");
  }
  if (!res.ok) {
    throw new StaffGalleryApiError(res.status, await readDetail(res));
  }
  const body = (await res.json()) as {
    items?: unknown[];
    total?: number;
    page?: number;
    per_page?: number;
  };
  const items = Array.isArray(body.items)
    ? body.items
        .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
        .map(normalizeGalleryStockItem)
    : [];
  return {
    items,
    total: Number(body.total ?? 0),
    page: Number(body.page ?? page),
    per_page: Number(body.per_page ?? perPage),
  };
}

/**
 * Paginate all stock rows — Flutter staffGalleryStockProvider loop.
 */
export async function fetchAllGalleryStock(
  businessId: string,
): Promise<StaffGalleryItem[]> {
  const rows: StaffGalleryItem[] = [];
  let page = 1;
  while (page <= STAFF_GALLERY_MAX_PAGES) {
    const res = await fetchStockListPage(
      businessId,
      page,
      STAFF_GALLERY_PAGE_SIZE,
    );
    if (res.items.length === 0) break;
    rows.push(...res.items);
    if (page * STAFF_GALLERY_PAGE_SIZE >= res.total) break;
    page += 1;
  }
  return rows;
}
