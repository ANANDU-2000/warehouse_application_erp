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
import { queryMany, queryOne, type SqlClient } from "./sql";

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

function moneyStr(n: number): string {
  return (Number.isFinite(n) ? n : 0).toFixed(2);
}

function itemOut(r: CatalogRow): StockListItemOut {
  return {
    id: r.id,
    name: r.name,
    item_code: r.item_code,
    current_stock: Number(r.current_stock ?? 0),
    reorder_level: Number(r.reorder_level ?? 0),
    unit: r.stock_unit ?? r.default_unit,
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
    missingItemCode?: boolean;
  }): Promise<StockListOut> {
    const where: string[] = [
      "ci.[business_id] = @businessId",
      "ci.[deleted_at] IS NULL",
    ];
    if (opts.status === "low") {
      where.push(LOW_STOCK_SQL);
    }
    if (opts.missingItemCode) {
      where.push(
        `(ci.[item_code] IS NULL OR LTRIM(RTRIM(COALESCE(ci.[item_code], N''))) = N'')`,
      );
    }
    const whereSql = where.join(" AND ");

    let orderSql = "LOWER(ci.[name]) ASC";
    if (opts.sort === "stock_asc") {
      orderSql = "COALESCE(ci.[current_stock], 0) ASC";
    } else if (opts.sort === "stock_desc") {
      orderSql = "COALESCE(ci.[current_stock], 0) DESC";
    }

    const totalRow = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(ci.[id]) AS c
       FROM catalog_items ci
       WHERE ${whereSql}`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId }],
    );
    const total = Number(totalRow?.c ?? 0);
    const page = Math.max(1, opts.page);
    const perPage = Math.min(500, Math.max(1, opts.perPage));
    const offset = (page - 1) * perPage;

    if (total === 0) {
      return { items: [], total: 0, page, per_page: perPage };
    }

    const rows = await queryMany<CatalogRow>(
      this.client,
      `SELECT ci.[id], ci.[name], ci.[item_code], ci.[current_stock],
              ci.[reorder_level], ci.[stock_unit], ci.[default_unit]
       FROM catalog_items ci
       WHERE ${whereSql}
       ORDER BY ${orderSql}
       OFFSET @offset ROWS FETCH NEXT @perPage ROWS ONLY`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: opts.businessId },
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
}

export function createStaffHomeRepository(client: SqlClient): StaffHomeRepository {
  return new StaffHomeRepository(client);
}
