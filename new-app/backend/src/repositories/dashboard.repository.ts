/**
 * Month dashboard queries — port of dashboard.py:_compute_month_dashboard_payload.
 * Columns: new-app/database/ddl/04_trade.sql
 */
import { sql } from "../config/database";
import { queryMany, queryOne, type SqlClient } from "./sql";
import {
  tradeLineAmountExprSql,
  tradeLineProfitExprSql,
  tradePurchaseStatusInReportsSql,
} from "../services/tradeLineSql";

export type MonthAggRow = {
  line_total: number;
  purchase_count: number;
};

export type PaidRow = { paid_total: number };
export type ProfitRow = { line_profit: number };

export type ItemSpendRow = {
  item_name: string;
  spend: number;
  pf: number;
  tq: number;
};

export class DashboardRepository {
  constructor(private readonly client: SqlClient) {}

  async monthLineAgg(
    businessId: string,
    start: string,
    end: string,
  ): Promise<MonthAggRow> {
    const amt = tradeLineAmountExprSql("tpl");
    const row = await queryOne<MonthAggRow>(
      this.client,
      `SELECT
         COALESCE(SUM(${amt}), 0) AS line_total,
         COUNT(DISTINCT tp.[id]) AS purchase_count
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @start
         AND tp.[purchase_date] <= @end
         AND ${tradePurchaseStatusInReportsSql("tp")}`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "start", type: sql.Date, value: start },
        { name: "end", type: sql.Date, value: end },
      ],
    );
    return row ?? { line_total: 0, purchase_count: 0 };
  }

  async monthPaidTotal(
    businessId: string,
    start: string,
    end: string,
  ): Promise<number> {
    const row = await queryOne<PaidRow>(
      this.client,
      `SELECT COALESCE(SUM(tp.[paid_amount]), 0) AS paid_total
       FROM trade_purchases tp
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @start
         AND tp.[purchase_date] <= @end
         AND ${tradePurchaseStatusInReportsSql("tp")}`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "start", type: sql.Date, value: start },
        { name: "end", type: sql.Date, value: end },
      ],
    );
    return Number(row?.paid_total ?? 0);
  }

  async monthLineProfit(
    businessId: string,
    start: string,
    end: string,
  ): Promise<number> {
    const prof = tradeLineProfitExprSql("tpl");
    const row = await queryOne<ProfitRow>(
      this.client,
      `SELECT COALESCE(SUM(${prof}), 0) AS line_profit
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @start
         AND tp.[purchase_date] <= @end
         AND ${tradePurchaseStatusInReportsSql("tp")}`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "start", type: sql.Date, value: start },
        { name: "end", type: sql.Date, value: end },
      ],
    );
    return Number(row?.line_profit ?? 0);
  }

  async topItemSpend(
    businessId: string,
    start: string,
    end: string,
    limit = 20,
  ): Promise<ItemSpendRow[]> {
    const amt = tradeLineAmountExprSql("tpl");
    const prof = tradeLineProfitExprSql("tpl");
    return queryMany<ItemSpendRow>(
      this.client,
      `SELECT TOP (@lim)
         tpl.[item_name] AS item_name,
         COALESCE(SUM(${amt}), 0) AS spend,
         COALESCE(SUM(${prof}), 0) AS pf,
         COALESCE(SUM(tpl.[qty]), 0) AS tq
       FROM trade_purchase_lines tpl
       INNER JOIN trade_purchases tp ON tp.[id] = tpl.[trade_purchase_id]
       WHERE tp.[business_id] = @businessId
         AND tp.[purchase_date] >= @start
         AND tp.[purchase_date] <= @end
         AND ${tradePurchaseStatusInReportsSql("tp")}
       GROUP BY tpl.[item_name]
       ORDER BY SUM(${amt}) DESC`,
      [
        { name: "businessId", type: sql.UniqueIdentifier, value: businessId },
        { name: "start", type: sql.Date, value: start },
        { name: "end", type: sql.Date, value: end },
        { name: "lim", type: sql.Int, value: limit },
      ],
    );
  }
}

export function createDashboardRepository(client: SqlClient): DashboardRepository {
  return new DashboardRepository(client);
}
