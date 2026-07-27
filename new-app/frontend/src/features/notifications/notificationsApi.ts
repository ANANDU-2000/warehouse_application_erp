/**
 * Notifications HTTP — hexa_api listAppNotifications / markAll / clearAll / patch.
 * List pagination matches staffHomeApi.fetchAppNotifications.
 */
import { readTokens } from "../../shared/auth/tokenStore";

export class NotificationsApiError extends Error {
  readonly status: number;
  readonly detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = "NotificationsApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class NotificationsNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationsNetworkError";
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

async function fetchJson(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new NotificationsNetworkError(msg);
  }
}

function authHeaders(json = false): HeadersInit {
  const tokens = readTokens();
  if (!tokens) {
    throw new NotificationsApiError(401, "Not authenticated");
  }
  const h: Record<string, string> = {
    Authorization: `Bearer ${tokens.access_token}`,
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

/**
 * GET …/notifications — Flutter listAppNotifications (paginate like hexa_api).
 */
export async function listAppNotifications(
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
    const res = await fetchJson(
      `/v1/businesses/${encodeURIComponent(businessId)}/notifications?${q}`,
      { method: "GET", headers: authHeaders() },
    );
    if (!res.ok) {
      throw new NotificationsApiError(res.status, await readDetail(res));
    }
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    for (const e of data) {
      if (e && typeof e === "object") out.push(e as Record<string, unknown>);
    }
    if (data.length < perPage) break;
  }
  return out;
}

/** POST …/notifications/mark-all-read */
export async function markAllAppNotificationsRead(
  businessId: string,
): Promise<number> {
  const res = await fetchJson(
    `/v1/businesses/${encodeURIComponent(businessId)}/notifications/mark-all-read`,
    { method: "POST", headers: authHeaders() },
  );
  if (!res.ok) {
    throw new NotificationsApiError(res.status, await readDetail(res));
  }
  const data = (await res.json()) as { updated?: number };
  return Number(data.updated ?? 0);
}

/** DELETE …/notifications/clear-all */
export async function clearAllAppNotifications(
  businessId: string,
): Promise<number> {
  const res = await fetchJson(
    `/v1/businesses/${encodeURIComponent(businessId)}/notifications/clear-all`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) {
    throw new NotificationsApiError(res.status, await readDetail(res));
  }
  const data = (await res.json()) as { updated?: number };
  return Number(data.updated ?? 0);
}

/** PATCH …/notifications/:id { read } */
export async function patchAppNotificationRead(args: {
  businessId: string;
  notificationId: string;
  read?: boolean;
}): Promise<void> {
  const res = await fetchJson(
    `/v1/businesses/${encodeURIComponent(args.businessId)}/notifications/${encodeURIComponent(args.notificationId)}`,
    {
      method: "PATCH",
      headers: authHeaders(true),
      body: JSON.stringify({ read: args.read !== false }),
    },
  );
  if (!res.ok) {
    throw new NotificationsApiError(res.status, await readDetail(res));
  }
}
