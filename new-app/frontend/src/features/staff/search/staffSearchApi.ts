/**
 * Unified search HTTP — hexa_api.unifiedSearch
 * GET /v1/businesses/{id}/search?q=
 */
import { readTokens } from "../../../shared/auth/tokenStore";

export class StaffSearchApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "StaffSearchApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class StaffSearchNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffSearchNetworkError";
  }
}

export type UnifiedSearchResponse = {
  catalog_items: Record<string, unknown>[];
  suppliers: Array<{ id: string; name: string }>;
  brokers: Array<{ id: string; name: string }>;
  entries: Record<string, unknown>[];
  catalog_subcategories: Record<string, unknown>[];
  recent_purchases: Record<string, unknown>[];
  fuzzy_catalog_used: boolean;
  fuzzy_suppliers_used: boolean;
  fuzzy_brokers_used: boolean;
};

function emptySearch(): UnifiedSearchResponse {
  return {
    catalog_items: [],
    suppliers: [],
    brokers: [],
    entries: [],
    catalog_subcategories: [],
    recent_purchases: [],
    fuzzy_catalog_used: false,
    fuzzy_suppliers_used: false,
    fuzzy_brokers_used: false,
  };
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

function authHeaders(): HeadersInit {
  const tokens = readTokens();
  if (!tokens) {
    throw new StaffSearchApiError(401, "Not authenticated");
  }
  return { Authorization: `Bearer ${tokens.access_token}` };
}

/** GET …/search — Flutter unifiedSearch */
export async function fetchUnifiedSearch(
  businessId: string,
  q: string,
  supplierId?: string | null,
): Promise<UnifiedSearchResponse> {
  const trimmed = q.trim();
  if (!trimmed) return emptySearch();
  const params = new URLSearchParams({ q: trimmed });
  if (supplierId?.trim()) params.set("supplier_id", supplierId.trim());
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/search?${params}`,
      { method: "GET", headers: authHeaders() },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new StaffSearchNetworkError(msg);
  }
  if (!res.ok) {
    throw new StaffSearchApiError(res.status, await readDetail(res));
  }
  const data: unknown = await res.json();
  if (!data || typeof data !== "object") return emptySearch();
  const d = data as Record<string, unknown>;
  return {
    catalog_items: Array.isArray(d.catalog_items)
      ? (d.catalog_items as Record<string, unknown>[])
      : [],
    suppliers: Array.isArray(d.suppliers)
      ? (d.suppliers as Array<{ id: string; name: string }>)
      : [],
    brokers: Array.isArray(d.brokers)
      ? (d.brokers as Array<{ id: string; name: string }>)
      : [],
    entries: Array.isArray(d.entries)
      ? (d.entries as Record<string, unknown>[])
      : [],
    catalog_subcategories: Array.isArray(d.catalog_subcategories)
      ? (d.catalog_subcategories as Record<string, unknown>[])
      : [],
    recent_purchases: Array.isArray(d.recent_purchases)
      ? (d.recent_purchases as Record<string, unknown>[])
      : [],
    fuzzy_catalog_used: d.fuzzy_catalog_used === true,
    fuzzy_suppliers_used: d.fuzzy_suppliers_used === true,
    fuzzy_brokers_used: d.fuzzy_brokers_used === true,
  };
}
