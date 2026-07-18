/**
 * Business-scoped user list + activity stats for Users & Roles.
 * Source: source-app/backend/app/routers/users.py
 *   list_users, _user_row, _today_stats, _activity_count_7d, _warehouse_name
 */
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient } from "./sql";

/** Joined user + membership fields needed for UserListOut (pre-enrichment). */
export type BusinessUserMemberRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string;
  username: string | null;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  last_login_at: Date | null;
  last_active_at: Date | null;
  notes: string | null;
  created_at: Date | null;
};

export type TodayStatsRow = {
  scans: number;
  stock_updates: number;
  items_created: number;
};

const LIST_COLUMNS = `
  u.[id], u.[name], u.[phone], u.[email], u.[username],
  m.[role],
  u.[is_active], u.[is_blocked],
  u.[last_login_at], u.[last_active_at],
  u.[notes], u.[created_at]
`.trim();

function asBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v === "true" || v === "1";
  return Boolean(v);
}

export class BusinessUsersRepository {
  constructor(private readonly client: SqlClient) {}

  /**
   * list_users query — Membership.business_id + User.deleted_at IS NULL;
   * when includeInactive is false, also User.is_active IS TRUE.
   * Ordered by User.name.
   */
  async listForBusiness(
    businessId: string,
    includeInactive: boolean,
  ): Promise<BusinessUserMemberRow[]> {
    const activeClause = includeInactive
      ? ""
      : " AND u.[is_active] = 1";
    const rows = await queryMany<Record<string, unknown>>(
      this.client,
      `SELECT ${LIST_COLUMNS}
       FROM [users] u
       INNER JOIN [memberships] m ON m.[user_id] = u.[id]
       WHERE m.[business_id] = @businessId
         AND u.[deleted_at] IS NULL${activeClause}
       ORDER BY u.[name]`,
      [
        {
          name: "businessId",
          type: sql.UniqueIdentifier,
          value: businessId,
        },
      ],
    );
    return rows.map((r) => ({
      id: String(r.id),
      name: (r.name as string | null) ?? null,
      phone: (r.phone as string | null) ?? null,
      email: String(r.email),
      username: (r.username as string | null) ?? null,
      role: String(r.role),
      is_active: asBool(r.is_active),
      is_blocked: asBool(r.is_blocked),
      last_login_at: (r.last_login_at as Date | null) ?? null,
      last_active_at: (r.last_active_at as Date | null) ?? null,
      notes: (r.notes as string | null) ?? null,
      created_at: (r.created_at as Date | null) ?? null,
    }));
  }

  /**
   * _activity_count_7d — count staff_activity_log rows in last 7 UTC days.
   */
  async activityCount7d(
    businessId: string,
    userId: string,
  ): Promise<number> {
    const row = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM [staff_activity_log]
       WHERE [business_id] = @businessId
         AND [user_id] = @userId
         AND [created_at] >= DATEADD(day, -7, SYSUTCDATETIME())`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
      ],
    );
    return Number(row?.c ?? 0);
  }

  /**
   * _today_stats — SCAN / STOCK_UPDATE / ITEM_CREATE since UTC midnight.
   */
  async todayStats(
    businessId: string,
    userId: string,
  ): Promise<TodayStatsRow> {
    const rows = await queryMany<{ action_type: string; c: number }>(
      this.client,
      `SELECT [action_type], COUNT([id]) AS c
       FROM [staff_activity_log]
       WHERE [business_id] = @businessId
         AND [user_id] = @userId
         AND [created_at] >= CAST(CAST(SYSUTCDATETIME() AS date) AS datetimeoffset)
         AND [action_type] IN (N'SCAN', N'STOCK_UPDATE', N'ITEM_CREATE')
       GROUP BY [action_type]`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
      ],
    );
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.action_type] = Number(r.c ?? 0);
    }
    return {
      scans: counts.SCAN ?? 0,
      stock_updates: counts.STOCK_UPDATE ?? 0,
      items_created: counts.ITEM_CREATE ?? 0,
    };
  }
}

export function createBusinessUsersRepository(
  client: SqlClient,
): BusinessUsersRepository {
  return new BusinessUsersRepository(client);
}
