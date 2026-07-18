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
