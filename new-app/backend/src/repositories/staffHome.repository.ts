/**
 * Staff home WIRE — delivery pipeline + stock list/opening/variances + totals.
 * Source: trade_purchase_service.get_trade_purchase_delivery_pipeline
 *         stock_helpers._stock_status_sql_filter / _query_items
 *         stock_ops.missing_opening_stock / stock_totals / _stock_totals_purchased_in_period
 *         stock_audit.variances_today
 */
import { sql } from "../config/database";
import {
  tradeLineQtyBagsExprSql,
  tradeLineQtyBoxesExprSql,
  tradeLineQtyTinsExprSql,
  tradeLineWeightExprSql,
  tradePurchaseStatusInReportsSql,
} from "../services/tradeLineSql";
import { queryMany, queryOne, type SqlClient, type SqlParam } from "./sql";

export type DeliveryPipelineOut = {
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

export type StockListItemOut = {
  id: string;
  name: string;
  item_code: string | null;
  current_stock: number;
  reorder_level: number;
  unit: string | null;
  /** Gallery / full list fields — stock_helpers._item_to_list_row subset */
  stock_unit?: string | null;
  default_unit?: string | null;
  category_name?: string | null;
  subcategory_name?: string | null;
  type_name?: string | null;
  stock_status?: string;
  missing_barcode?: boolean;
  missing_item_code?: boolean;
  opening_stock_set_at?: string | null;
  opening_stock_qty?: number | null;
  /** Latest physical count — stock_physical_counts.counted_qty */
  physical_stock_qty?: number | null;
  physical_stock_difference_qty?: number | null;
  last_stock_updated_at?: string | null;
};

export type StockListOut = {
  items: StockListItemOut[];
  total: number;
  page: number;
  per_page: number;
};

export type OpeningMissingOut = {
  items: StockListItemOut[];
  missing_count: number;
};

export type StockVarianceOut = {
  item_id: string;
  item_name: string;
  expected_qty: string;
  found_qty: string;
  variance_delta: string;
  unit: string | null;
  updated_at: string;
};

/** FastAPI StockTotalsOut — stock_ops.stock_totals */
export type StockTotalsOut = {
  total_items: number;
  total_bags: number;
  total_kg: number;
  total_boxes: number;
  total_tins: number;
};

/** FastAPI ActivityLogOut — users.py list_activity */
export type ActivityLogOut = {
  id: string;
  user_name: string | null;
  action_type: string;
  item_id: string | null;
  item_name: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

/** FastAPI NotificationOut — notifications.py */
export type NotificationOut = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  priority: string;
  category: string;
  action_route: string | null;
  triggered_by_user_id: string | null;
  triggered_by_name: string | null;
  related_item_id: string | null;
  related_purchase_id: string | null;
  related_supplier_id: string | null;
  payload: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

/** FastAPI StockAlertsSummaryOut — stock_inventory.compute_stock_alerts_summary */
export type StockAlertsSummaryOut = {
  low_stock: number;
  critical_stock: number;
  out_of_stock: number;
  active_out_of_stock: number;
  missing_barcode: number;
  missing_item_code: number;
  missing_usage_logs: number;
  eviction_count: number;
  total_items: number;
};

type StatusCountRow = { delivery_status: string | null; c: number };
type AmountRow = { total: number };
type CountRow = { c: number };
type CatalogRow = {
  id: string;
  name: string;
  item_code: string | null;
  current_stock: number | null;
  reorder_level: number | null;
  stock_unit: string | null;
  default_unit: string | null;
  barcode?: string | null;
  category_name?: string | null;
  subcategory_name?: string | null;
  opening_stock_set_at?: Date | string | null;
  opening_stock_qty?: number | null;
  physical_stock_qty?: number | null;
  physical_stock_difference_qty?: number | null;
  last_stock_updated_at?: Date | string | null;
};
type NotifRow = {
  payload: string | null;
  created_at: Date;
};

type StockTotalsRow = {
  total_items: number;
  total_bags: number;
  total_kg: number;
  total_boxes: number;
  total_tins: number;
};

type ActivityLogRow = {
  id: string;
  user_name: string | null;
  action_type: string;
  item_id: string | null;
  item_name: string | null;
  details: string | null;
  created_at: Date;
};

type NotificationDbRow = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  priority: string;
  category: string;
  action_route: string | null;
  triggered_by_user_id: string | null;
  triggered_by_name: string | null;
  related_item_id: string | null;
  related_purchase_id: string | null;
  related_supplier_id: string | null;
  payload: string | null;
  metadata: string | null;
  read_at: Date | null;
  created_at: Date;
};

type AlertsAggRow = {
  total: number;
  low: number;
  critical: number;
  out_n: number;
  active_out: number;
  missing_barcode: number;
  missing_item_code: number;
  eviction: number;
};

function parseJsonObject(
  raw: string | null,
): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function isoOrNull(d: Date | null): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : String(d);
}

function notificationVisibleToRole(
  payload: Record<string, unknown> | null,
  userRole: string,
): boolean {
  if (!payload) return true;
  const roles = payload.target_roles;
  if (!Array.isArray(roles) || roles.length === 0) return true;
  const allowed = new Set(
    roles
      .map((r) => String(r).trim().toLowerCase())
      .filter((s) => s.length > 0),
  );
  return allowed.has((userRole || "").trim().toLowerCase());
}

function moneyStr(n: number): string {
  return (Number.isFinite(n) ? n : 0).toFixed(2);
}

/**
 * FastAPI stock_inventory.stock_status — out / critical / low / healthy.
 */
export function computeStockStatus(
  current: number | null | undefined,
  reorder: number | null | undefined,
): string {
  const cur = Number(current ?? 0);
  const ro = Number(reorder ?? 0);
  if (cur <= 0) return "out";
  if (ro <= 0 && cur > 0 && cur < 1) return "low";
  if (ro > 0) {
    if (cur <= ro * 0.5) return "critical";
    if (cur <= ro) return "low";
  }
  return "healthy";
}

function itemOut(r: CatalogRow): StockListItemOut {
  const current = Number(r.current_stock ?? 0);
  const reorder = Number(r.reorder_level ?? 0);
  const unit = r.stock_unit ?? r.default_unit;
  const code = r.item_code;
  const barcode = r.barcode ?? null;
  const missingBarcode = !(barcode && String(barcode).trim());
  const missingItemCode = !(code && String(code).trim());
  const setAt = r.opening_stock_set_at;
  const setAtIso =
    setAt == null
      ? null
      : setAt instanceof Date
        ? setAt.toISOString()
        : String(setAt);
  const sub = r.subcategory_name ?? null;
  return {
    id: r.id,
    name: r.name,
    item_code: code,
    current_stock: current,
    reorder_level: reorder,
    unit,
    stock_unit: unit,
    default_unit: r.default_unit,
    category_name: r.category_name ?? null,
    subcategory_name: sub,
    type_name: sub,
    stock_status: computeStockStatus(current, reorder),
    missing_barcode: missingBarcode,
    missing_item_code: missingItemCode,
    opening_stock_set_at: setAtIso,
    opening_stock_qty:
      r.opening_stock_qty == null ? null : Number(r.opening_stock_qty),
    physical_stock_qty:
      r.physical_stock_qty == null ? null : Number(r.physical_stock_qty),
    physical_stock_difference_qty:
      r.physical_stock_difference_qty == null
        ? null
        : Number(r.physical_stock_difference_qty),
    last_stock_updated_at:
      r.last_stock_updated_at == null
        ? null
        : r.last_stock_updated_at instanceof Date
          ? r.last_stock_updated_at.toISOString()
          : String(r.last_stock_updated_at),
  };
}

/** Low filter — stock_helpers._stock_status_sql_filter("low") only (not critical/out). */
const LOW_STOCK_SQL = `
  (
    (
      COALESCE(ci.[reorder_level], 0) > 0
      AND COALESCE(ci.[current_stock], 0) > COALESCE(ci.[reorder_level], 0) * 0.5
      AND COALESCE(ci.[current_stock], 0) <= COALESCE(ci.[reorder_level], 0)
    )
    OR (
      COALESCE(ci.[reorder_level], 0) <= 0
      AND COALESCE(ci.[current_stock], 0) > 0
      AND COALESCE(ci.[current_stock], 0) < 1
    )
  )
`;

/** Critical — stock_helpers._stock_status_sql_filter("critical") */
const CRITICAL_STOCK_SQL = `
  (
    COALESCE(ci.[reorder_level], 0) > 0
    AND COALESCE(ci.[current_stock], 0) > 0
    AND COALESCE(ci.[current_stock], 0) <= COALESCE(ci.[reorder_level], 0) * 0.5
  )
`;

/** Out — current_stock <= 0 */
const OUT_STOCK_SQL = `COALESCE(ci.[current_stock], 0) <= 0`;

/**
 * stock_helpers._stock_status_sql_filter — returns WHERE fragment or null.
 * Source: StatusFilter all|low|critical|out|shortage
 */
export function stockStatusWhereSql(statusVal: string): string | null {
  const s = statusVal.trim().toLowerCase();
  switch (s) {
    case "all":
    case "":
      return null;
    case "out":
      return OUT_STOCK_SQL;
    case "critical":
      return CRITICAL_STOCK_SQL;
    case "low":
      return LOW_STOCK_SQL;
    case "shortage":
      return `(${OUT_STOCK_SQL} OR ${CRITICAL_STOCK_SQL} OR ${LOW_STOCK_SQL})`;
    default:
      return null;
  }
}
export class StaffHomeRepository {
  constructor(private readonly client: SqlClient) {}

  async deliveryPipeline(businessId: string): Promise<DeliveryPipelineOut> {
    const rows = await queryMany<StatusCountRow>(
      this.client,
      `SELECT [delivery_status], COUNT([id]) AS c
       FROM trade_purchases
       WHERE [business_id] = @businessId
         AND [status] <> N'deleted'
       GROUP BY [delivery_status]`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const key = (r.delivery_status ?? "pending").trim().toLowerCase();
      counts[key] = Number(r.c ?? 0);
    }
    const amt = await queryOne<AmountRow>(
      this.client,
      `SELECT COALESCE(SUM([total_amount]), 0) AS total
       FROM trade_purchases
       WHERE [business_id] = @businessId
         AND [status] NOT IN (N'deleted', N'cancelled')
         AND [delivery_status] NOT IN (N'stock_committed', N'cancelled')`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    return {
      pending: counts.pending ?? 0,
      dispatched: counts.dispatched ?? 0,
      in_transit: counts.in_transit ?? 0,
      arrived: counts.arrived ?? 0,
      staff_verifying: counts.staff_verifying ?? 0,
      staff_verified: counts.staff_verified ?? 0,
      partial: counts.partial ?? 0,
      stock_committed: counts.stock_committed ?? 0,
      cancelled: counts.cancelled ?? 0,
      total_pending_amount: moneyStr(Number(amt?.total ?? 0)),
    };
  }

  async listStock(opts: {
    businessId: string;
    page: number;
    perPage: number;
    status: string;
    sort: string;
    q?: string;
    subcategory?: string;
    missingItemCode?: boolean;
    missingBarcode?: boolean;
    reorderOnly?: boolean;
    unit?: string;
  }): Promise<StockListOut> {
    const where: string[] = [
      "ci.[business_id] = @businessId",
      "ci.[deleted_at] IS NULL",
    ];
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
    ];

    const statusSql = stockStatusWhereSql(opts.status);
    if (statusSql) {
      where.push(statusSql);
    }

    const q = (opts.q ?? "").trim().toLowerCase();
    if (q) {
      where.push(
        `(
          LOWER(ci.[name]) LIKE @qLike
          OR LOWER(COALESCE(ci.[item_code], N'')) LIKE @qLike
          OR LOWER(COALESCE(ci.[barcode], N'')) LIKE @qLike
        )`,
      );
      params.push({
        name: "qLike",
        type: sql.NVarChar(255),
        value: `%${q}%`,
      });
    }

    const sub = (opts.subcategory ?? "").trim().toLowerCase();
    if (sub) {
      where.push(`LOWER(COALESCE(ct.[name], N'')) = @subcategory`);
      params.push({
        name: "subcategory",
        type: sql.NVarChar(255),
        value: sub,
      });
    }

    if (opts.missingItemCode) {
      where.push(
        `(ci.[item_code] IS NULL OR LTRIM(RTRIM(COALESCE(ci.[item_code], N''))) = N'')`,
      );
    }
    if (opts.missingBarcode) {
      where.push(
        `(ci.[barcode] IS NULL OR LTRIM(RTRIM(COALESCE(ci.[barcode], N''))) = N'')`,
      );
    }
    if (opts.reorderOnly) {
      where.push(
        `(COALESCE(ci.[reorder_level], 0) > 0 AND COALESCE(ci.[current_stock], 0) <= COALESCE(ci.[reorder_level], 0))`,
      );
    }
    const unit = (opts.unit ?? "").trim().toLowerCase();
    if (unit) {
      where.push(
        `LOWER(COALESCE(ci.[stock_unit], ci.[default_unit], N'')) = @unit`,
      );
      params.push({ name: "unit", type: sql.NVarChar(64), value: unit });
    }

    const whereSql = where.join(" AND ");

    let orderSql = "LOWER(ci.[name]) ASC";
    if (opts.sort === "stock_asc") {
      orderSql = "COALESCE(ci.[current_stock], 0) ASC";
    } else if (opts.sort === "stock_desc") {
      orderSql = "COALESCE(ci.[current_stock], 0) DESC";
    } else if (opts.sort === "recent") {
      orderSql =
        "CASE WHEN ci.[last_stock_updated_at] IS NULL THEN 1 ELSE 0 END ASC, ci.[last_stock_updated_at] DESC, LOWER(ci.[name]) ASC";
    }

    const totalRow = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(ci.[id]) AS c
       FROM catalog_items ci
       LEFT JOIN category_types ct ON ct.[id] = ci.[type_id]
       WHERE ${whereSql}`,
      params,
    );
    const total = Number(totalRow?.c ?? 0);
    const page = Math.max(1, opts.page);
    /** FastAPI Query le=2000; Flutter stock list perPage=50 */
    const perPage = Math.min(2000, Math.max(1, opts.perPage));
    const offset = (page - 1) * perPage;

    if (total === 0) {
      return { items: [], total: 0, page, per_page: perPage };
    }

    const rows = await queryMany<CatalogRow>(
      this.client,
      `SELECT ci.[id], ci.[name], ci.[item_code], ci.[current_stock],
              ci.[reorder_level], ci.[stock_unit], ci.[default_unit],
              ci.[barcode], ci.[opening_stock_set_at], ci.[opening_stock_qty],
              ci.[last_stock_updated_at],
              ic.[name] AS category_name,
              ct.[name] AS subcategory_name,
              pc.[counted_qty] AS physical_stock_qty,
              pc.[difference_qty] AS physical_stock_difference_qty
       FROM catalog_items ci
       LEFT JOIN item_categories ic ON ic.[id] = ci.[category_id]
       LEFT JOIN category_types ct ON ct.[id] = ci.[type_id]
       OUTER APPLY (
         SELECT TOP (1) spc.[counted_qty], spc.[difference_qty]
         FROM stock_physical_counts spc
         WHERE spc.[business_id] = ci.[business_id]
           AND spc.[item_id] = ci.[id]
         ORDER BY spc.[counted_at] DESC
       ) pc
       WHERE ${whereSql}
       ORDER BY ${orderSql}
       OFFSET @offset ROWS FETCH NEXT @perPage ROWS ONLY`,
      [
        ...params,
        { name: "offset", type: sql.Int, value: offset },
        { name: "perPage", type: sql.Int, value: perPage },
      ],
    );

    return {
      items: rows.map(itemOut),
      total,
      page,
      per_page: perPage,
    };
  }

  async openingMissing(
    businessId: string,
    limit: number,
  ): Promise<OpeningMissingOut> {
    const lim = Math.min(500, Math.max(1, limit));
    const countRow = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM catalog_items
       WHERE [business_id] = @businessId
         AND [deleted_at] IS NULL
         AND [opening_stock_set_at] IS NULL`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    const rows = await queryMany<CatalogRow>(
      this.client,
      `SELECT [id], [name], [item_code], [current_stock],
              [reorder_level], [stock_unit], [default_unit]
       FROM catalog_items
       WHERE [business_id] = @businessId
         AND [deleted_at] IS NULL
         AND [opening_stock_set_at] IS NULL
       ORDER BY [name] ASC
       OFFSET 0 ROWS FETCH NEXT @lim ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "lim", type: sql.Int, value: lim },
      ],
    );
    return {
      items: rows.map(itemOut),
      missing_count: Number(countRow?.c ?? 0),
    };
  }

  async variancesToday(businessId: string): Promise<StockVarianceOut[]> {
    const rows = await queryMany<NotifRow>(
      this.client,
      `SELECT [payload], [created_at]
       FROM notifications
       WHERE [business_id] = @businessId
         AND [kind] = N'stock_variance'
         AND [created_at] >= CAST(CONVERT(date, SYSUTCDATETIME()) AS datetimeoffset)
       ORDER BY [created_at] DESC
       OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    const seen = new Set<string>();
    const out: StockVarianceOut[] = [];
    for (const n of rows) {
      let p: Record<string, unknown> = {};
      if (n.payload) {
        try {
          p = JSON.parse(n.payload) as Record<string, unknown>;
        } catch {
          p = {};
        }
      }
      const iid = p.item_id != null ? String(p.item_id) : "";
      if (!iid || seen.has(iid)) continue;
      seen.add(iid);
      out.push({
        item_id: iid,
        item_name: String(p.item_name ?? "Item"),
        expected_qty: String(p.expected_qty ?? 0),
        found_qty: String(p.found_qty ?? 0),
        variance_delta: String(p.variance_delta ?? 0),
        unit: p.unit != null ? String(p.unit) : null,
        updated_at:
          n.created_at instanceof Date
            ? n.created_at.toISOString()
            : String(n.created_at),
      });
    }
    return out;
  }

  /**
   * On-hand warehouse totals — stock_ops.stock_totals (no period).
   * Formula: CASE on catalog_items.default_unit bag/kg/box/tin.
   */
  async stockTotalsOnHand(businessId: string): Promise<StockTotalsOut> {
    const row = await queryOne<StockTotalsRow>(
      this.client,
      `SELECT
         COUNT(ci.[id]) AS total_items,
         COALESCE(SUM(CASE WHEN ci.[default_unit] = N'bag' THEN ci.[current_stock] ELSE 0 END), 0) AS total_bags,
         COALESCE(SUM(CASE
           WHEN ci.[default_unit] = N'bag'
             THEN ci.[current_stock] * COALESCE(ci.[default_kg_per_bag], 0)
           WHEN ci.[default_unit] = N'kg'
             THEN ci.[current_stock]
           ELSE 0
         END), 0) AS total_kg,
         COALESCE(SUM(CASE WHEN ci.[default_unit] = N'box' THEN ci.[current_stock] ELSE 0 END), 0) AS total_boxes,
         COALESCE(SUM(CASE WHEN ci.[default_unit] = N'tin' THEN ci.[current_stock] ELSE 0 END), 0) AS total_tins
       FROM catalog_items ci
       WHERE ci.[business_id] = @businessId
         AND ci.[deleted_at] IS NULL`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    return {
      total_items: Number(row?.total_items ?? 0),
      total_bags: Number(row?.total_bags ?? 0),
      total_kg: Number(row?.total_kg ?? 0),
      total_boxes: Number(row?.total_boxes ?? 0),
      total_tins: Number(row?.total_tins ?? 0),
    };
  }

  /**
   * Purchased qty in [dateFrom, dateTo] — stock_ops._stock_totals_purchased_in_period.
   * Uses trade_purchase_date_filter + trade line bag/box/tin/kg exprs.
   */
  async stockTotalsPurchased(
    businessId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<StockTotalsOut> {
    const bags = tradeLineQtyBagsExprSql("tpl");
    const boxes = tradeLineQtyBoxesExprSql("tpl");
    const tins = tradeLineQtyTinsExprSql("tpl");
    const kg = tradeLineWeightExprSql("tpl");
    const statusOk = tradePurchaseStatusInReportsSql("tp");
    const row = await queryOne<StockTotalsRow>(
      this.client,
      `SELECT
         COUNT(DISTINCT tpl.[catalog_item_id]) AS total_items,
         COALESCE(SUM(${bags}), 0) AS total_bags,
         COALESCE(SUM(${kg}), 0) AS total_kg,
         COALESCE(SUM(${boxes}), 0) AS total_boxes,
         COALESCE(SUM(${tins}), 0) AS total_tins
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND ${statusOk}`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return {
      total_items: Number(row?.total_items ?? 0),
      total_bags: Number(row?.total_bags ?? 0),
      total_kg: Number(row?.total_kg ?? 0),
      total_boxes: Number(row?.total_boxes ?? 0),
      total_tins: Number(row?.total_tins ?? 0),
    };
  }

  /**
   * GET activity-log — users.py list_activity (period today/week/month or days).
   * Defaults to current user when userId omitted.
   */
  async listActivityLog(opts: {
    businessId: string;
    userId: string;
    period: string;
    days: number | null;
    page: number;
    perPage: number;
  }): Promise<ActivityLogOut[]> {
    const page = Math.max(1, opts.page);
    const perPage = Math.min(200, Math.max(1, opts.perPage));
    const offset = (page - 1) * perPage;
    const period = (opts.period || "today").toLowerCase();

    let startExpr: string;
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
      { name: "userId", type: sql.UniqueIdentifier, value: opts.userId },
      { name: "offset", type: sql.Int, value: offset },
      { name: "perPage", type: sql.Int, value: perPage },
    ];

    if (opts.days != null && opts.days > 0) {
      startExpr = `DATEADD(day, -@days, SYSUTCDATETIME())`;
      params.push({ name: "days", type: sql.Int, value: opts.days });
    } else if (period === "week") {
      startExpr = `DATEADD(day, -7, SYSUTCDATETIME())`;
    } else if (period === "month") {
      startExpr = `DATEADD(day, -30, SYSUTCDATETIME())`;
    } else {
      /* today — start of UTC day */
      startExpr = `CAST(CAST(SYSUTCDATETIME() AS date) AS datetimeoffset)`;
    }

    const rows = await queryMany<ActivityLogRow>(
      this.client,
      `SELECT [id], [user_name], [action_type], [item_id], [item_name],
              [details], [created_at]
       FROM staff_activity_log
       WHERE [business_id] = @businessId
         AND [user_id] = @userId
         AND [created_at] >= ${startExpr}
       ORDER BY [created_at] DESC
       OFFSET @offset ROWS FETCH NEXT @perPage ROWS ONLY`,
      params,
    );

    return rows.map((r) => {
      let details: Record<string, unknown> | null = null;
      if (r.details) {
        try {
          details = JSON.parse(r.details) as Record<string, unknown>;
        } catch {
          details = null;
        }
      }
      return {
        id: r.id,
        user_name: r.user_name,
        action_type: r.action_type,
        item_id: r.item_id,
        item_name: r.item_name,
        details,
        created_at:
          r.created_at instanceof Date
            ? r.created_at.toISOString()
            : String(r.created_at),
      };
    });
  }

  /**
   * GET notifications — notifications.py list_notifications
   */
  async listNotifications(opts: {
    businessId: string;
    userId: string;
    userRole: string;
    page: number;
    perPage: number;
    kind: string | null;
    category: string | null;
    priority: string | null;
    unreadOnly: boolean;
    q: string | null;
  }): Promise<NotificationOut[]> {
    const page = Math.max(1, opts.page);
    const perPage = Math.min(100, Math.max(1, opts.perPage));
    const offset = (page - 1) * perPage;
    const where: string[] = [
      "n.[business_id] = @businessId",
      "n.[user_id] = @userId",
    ];
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
      { name: "userId", type: sql.UniqueIdentifier, value: opts.userId },
      { name: "offset", type: sql.Int, value: offset },
      { name: "perPage", type: sql.Int, value: perPage },
    ];
    if (opts.kind) {
      where.push("n.[kind] = @kind");
      params.push({ name: "kind", type: sql.NVarChar(64), value: opts.kind });
    }
    if (opts.category) {
      where.push("n.[category] = @category");
      params.push({
        name: "category",
        type: sql.NVarChar(32),
        value: opts.category,
      });
    }
    if (opts.priority) {
      where.push("n.[priority] = @priority");
      params.push({
        name: "priority",
        type: sql.NVarChar(16),
        value: opts.priority,
      });
    }
    if (opts.unreadOnly) {
      where.push("n.[read_at] IS NULL");
    }
    if (opts.q && opts.q.trim()) {
      where.push(
        `(n.[title] LIKE @q OR n.[body] LIKE @q)`,
      );
      params.push({
        name: "q",
        type: sql.NVarChar(140),
        value: `%${opts.q.trim()}%`,
      });
    }

    const rows = await queryMany<NotificationDbRow>(
      this.client,
      `SELECT n.[id], n.[kind], n.[title], n.[body], n.[priority], n.[category],
              n.[action_route], n.[triggered_by_user_id], u.[name] AS triggered_by_name,
              n.[related_item_id], n.[related_purchase_id], n.[related_supplier_id],
              n.[payload], n.[metadata], n.[read_at], n.[created_at]
       FROM notifications n
       LEFT JOIN users u ON u.[id] = n.[triggered_by_user_id]
       WHERE ${where.join(" AND ")}
       ORDER BY n.[created_at] DESC
       OFFSET @offset ROWS FETCH NEXT @perPage ROWS ONLY`,
      params,
    );

    const out: NotificationOut[] = [];
    for (const r of rows) {
      const payload = parseJsonObject(r.payload);
      if (!notificationVisibleToRole(payload, opts.userRole)) continue;
      const name = (r.triggered_by_name ?? "").trim();
      out.push({
        id: r.id,
        kind: r.kind,
        title: r.title,
        body: r.body,
        priority: r.priority || "medium",
        category: r.category || "system",
        action_route: r.action_route,
        triggered_by_user_id: r.triggered_by_user_id,
        triggered_by_name: name.length > 0 ? name : null,
        related_item_id: r.related_item_id,
        related_purchase_id: r.related_purchase_id,
        related_supplier_id: r.related_supplier_id,
        payload,
        metadata: parseJsonObject(r.metadata),
        read_at: isoOrNull(r.read_at),
        created_at:
          r.created_at instanceof Date
            ? r.created_at.toISOString()
            : String(r.created_at),
      });
    }
    return out;
  }

  /** GET notifications/unread-count */
  async notificationsUnreadCount(
    businessId: string,
    userId: string,
  ): Promise<number> {
    const row = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM notifications
       WHERE [business_id] = @businessId
         AND [user_id] = @userId
         AND [read_at] IS NULL`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: userId },
      ],
    );
    return Number(row?.c ?? 0);
  }

  /**
   * POST notifications/mark-all-read — notifications.py mark_all_read
   */
  async markAllNotificationsRead(opts: {
    businessId: string;
    userId: string;
    kind: string | null;
  }): Promise<number> {
    const where = [
      "[business_id] = @businessId",
      "[user_id] = @userId",
      "[read_at] IS NULL",
    ];
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
      { name: "userId", type: sql.UniqueIdentifier, value: opts.userId },
    ];
    if (opts.kind) {
      where.push("[kind] = @kind");
      params.push({ name: "kind", type: sql.NVarChar(64), value: opts.kind });
    }
    const request = this.client.request();
    for (const p of params) {
      request.input(p.name, p.type as never, p.value);
    }
    const result = await request.query(
      `UPDATE [notifications]
       SET [read_at] = SYSUTCDATETIME()
       WHERE ${where.join(" AND ")}`,
    );
    return Number(result.rowsAffected?.[0] ?? 0);
  }

  /**
   * DELETE notifications/clear-all — notifications.py clear_all
   */
  async clearAllNotifications(opts: {
    businessId: string;
    userId: string;
    kind: string | null;
  }): Promise<number> {
    const where = ["[business_id] = @businessId", "[user_id] = @userId"];
    const params: SqlParam[] = [
      { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
      { name: "userId", type: sql.UniqueIdentifier, value: opts.userId },
    ];
    if (opts.kind) {
      where.push("[kind] = @kind");
      params.push({ name: "kind", type: sql.NVarChar(64), value: opts.kind });
    }
    const request = this.client.request();
    for (const p of params) {
      request.input(p.name, p.type as never, p.value);
    }
    const result = await request.query(
      `DELETE FROM [notifications] WHERE ${where.join(" AND ")}`,
    );
    return Number(result.rowsAffected?.[0] ?? 0);
  }

  /**
   * PATCH notifications/{id} — notifications.py patch_notification
   */
  async patchNotificationRead(opts: {
    businessId: string;
    userId: string;
    notificationId: string;
    read: boolean;
  }): Promise<NotificationOut | null> {
    const existing = await queryOne<NotificationDbRow>(
      this.client,
      `SELECT n.[id], n.[kind], n.[title], n.[body], n.[priority], n.[category],
              n.[action_route], n.[triggered_by_user_id], u.[name] AS triggered_by_name,
              n.[related_item_id], n.[related_purchase_id], n.[related_supplier_id],
              n.[payload], n.[metadata], n.[read_at], n.[created_at]
       FROM notifications n
       LEFT JOIN users u ON u.[id] = n.[triggered_by_user_id]
       WHERE n.[id] = @notificationId
         AND n.[business_id] = @businessId
         AND n.[user_id] = @userId`,
      [
        {
          name: "notificationId",
          type: sql.UniqueIdentifier,
          value: opts.notificationId,
        },
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: opts.userId },
      ],
    );
    if (!existing) return null;

    await queryMany(
      this.client,
      opts.read
        ? `UPDATE [notifications]
           SET [read_at] = SYSUTCDATETIME()
           WHERE [id] = @notificationId
             AND [business_id] = @businessId
             AND [user_id] = @userId`
        : `UPDATE [notifications]
           SET [read_at] = NULL
           WHERE [id] = @notificationId
             AND [business_id] = @businessId
             AND [user_id] = @userId`,
      [
        {
          name: "notificationId",
          type: sql.UniqueIdentifier,
          value: opts.notificationId,
        },
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: opts.userId },
      ],
    );

    const row = await queryOne<NotificationDbRow>(
      this.client,
      `SELECT n.[id], n.[kind], n.[title], n.[body], n.[priority], n.[category],
              n.[action_route], n.[triggered_by_user_id], u.[name] AS triggered_by_name,
              n.[related_item_id], n.[related_purchase_id], n.[related_supplier_id],
              n.[payload], n.[metadata], n.[read_at], n.[created_at]
       FROM notifications n
       LEFT JOIN users u ON u.[id] = n.[triggered_by_user_id]
       WHERE n.[id] = @notificationId
         AND n.[business_id] = @businessId
         AND n.[user_id] = @userId`,
      [
        {
          name: "notificationId",
          type: sql.UniqueIdentifier,
          value: opts.notificationId,
        },
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
        { name: "userId", type: sql.UniqueIdentifier, value: opts.userId },
      ],
    );
    if (!row) return null;
    const payload = parseJsonObject(row.payload);
    const name = (row.triggered_by_name ?? "").trim();
    return {
      id: row.id,
      kind: row.kind,
      title: row.title,
      body: row.body,
      priority: row.priority || "medium",
      category: row.category || "system",
      action_route: row.action_route,
      triggered_by_user_id: row.triggered_by_user_id,
      triggered_by_name: name.length > 0 ? name : null,
      related_item_id: row.related_item_id,
      related_purchase_id: row.related_purchase_id,
      related_supplier_id: row.related_supplier_id,
      payload,
      metadata: parseJsonObject(row.metadata),
      read_at: isoOrNull(row.read_at),
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    };
  }

  /**
   * GET stock/alerts/summary — compute_stock_alerts_summary
   */
  async stockAlertsSummary(
    businessId: string,
  ): Promise<StockAlertsSummaryOut> {
    const row = await queryOne<AlertsAggRow>(
      this.client,
      `SELECT
         COUNT(ci.[id]) AS total,
         COALESCE(SUM(CASE WHEN
           COALESCE(ci.[current_stock], 0) > 0
           AND (
             (COALESCE(ci.[reorder_level], 0) > 0
               AND COALESCE(ci.[current_stock], 0) > COALESCE(ci.[reorder_level], 0) * 0.5
               AND COALESCE(ci.[current_stock], 0) <= COALESCE(ci.[reorder_level], 0))
             OR (COALESCE(ci.[reorder_level], 0) <= 0
               AND COALESCE(ci.[current_stock], 0) < 1)
           )
         THEN 1 ELSE 0 END), 0) AS low,
         COALESCE(SUM(CASE WHEN
           COALESCE(ci.[current_stock], 0) > 0
           AND COALESCE(ci.[reorder_level], 0) > 0
           AND COALESCE(ci.[current_stock], 0) <= COALESCE(ci.[reorder_level], 0) * 0.5
         THEN 1 ELSE 0 END), 0) AS critical,
         COALESCE(SUM(CASE WHEN COALESCE(ci.[current_stock], 0) <= 0 THEN 1 ELSE 0 END), 0) AS out_n,
         COALESCE(SUM(CASE WHEN
           COALESCE(ci.[current_stock], 0) <= 0
           AND (
             (ci.[opening_stock_qty] IS NOT NULL AND ci.[opening_stock_qty] > 0)
             OR ci.[last_purchase_at] IS NOT NULL
           )
         THEN 1 ELSE 0 END), 0) AS active_out,
         COALESCE(SUM(CASE WHEN
           ci.[barcode] IS NULL OR LTRIM(RTRIM(COALESCE(ci.[barcode], N''))) = N''
         THEN 1 ELSE 0 END), 0) AS missing_barcode,
         COALESCE(SUM(CASE WHEN
           ci.[item_code] IS NULL OR LTRIM(RTRIM(COALESCE(ci.[item_code], N''))) = N''
         THEN 1 ELSE 0 END), 0) AS missing_item_code,
         COALESCE(SUM(CASE WHEN
           ic.[is_perishable] = 1
           AND COALESCE(ci.[current_stock], 0) > 0
           AND ci.[eviction_days] IS NOT NULL
           AND ci.[last_purchase_at] IS NOT NULL
           AND DATEDIFF(day, ci.[last_purchase_at], SYSUTCDATETIME()) > ci.[eviction_days]
         THEN 1 ELSE 0 END), 0) AS eviction
       FROM catalog_items ci
       INNER JOIN item_categories ic ON ic.[id] = ci.[category_id]
       WHERE ci.[business_id] = @businessId
         AND ci.[deleted_at] IS NULL`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );

    const catalogTotal = Number(row?.total ?? 0);
    const logged = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT([id]) AS c
       FROM daily_usage_logs
       WHERE [business_id] = @businessId
         AND [usage_date] = CAST(SYSUTCDATETIME() AS date)`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    const loggedN = Number(logged?.c ?? 0);

    return {
      low_stock: Number(row?.low ?? 0),
      critical_stock: Number(row?.critical ?? 0),
      out_of_stock: Number(row?.out_n ?? 0),
      active_out_of_stock: Number(row?.active_out ?? 0),
      missing_barcode: Number(row?.missing_barcode ?? 0),
      missing_item_code: Number(row?.missing_item_code ?? 0),
      missing_usage_logs: Math.max(0, catalogTotal - loggedN),
      eviction_count: Number(row?.eviction ?? 0),
      total_items: catalogTotal,
    };
  }
}

export function createStaffHomeRepository(client: SqlClient): StaffHomeRepository {
  return new StaffHomeRepository(client);
}
