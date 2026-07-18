/**
 * Home activity HTTP — Flutter hexa_api listTradePurchases / listStockAuditRecent /
 * listStaffPurchaseLogs.
 */
import { readTokens } from "../../shared/auth/tokenStore";

export class HomeActivityApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "HomeActivityApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class HomeActivityNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomeActivityNetworkError";
  }
}

const TRADE_PAGE_MAX = 50;

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

async function fetchJson(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new HomeActivityNetworkError(msg);
  }
}

function authHeaders(): HeadersInit {
  const tokens = readTokens();
  if (!tokens) {
    throw new HomeActivityApiError(401, "Not authenticated");
  }
  return { Authorization: `Bearer ${tokens.access_token}` };
}

async function getList(
  path: string,
  signal?: AbortSignal,
): Promise<Record<string, unknown>[]> {
  const res = await fetchJson(path, {
    method: "GET",
    headers: authHeaders(),
    signal,
  });
  if (!res.ok) {
    if (res.status === 422) return [];
    throw new HomeActivityApiError(res.status, await readDetail(res));
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((e) =>
    e && typeof e === "object" ? (e as Record<string, unknown>) : {},
  );
}

/** Pages until `limit` (API caps at 50). */
export async function listTradePurchases(args: {
  businessId: string;
  limit?: number;
  status?: string;
  purchaseFrom?: string;
  purchaseTo?: string;
  signal?: AbortSignal;
}): Promise<Record<string, unknown>[]> {
  const want = Math.max(1, args.limit ?? 20);
  const out: Record<string, unknown>[] = [];
  let offset = 0;
  while (out.length < want) {
    const pageSize = Math.min(TRADE_PAGE_MAX, want - out.length);
    const q = new URLSearchParams({
      limit: String(pageSize),
      offset: String(offset),
      include_lines: "false",
    });
    if (args.status) q.set("status", args.status);
    if (args.purchaseFrom) q.set("purchase_from", args.purchaseFrom);
    if (args.purchaseTo) q.set("purchase_to", args.purchaseTo);
    const page = await getList(
      `/v1/businesses/${args.businessId}/trade-purchases?${q}`,
      args.signal,
    );
    out.push(...page);
    if (page.length < pageSize) break;
    offset += page.length;
  }
  return out;
}

export async function listStockAuditRecent(args: {
  businessId: string;
  limit?: number;
  signal?: AbortSignal;
}): Promise<Record<string, unknown>[]> {
  const limit = Math.min(250, Math.max(1, args.limit ?? 250));
  return getList(
    `/v1/businesses/${args.businessId}/stock/audit/recent?limit=${limit}`,
    args.signal,
  );
}

export async function listStaffPurchaseLogs(args: {
  businessId: string;
  limit?: number;
  signal?: AbortSignal;
}): Promise<Record<string, unknown>[]> {
  const limit = Math.max(1, args.limit ?? 30);
  return getList(
    `/v1/businesses/${args.businessId}/stock/staff-purchases?limit=${limit}`,
    args.signal,
  );
}
