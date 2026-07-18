/**
 * T-SQL fragments for trade line amounts — port of trade_query.py.
 * Formula source: source-app/backend/app/services/trade_query.py
 */

/** Formula source: trade_query.py:TRADE_STATUS_EXCLUDED_FROM_REPORTS */
export const TRADE_STATUS_EXCLUDED_SQL = `('draft', 'cancelled', 'deleted')`;

/** Header status included in reports — Formula source: trade_query.py:trade_purchase_status_in_reports */
export function tradePurchaseStatusInReportsSql(alias = "tp"): string {
  return `${alias}.[status] NOT IN ${TRADE_STATUS_EXCLUDED_SQL}`;
}

/**
 * Line spend for aggregates.
 * Formula source: trade_query.py:trade_line_amount_expr
 * Prefer line_total; else weight path when snapshots agree within 0.05; else qty * landing.
 */
export function tradeLineAmountExprSql(lineAlias = "tpl"): string {
  const a = lineAlias;
  return `COALESCE(
    ${a}.[line_total],
    CASE
      WHEN ${a}.[kg_per_unit] IS NOT NULL
        AND ${a}.[landing_cost_per_kg] IS NOT NULL
        AND ${a}.[kg_per_unit] > 0
        AND ${a}.[landing_cost_per_kg] > 0
        AND COALESCE(${a}.[purchase_rate], ${a}.[landing_cost]) IS NOT NULL
        AND ABS((${a}.[kg_per_unit] * ${a}.[landing_cost_per_kg]) - COALESCE(${a}.[purchase_rate], ${a}.[landing_cost])) <= 0.05
      THEN ${a}.[qty] * ${a}.[kg_per_unit] * ${a}.[landing_cost_per_kg]
      ELSE ${a}.[qty] * COALESCE(${a}.[purchase_rate], ${a}.[landing_cost])
    END
  )`;
}

/**
 * Formula source: trade_query.py:trade_line_selling_expr
 */
export function tradeLineSellingExprSql(lineAlias = "tpl"): string {
  const a = lineAlias;
  return `CASE
    WHEN COALESCE(${a}.[selling_rate], ${a}.[selling_cost]) IS NOT NULL
    THEN ${a}.[qty] * COALESCE(${a}.[selling_rate], ${a}.[selling_cost])
    ELSE 0
  END`;
}

/**
 * Formula source: trade_query.py:trade_line_profit_expr
 */
export function tradeLineProfitExprSql(lineAlias = "tpl"): string {
  const a = lineAlias;
  return `COALESCE(
    ${a}.[profit],
    (${tradeLineSellingExprSql(a)}) - (${tradeLineAmountExprSql(a)})
  )`;
}

/**
 * Formula source: trade_query.py:trade_line_qty_when_unit_type (bag/box/tin)
 */
export function tradeLineQtyBagsExprSql(lineAlias = "tpl"): string {
  const a = lineAlias;
  return `CASE
    WHEN ${a}.[unit_type] = N'bag'
      OR (${a}.[unit_type] IS NULL AND (UPPER(${a}.[unit]) LIKE N'%SACK%' OR UPPER(${a}.[unit]) LIKE N'%BAG%'))
    THEN ${a}.[qty] ELSE 0 END`;
}

export function tradeLineQtyBoxesExprSql(lineAlias = "tpl"): string {
  const a = lineAlias;
  return `CASE
    WHEN ${a}.[unit_type] = N'box'
      OR (${a}.[unit_type] IS NULL AND UPPER(${a}.[unit]) LIKE N'%BOX%')
    THEN ${a}.[qty] ELSE 0 END`;
}

export function tradeLineQtyTinsExprSql(lineAlias = "tpl"): string {
  const a = lineAlias;
  return `CASE
    WHEN ${a}.[unit_type] = N'tin'
      OR (${a}.[unit_type] IS NULL AND UPPER(${a}.[unit]) LIKE N'%TIN%')
    THEN ${a}.[qty] ELSE 0 END`;
}

/**
 * Formula source: trade_query.py:trade_line_weight_expr
 * BOX/TIN → 0 kg; bag/kg contribute.
 */
export function tradeLineWeightExprSql(lineAlias = "tpl"): string {
  const a = lineAlias;
  return `CASE
    WHEN (
      ${a}.[unit_type] = N'bag'
      OR (${a}.[unit_type] IS NULL AND (
        UPPER(${a}.[unit]) LIKE N'%BAG%' OR UPPER(${a}.[unit]) LIKE N'%SACK%'
        OR UPPER(${a}.[unit]) IN (N'BG', N'BGS')
      ))
      OR ${a}.[unit_type] = N'kg'
      OR (${a}.[unit_type] IS NULL AND (
        UPPER(${a}.[unit]) LIKE N'%KG%' OR UPPER(${a}.[unit]) LIKE N'%KILO%'
      ))
    )
    THEN COALESCE(
      ${a}.[total_weight],
      CASE
        WHEN COALESCE(${a}.[weight_per_unit], ${a}.[kg_per_unit]) IS NOT NULL
          AND COALESCE(${a}.[weight_per_unit], ${a}.[kg_per_unit]) > 0
          AND (
            ${a}.[unit_type] = N'bag'
            OR (${a}.[unit_type] IS NULL AND (
              UPPER(${a}.[unit]) LIKE N'%BAG%' OR UPPER(${a}.[unit]) LIKE N'%SACK%'
              OR UPPER(${a}.[unit]) IN (N'BG', N'BGS')
            ))
          )
        THEN ${a}.[qty] * COALESCE(${a}.[weight_per_unit], ${a}.[kg_per_unit])
        WHEN ${a}.[unit_type] = N'kg'
          OR (${a}.[unit_type] IS NULL AND (
            UPPER(${a}.[unit]) LIKE N'%KG%' OR UPPER(${a}.[unit]) LIKE N'%KILO%'
          ))
        THEN ${a}.[qty]
        ELSE 0
      END
    )
    ELSE 0
  END`;
}
