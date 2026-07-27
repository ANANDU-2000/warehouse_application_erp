/**
 * Build UserListOut rows for GET …/users.
 * Source: source-app/backend/app/routers/users.py:_user_row
 * Schema: source-app/backend/app/schemas/users.py:UserListOut, TodayStatsOut
 */
import type { BusinessesRepository } from "../repositories/businesses.repository";
import type {
  BusinessUsersRepository,
  BusinessUserMemberRow,
} from "../repositories/businessUsers.repository";

export type TodayStatsOut = {
  scans: number;
  stock_updates: number;
  items_created: number;
};

/** FastAPI UserListOut JSON shape. */
export type UserListOut = {
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
  today_stats: TodayStatsOut;
  warehouse_name: string | null;
  activity_count_7d: number;
  notes: string | null;
  created_at: string | null;
};

function isoOrNull(d: Date | null | undefined): string | null {
  if (d == null) return null;
  return d instanceof Date ? d.toISOString() : String(d);
}

/**
 * Parse FastAPI Query(False) include_inactive.
 * Accepts true/false/1/0 (case-insensitive strings).
 */
export function parseIncludeInactive(raw: unknown): boolean {
  if (raw === undefined || raw === null || raw === "") return false;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;
  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
  }
  throw new Error("include_inactive_invalid");
}

export async function buildUserListOut(
  businessUsers: BusinessUsersRepository,
  businessId: string,
  row: BusinessUserMemberRow,
  warehouseName: string | null,
): Promise<UserListOut> {
  const [stats, act7] = await Promise.all([
    businessUsers.todayStats(businessId, row.id),
    businessUsers.activityCount7d(businessId, row.id),
  ]);
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    username: row.username,
    role: row.role,
    is_active: row.is_active,
    is_blocked: row.is_blocked,
    last_login_at: isoOrNull(row.last_login_at),
    last_active_at: isoOrNull(row.last_active_at),
    today_stats: {
      scans: stats.scans,
      stock_updates: stats.stock_updates,
      items_created: stats.items_created,
    },
    warehouse_name: warehouseName,
    activity_count_7d: act7,
    notes: row.notes,
    created_at: isoOrNull(row.created_at),
  };
}

/**
 * list_users — load members, resolve warehouse_name once (Business.name), enrich each row.
 */
export async function listUsersForBusiness(
  businessUsers: BusinessUsersRepository,
  businesses: BusinessesRepository,
  businessId: string,
  includeInactive: boolean,
): Promise<UserListOut[]> {
  const members = await businessUsers.listForBusiness(
    businessId,
    includeInactive,
  );
  const biz = await businesses.findById(businessId);
  const warehouseName = biz?.name ?? null;
  const out: UserListOut[] = [];
  for (const m of members) {
    out.push(
      await buildUserListOut(businessUsers, businessId, m, warehouseName),
    );
  }
  return out;
}
