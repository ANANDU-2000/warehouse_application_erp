/**
 * Users business APIs — hexa_api listBusinessUsers / createBusinessUser / bulkBusinessUsers.
 */
import { readTokens } from "../../shared/auth/tokenStore";

export type BusinessUserListItem = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string;
  username: string | null;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  last_login_at: string | null;
  last_active_at: string | null;
  notes: string | null;
  created_at: string | null;
  today_stats?: {
    scans: number;
    stock_updates: number;
    items_created: number;
  };
  warehouse_name?: string | null;
  activity_count_7d?: number;
};

export type UserCreateOut = {
  user: BusinessUserListItem;
  generated_password?: string | null;
  login_email?: string | null;
};

export type UserBulkOut = {
  updated: number;
  failed: string[];
};

export class UsersApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "UsersApiError";
    this.status = status;
    this.detail = detail;
  }
}

export class UsersNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsersNetworkError";
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

function authHeader(accessToken?: string): string {
  const token = accessToken ?? readTokens()?.access_token;
  if (!token) {
    throw new UsersApiError(401, "Not signed in");
  }
  return `Bearer ${token}`;
}

/** GET …/users?include_inactive=true — business_users_provider */
export async function listBusinessUsers(opts: {
  businessId: string;
  includeInactive?: boolean;
  accessToken?: string;
}): Promise<BusinessUserListItem[]> {
  const qs = new URLSearchParams();
  if (opts.includeInactive !== false) {
    qs.set("include_inactive", "true");
  }
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users?${qs}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Authorization: authHeader(opts.accessToken) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new UsersNetworkError(msg);
  }

  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data as BusinessUserListItem[];
}

/** POST …/users — createBusinessUser */
export async function createBusinessUser(opts: {
  businessId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  password?: string | null;
  notes?: string | null;
  isActive?: boolean;
  accessToken?: string;
}): Promise<UserCreateOut> {
  const body: Record<string, unknown> = {
    full_name: opts.fullName.trim(),
    email: opts.email.trim().toLowerCase(),
    phone: opts.phone.trim(),
    role: opts.role,
    is_active: opts.isActive ?? true,
  };
  if (opts.password != null && opts.password.trim()) {
    body.password = opts.password.trim();
  }
  if (opts.notes != null && opts.notes.trim()) {
    body.notes = opts.notes.trim();
  }

  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader(opts.accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new UsersNetworkError(msg);
  }

  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }

  return (await res.json()) as UserCreateOut;
}

/** POST …/users/bulk — bulkBusinessUsers */
export async function bulkBusinessUsers(opts: {
  businessId: string;
  userIds: string[];
  action:
    | "activate"
    | "deactivate"
    | "block"
    | "unblock"
    | "delete"
    | "set_role";
  role?: string | null;
  accessToken?: string;
}): Promise<UserBulkOut> {
  const body: Record<string, unknown> = {
    user_ids: opts.userIds,
    action: opts.action,
  };
  if (opts.role != null) {
    body.role = opts.role;
  }

  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/bulk`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader(opts.accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new UsersNetworkError(msg);
  }

  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }

  return (await res.json()) as UserBulkOut;
}
