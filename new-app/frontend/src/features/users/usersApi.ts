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

export type BusinessUserProfile = BusinessUserListItem & {
  login_email?: string | null;
  purchases_7d?: number;
  stock_updates_7d?: number;
  business_name?: string | null;
  stats?: {
    stock_edits_total: number;
    purchases_total: number;
    scans_total: number;
    items_created_total: number;
  } | null;
};

export type PermissionsOut = {
  role: string;
  permissions: Record<string, boolean>;
};

export type ResetPasswordOut = {
  new_password: string;
  login_email?: string | null;
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

async function usersFetch(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch";
    throw new UsersNetworkError(msg);
  }
}

/** GET …/users/:userId — getBusinessUser */
export async function getBusinessUser(opts: {
  businessId: string;
  userId: string;
  accessToken?: string;
}): Promise<BusinessUserProfile> {
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}`;
  const res = await usersFetch(url, {
    method: "GET",
    headers: { Authorization: authHeader(opts.accessToken) },
  });
  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }
  return (await res.json()) as BusinessUserProfile;
}

/** PATCH …/users/:userId — patchBusinessUser */
export async function patchBusinessUser(opts: {
  businessId: string;
  userId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  isActive?: boolean | null;
  isBlocked?: boolean | null;
  notes?: string | null;
  accessToken?: string;
}): Promise<BusinessUserProfile> {
  const body: Record<string, unknown> = {};
  if (opts.fullName != null) body.full_name = opts.fullName.trim();
  if (opts.email != null) body.email = opts.email.trim().toLowerCase();
  if (opts.phone != null) body.phone = opts.phone.trim();
  if (opts.role != null) body.role = opts.role;
  if (opts.isActive != null) body.is_active = opts.isActive;
  if (opts.isBlocked != null) body.is_blocked = opts.isBlocked;
  if (opts.notes != null) body.notes = opts.notes.trim();

  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}`;
  const res = await usersFetch(url, {
    method: "PATCH",
    headers: {
      Authorization: authHeader(opts.accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }
  return (await res.json()) as BusinessUserProfile;
}

/** DELETE …/users/:userId — deleteBusinessUser */
export async function deleteBusinessUser(opts: {
  businessId: string;
  userId: string;
  accessToken?: string;
}): Promise<void> {
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}`;
  const res = await usersFetch(url, {
    method: "DELETE",
    headers: { Authorization: authHeader(opts.accessToken) },
  });
  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }
}

/** POST …/users/:userId/reset-password */
export async function resetBusinessUserPassword(opts: {
  businessId: string;
  userId: string;
  accessToken?: string;
}): Promise<ResetPasswordOut> {
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}/reset-password`;
  const res = await usersFetch(url, {
    method: "POST",
    headers: { Authorization: authHeader(opts.accessToken) },
  });
  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }
  return (await res.json()) as ResetPasswordOut;
}

/** GET …/users/:userId/permissions */
export async function getUserPermissions(opts: {
  businessId: string;
  userId: string;
  accessToken?: string;
}): Promise<PermissionsOut> {
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}/permissions`;
  const res = await usersFetch(url, {
    method: "GET",
    headers: { Authorization: authHeader(opts.accessToken) },
  });
  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }
  return (await res.json()) as PermissionsOut;
}

/** PATCH …/users/:userId/permissions */
export async function patchUserPermissions(opts: {
  businessId: string;
  userId: string;
  permissions: Record<string, boolean>;
  accessToken?: string;
}): Promise<PermissionsOut> {
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}/permissions`;
  const res = await usersFetch(url, {
    method: "PATCH",
    headers: {
      Authorization: authHeader(opts.accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ permissions: opts.permissions }),
  });
  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }
  return (await res.json()) as PermissionsOut;
}

export type UserActivityLogRow = {
  id: string;
  user_name?: string | null;
  action_type: string;
  item_id?: string | null;
  item_name?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
};

export type UserStockAdjustmentRow = {
  id: string;
  item_id: string;
  item_name: string | null;
  old_qty: number;
  new_qty: number;
  adjustment_type: string;
  reason: string | null;
  updated_at: string;
};

export type UserPurchaseBriefRow = {
  id: string;
  human_id: string | null;
  purchase_date: string | null;
  status: string | null;
  total_amount: number | null;
  supplier_name: string | null;
  item_count: number | null;
};

export type UserCreatedItemRow = {
  id: string;
  name: string | null;
  barcode: string | null;
  category: string | null;
  reorder_level: number | null;
  updated_at: string | null;
};

export type UserLedgerEntryRow = {
  kind: string;
  at: string;
  title: string;
  subtitle: string | null;
  details: Record<string, unknown> | null;
};

export type UserLedgerGrouped = {
  today: UserLedgerEntryRow[];
  yesterday: UserLedgerEntryRow[];
  this_week: UserLedgerEntryRow[];
};

async function usersGetJsonList<T>(
  url: string,
  accessToken?: string,
): Promise<T[]> {
  const res = await usersFetch(url, {
    method: "GET",
    headers: { Authorization: authHeader(accessToken) },
  });
  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }
  const data: unknown = await res.json();
  return Array.isArray(data) ? (data as T[]) : [];
}

/** GET …/activity-log?user_id=&days=30 — listUserActivity */
export async function listUserActivity(opts: {
  businessId: string;
  userId: string;
  days?: number;
  perPage?: number;
  accessToken?: string;
}): Promise<UserActivityLogRow[]> {
  const q = new URLSearchParams({
    user_id: opts.userId,
    days: String(opts.days ?? 30),
    per_page: String(opts.perPage ?? 100),
  });
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/activity-log?${q}`;
  return usersGetJsonList<UserActivityLogRow>(url, opts.accessToken);
}

/** GET …/users/:userId/stock-adjustments */
export async function listUserStockAdjustments(opts: {
  businessId: string;
  userId: string;
  limit?: number;
  accessToken?: string;
}): Promise<UserStockAdjustmentRow[]> {
  const q = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}/stock-adjustments?${q}`;
  return usersGetJsonList<UserStockAdjustmentRow>(url, opts.accessToken);
}

/** GET …/users/:userId/purchases */
export async function listUserPurchases(opts: {
  businessId: string;
  userId: string;
  limit?: number;
  accessToken?: string;
}): Promise<UserPurchaseBriefRow[]> {
  const q = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}/purchases?${q}`;
  return usersGetJsonList<UserPurchaseBriefRow>(url, opts.accessToken);
}

/** GET …/users/:userId/created-items */
export async function listUserCreatedItems(opts: {
  businessId: string;
  userId: string;
  limit?: number;
  accessToken?: string;
}): Promise<UserCreatedItemRow[]> {
  const q = new URLSearchParams({ limit: String(opts.limit ?? 50) });
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}/created-items?${q}`;
  return usersGetJsonList<UserCreatedItemRow>(url, opts.accessToken);
}

/** GET …/users/:userId/ledger?grouped=true */
export async function listUserLedgerGrouped(opts: {
  businessId: string;
  userId: string;
  limit?: number;
  accessToken?: string;
}): Promise<UserLedgerGrouped> {
  const q = new URLSearchParams({
    limit: String(opts.limit ?? 80),
    grouped: "true",
  });
  const url = `/v1/businesses/${encodeURIComponent(opts.businessId)}/users/${encodeURIComponent(opts.userId)}/ledger?${q}`;
  const res = await usersFetch(url, {
    method: "GET",
    headers: { Authorization: authHeader(opts.accessToken) },
  });
  if (!res.ok) {
    throw new UsersApiError(res.status, await readDetail(res));
  }
  const data = (await res.json()) as Partial<UserLedgerGrouped>;
  return {
    today: Array.isArray(data.today) ? data.today : [],
    yesterday: Array.isArray(data.yesterday) ? data.yesterday : [],
    this_week: Array.isArray(data.this_week) ? data.this_week : [],
  };
}
