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

/** Load for patch/get with membership id + token_version + permissions_json. */
export type BusinessUserPatchLoad = BusinessUserMemberRow & {
  membership_id: string;
  token_version: number;
  permissions_json: string | null;
};

const LIST_COLUMNS = `
  u.[id], u.[name], u.[phone], u.[email], u.[username],
  m.[role],
  u.[is_active], u.[is_blocked],
  u.[last_login_at], u.[last_active_at],
  u.[notes], u.[created_at]
`.trim();

const PATCH_LOAD_COLUMNS = `
  ${LIST_COLUMNS},
  m.[id] AS [membership_id],
  u.[token_version],
  m.[permissions_json]
`.trim();

function asBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v === "true" || v === "1";
  return Boolean(v);
}

function mapMemberRow(r: Record<string, unknown>): BusinessUserMemberRow {
  return {
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
  };
}

export type ProfileStatsRow = {
  stock_edits_total: number;
  purchases_total: number;
  scans_total: number;
  items_created_total: number;
};

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
    return rows.map(mapMemberRow);
  }

  /**
   * _load_user_membership — biz + user id + deleted_at IS NULL (no is_active filter).
   */
  async findMemberByUserId(
    businessId: string,
    userId: string,
  ): Promise<BusinessUserMemberRow | null> {
    const row = await queryOne<Record<string, unknown>>(
      this.client,
      `SELECT ${LIST_COLUMNS}
       FROM [users] u
       INNER JOIN [memberships] m ON m.[user_id] = u.[id]
       WHERE m.[business_id] = @businessId
         AND u.[id] = @userId
         AND u.[deleted_at] IS NULL`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
      ],
    );
    return row ? mapMemberRow(row) : null;
  }

  /** Load for patch_user — includes membership_id + token_version. */
  async findMemberForPatch(
    businessId: string,
    userId: string,
  ): Promise<BusinessUserPatchLoad | null> {
    const row = await queryOne<Record<string, unknown>>(
      this.client,
      `SELECT ${PATCH_LOAD_COLUMNS}
       FROM [users] u
       INNER JOIN [memberships] m ON m.[user_id] = u.[id]
       WHERE m.[business_id] = @businessId
         AND u.[id] = @userId
         AND u.[deleted_at] IS NULL`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
      ],
    );
    if (!row) return null;
    return {
      ...mapMemberRow(row),
      membership_id: String(row.membership_id),
      token_version: Number(row.token_version ?? 0),
      permissions_json:
        row.permissions_json == null
          ? null
          : typeof row.permissions_json === "string"
            ? row.permissions_json
            : JSON.stringify(row.permissions_json),
    };
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

  /**
   * purchases_7d — TradePurchase count last 7d by created_at.
   */
  async purchases7d(businessId: string, userId: string): Promise<number> {
    const row = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM [trade_purchases]
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
   * stock_updates_7d — StockAdjustmentLog by updated_by last 7d via updated_at.
   */
  async stockUpdates7d(businessId: string, userId: string): Promise<number> {
    const row = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM [stock_adjustment_log]
       WHERE [business_id] = @businessId
         AND [updated_by] = @userId
         AND [updated_at] >= DATEADD(day, -7, SYSUTCDATETIME())`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
      ],
    );
    return Number(row?.c ?? 0);
  }

  /**
   * _profile_stats — all-time stock edits, purchases, SCAN activity, items created.
   */
  async profileStats(
    businessId: string,
    userId: string,
  ): Promise<ProfileStatsRow> {
    const params = [
      { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
      { name: "userId", type: sql.UniqueIdentifier, value: userId },
    ];
    const stock = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM [stock_adjustment_log]
       WHERE [business_id] = @businessId AND [updated_by] = @userId`,
      params,
    );
    const pur = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM [trade_purchases]
       WHERE [business_id] = @businessId AND [user_id] = @userId`,
      params,
    );
    const scans = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM [staff_activity_log]
       WHERE [business_id] = @businessId
         AND [user_id] = @userId
         AND [action_type] = N'SCAN'`,
      params,
    );
    const items = await queryOne<{ c: number }>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM [catalog_items]
       WHERE [business_id] = @businessId
         AND [created_by_user_id] = @userId
         AND [deleted_at] IS NULL`,
      params,
    );
    return {
      stock_edits_total: Number(stock?.c ?? 0),
      purchases_total: Number(pur?.c ?? 0),
      scans_total: Number(scans?.c ?? 0),
      items_created_total: Number(items?.c ?? 0),
    };
  }

  /**
   * log_staff_activity / log_user_lifecycle — insert staff_activity_log row.
   * Source: staff_audit.py:log_staff_activity
   */
  async insertActivityLog(row: {
    id: string;
    business_id: string;
    user_id: string;
    user_name: string | null;
    action_type: string;
    details: string | null;
    created_at: Date;
  }): Promise<void> {
    await queryOne(
      this.client,
      `INSERT INTO [staff_activity_log] (
         [id], [business_id], [user_id], [user_name], [action_type],
         [item_id], [item_name], [details], [created_at]
       ) VALUES (
         @id, @businessId, @userId, @userName, @actionType,
         NULL, NULL, @details, @createdAt
       )`,
      [
        { name: "id", type: sql.UniqueIdentifier, value: row.id },
        {
          name: "businessId",
          type: sql.UniqueIdentifier,
          value: row.business_id,
        },
        { name: "userId", type: sql.UniqueIdentifier, value: row.user_id },
        { name: "userName", type: sql.NVarChar(255), value: row.user_name },
        { name: "actionType", type: sql.NVarChar(50), value: row.action_type },
        { name: "details", type: sql.NVarChar(/* MAX */ -1), value: row.details },
        { name: "createdAt", type: sql.DateTimeOffset, value: row.created_at },
      ],
    );
  }
}

export function createBusinessUsersRepository(
  client: SqlClient,
): BusinessUsersRepository {
  return new BusinessUsersRepository(client);
}
