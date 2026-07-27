/**
 * Staff activity WIRE — Flutter staffActivityLogProvider /
 * hexa_api.listActivityLog (period today|week|month, page=1, per_page=50).
 * GET /v1/businesses/:businessId/activity-log
 */
import { readTokens } from "../../../shared/auth/tokenStore";
import type { StaffActPeriod } from "./staffActivityCopy";

export class StaffActApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "StaffActApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class StaffActNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffActNetworkError";
  }
}

/** Flutter listActivityLog defaults */
export const STAFF_ACT_PAGE = 1;
export const STAFF_ACT_PER_PAGE = 50;

export type StaffActLogRow = {
  id?: string;
  action_type?: string;
  item_name?: string | null;
  item_id?: string | null;
  created_at?: string;
  user_name?: string | null;
  details?: Record<string, unknown> | null;
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

/**
 * GET …/activity-log?period=&page=1&per_page=50
 * Backend scopes to current user when user_id omitted (staff page).
 */
export async function fetchStaffActivityLog(
  businessId: string,
  period: StaffActPeriod,
): Promise<StaffActLogRow[]> {
  const tokens = readTokens();
  if (!tokens) {
    throw new StaffActApiError(401, "Not authenticated");
  }
  const q = new URLSearchParams({
    period,
    page: String(STAFF_ACT_PAGE),
    per_page: String(STAFF_ACT_PER_PAGE),
  });
  let res: Response;
  try {
    res = await fetch(
      `/v1/businesses/${encodeURIComponent(businessId)}/activity-log?${q}`,
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      },
    );
  } catch {
    throw new StaffActNetworkError("Network error");
  }
  if (!res.ok) {
    throw new StaffActApiError(res.status, await readDetail(res));
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((e) =>
    e && typeof e === "object" ? (e as StaffActLogRow) : {},
  );
}
