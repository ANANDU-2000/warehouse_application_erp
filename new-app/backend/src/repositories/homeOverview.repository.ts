/**
 * Home-overview / trade-dashboard-snapshot queries.
 * Formula source: reports_trade.py:_compute_trade_dashboard_snapshot_payload
 * Columns: ddl/04_trade.sql + ddl/02_catalog.sql
 */
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient } from "./sql";
import {
  tradeLineAmountExprSql,
  tradeLineQtyBagsExprSql,
  tradeLineQtyBoxesExprSql,
  tradeLineQtyTinsExprSql,
  tradeLineSellingExprSql,
  tradeLineWeightExprSql,
  tradePurchaseStatusInReportsSql,
} from "../services/tradeLineSql";

export type SnapshotSumRow = {
  deals: number;
  total_purchase: number;
  total_qty: number;
  total_selling: number;
};

export type UnitRollRow = {
  total_bags: number;
  total_boxes: number;
  total_tins: number;
  total_kg: number;
};

export type NestCatRow = {
  category_id: string;
  category_name: string;
  item_name: string;
  unit: string | null;
  unit_type: string | null;
  amount: number;
  qty: number;
  catalog_item_id: string | null;
};

export type CountRow = { c: number };

export type InventorySummaryRow = {
  total_value_inr: number;
  bags: number;
  boxes: number;
  tins: number;
  kg: number;
  item_count: number;
};

export class HomeOverviewRepository {
  constructor(private readonly client: SqlClient) {}

  async snapshotSums(
    businessId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<SnapshotSumRow> {
    const amt = tradeLineAmountExprSql("tpl");
    const sell = tradeLineSellingExprSql("tpl");
    const row = await queryOne<SnapshotSumRow>(
      this.client,
      `SELECT
         COUNT(DISTINCT tp.[id]) AS deals,
         COALESCE(SUM(${amt}), 0) AS total_purchase,
         COALESCE(SUM(tpl.[qty]), 0) AS total_qty,
         COALESCE(SUM(${sell}), 0) AS total_selling
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND ${tradePurchaseStatusInReportsSql("tp")}`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return (
      row ?? { deals: 0, total_purchase: 0, total_qty: 0, total_selling: 0 }
    );
  }

  async unitRollups(
    businessId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<UnitRollRow> {
    const bags = tradeLineQtyBagsExprSql("tpl");
    const boxes = tradeLineQtyBoxesExprSql("tpl");
    const tins = tradeLineQtyTinsExprSql("tpl");
    const kg = tradeLineWeightExprSql("tpl");
    const row = await queryOne<UnitRollRow>(
      this.client,
      `SELECT
         COALESCE(SUM(${bags}), 0) AS total_bags,
         COALESCE(SUM(${boxes}), 0) AS total_boxes,
         COALESCE(SUM(${tins}), 0) AS total_tins,
         COALESCE(SUM(${kg}), 0) AS total_kg
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND ${tradePurchaseStatusInReportsSql("tp")}`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return row ?? { total_bags: 0, total_boxes: 0, total_tins: 0, total_kg: 0 };
  }

  async categoryNest(
    businessId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<NestCatRow[]> {
    const amt = tradeLineAmountExprSql("tpl");
    return queryMany<NestCatRow>(
      this.client,
      `SELECT
         CASE WHEN ic.[id] IS NOT NULL THEN CONVERT(NVARCHAR(36), ic.[id]) ELSE N'_uncat' END AS category_id,
         COALESCE(ic.[name], N'Uncategorised') AS category_name,
         tpl.[item_name] AS item_name,
         MAX(tpl.[unit]) AS unit,
         MAX(tpl.[unit_type]) AS unit_type,
         COALESCE(SUM(${amt}), 0) AS amount,
         COALESCE(SUM(tpl.[qty]), 0) AS qty,
         MAX(CONVERT(NVARCHAR(36), tpl.[catalog_item_id])) AS catalog_item_id
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       LEFT JOIN catalog_items ci
         ON ci.[id] = tpl.[catalog_item_id]
         AND ci.[deleted_at] IS NULL
         AND ci.[business_id] = @businessId
       LEFT JOIN item_categories ic
         ON ic.[id] = ci.[category_id]
         AND ic.[business_id] = @businessId
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND ${tradePurchaseStatusInReportsSql("tp")}
       GROUP BY
         CASE WHEN ic.[id] IS NOT NULL THEN CONVERT(NVARCHAR(36), ic.[id]) ELSE N'_uncat' END,
         COALESCE(ic.[name], N'Uncategorised'),
         tpl.[item_name]`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
  }

  async pendingDeliveryCount(businessId: string): Promise<number> {
    const row = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(*) AS c FROM trade_purchases tp
       WHERE tp.[business_id] = @businessId
         AND tp.[is_delivered] = 0
         AND tp.[status] NOT IN (N'deleted', N'cancelled')`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    return Number(row?.c ?? 0);
  }

  async supplierCount(
    businessId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<number> {
    const row = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(DISTINCT tp.[supplier_id]) AS c
       FROM trade_purchases tp
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND ${tradePurchaseStatusInReportsSql("tp")}
         AND tp.[supplier_id] IS NOT NULL`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return Number(row?.c ?? 0);
  }

  async brokerCount(
    businessId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<number> {
    const row = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(DISTINCT tp.[broker_id]) AS c
       FROM trade_purchases tp
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND ${tradePurchaseStatusInReportsSql("tp")}
         AND tp.[broker_id] IS NOT NULL`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return Number(row?.c ?? 0);
  }

  async receivedDeliveryCount(
    businessId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<number> {
    const row = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(*) AS c FROM trade_purchases tp
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @dateFrom
         AND tp.[purchase_date] <= @dateTo
         AND ${tradePurchaseStatusInReportsSql("tp")}
         AND tp.[is_delivered] = 1`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "dateFrom", type: sql.Date, value: dateFrom },
        { name: "dateTo", type: sql.Date, value: dateTo },
      ],
    );
    return Number(row?.c ?? 0);
  }

  async negativeStockCount(businessId: string): Promise<number> {
    const row = await queryOne<CountRow>(
      this.client,
      `SELECT COUNT(*) AS c FROM catalog_items
       WHERE [business_id] = @businessId
         AND [deleted_at] IS NULL
         AND [current_stock] < 0`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );
    return Number(row?.c ?? 0);
  }

  /**
   * Formula source: stock_inventory.py:compute_inventory_summary
   */
  async inventorySummary(businessId: string): Promise<InventorySummaryRow> {
    const rows = await queryMany<{
      current_stock: number | null;
      default_landing_cost: number | null;
      last_purchase_price: number | null;
      stock_unit: string | null;
      default_unit: string | null;
      selling_unit: string | null;
    }>(
      this.client,
      `SELECT [current_stock], [default_landing_cost], [last_purchase_price],
              [stock_unit], [default_unit], [selling_unit]
       FROM catalog_items
       WHERE [business_id] = @businessId AND [deleted_at] IS NULL`,
      [{ name: "businessId", type: sql.UniqueIdentifier, value: businessId }],
    );

    let total_value_inr = 0;
    let bags = 0;
    let boxes = 0;
    let tins = 0;
    let kg = 0;
    let item_count = 0;

    for (const r of rows) {
      const qty = Number(r.current_stock ?? 0);
      if (qty <= 0) continue;
      item_count += 1;
      const dlc = Number(r.default_landing_cost ?? 0);
      const lpp = Number(r.last_purchase_price ?? 0);
      const rate = dlc > 0 ? dlc : lpp > 0 ? lpp : 0;
      if (rate > 0) total_value_inr += qty * rate;

      const u = `${r.stock_unit ?? ""} ${r.default_unit ?? ""} ${r.selling_unit ?? ""}`.toLowerCase();
      if (u.includes("bag") || u.includes("sack")) bags += qty;
      else if (u.includes("box")) boxes += qty;
      else if (u.includes("tin")) tins += qty;
      else kg += qty;
    }

    return { total_value_inr, bags, boxes, tins, kg, item_count };
  }
}

export function createHomeOverviewRepository(
  client: SqlClient,
): HomeOverviewRepository {
  return new HomeOverviewRepository(client);
}
