# Dashboard — Subagent 2 (DB cross-check)

**Branch:** `ops/dashboard-module`  
**Stage:** Subagent 2 — DDL verification  
**DDL:** [`04_trade.sql`](../../new-app/database/ddl/04_trade.sql), [`02_catalog.sql`](../../new-app/database/ddl/02_catalog.sql)  
**Audited:** `dashboard.repository.ts`, `homeOverview.repository.ts`, `tradeLineSql.ts`

## Summary

| Result | Count |
|---|---|
| Column exists + type OK | All referenced columns |
| Tenant `business_id` in WHERE/JOIN | PASS after one fix (see below) |
| SQL logic changes this stage | 1 (categoryNest catalog/category tenant join) |
| Tests re-run | `tests/dashboard/dashboard.test.ts` — PASS |

**S1 Unknowns** (item_slices / suppliers / home_operational stubs / ETag): accepted deferred — out of S2 scope.

## Fix applied this stage

| Issue | Fix |
|---|---|
| `categoryNest` joined `catalog_items` / `item_categories` without `business_id` on the join | Added `ci.business_id = @businessId` and `ic.business_id = @businessId` on LEFT JOINs |

## Joins

| Join | Exists / valid? |
|---|---|
| `tpl.trade_purchase_id` → `tp.id` | PASS (column + PK) |
| `tpl.catalog_item_id` → `ci.id` | PASS |
| `ci.category_id` → `ic.id` | PASS |

---

## tradeLineSql column audit

| Table.Column | Exists? | DDL type | Match? |
|---|---|---|---|
| trade_purchase_lines.line_total | Yes | DECIMAL(14,2) NULL | PASS |
| trade_purchase_lines.kg_per_unit | Yes | DECIMAL(12,3) NULL | PASS |
| trade_purchase_lines.landing_cost_per_kg | Yes | DECIMAL(12,2) NULL | PASS |
| trade_purchase_lines.purchase_rate | Yes | DECIMAL(12,2) NULL | PASS |
| trade_purchase_lines.landing_cost | Yes | DECIMAL(12,2) NOT NULL | PASS |
| trade_purchase_lines.qty | Yes | DECIMAL(12,3) NOT NULL | PASS |
| trade_purchase_lines.selling_rate | Yes | DECIMAL(12,2) NULL | PASS |
| trade_purchase_lines.selling_cost | Yes | DECIMAL(12,2) NULL | PASS |
| trade_purchase_lines.profit | Yes | DECIMAL(14,2) NULL | PASS |
| trade_purchase_lines.unit_type | Yes | NVARCHAR(16) NULL | PASS |
| trade_purchase_lines.unit | Yes | NVARCHAR(32) NOT NULL | PASS |
| trade_purchase_lines.total_weight | Yes | DECIMAL(14,3) NULL | PASS |
| trade_purchase_lines.weight_per_unit | Yes | DECIMAL(12,3) NULL | PASS |
| trade_purchases.status | Yes | NVARCHAR(24) NOT NULL | PASS |

---

## Query × column matrix

| Query (method) | Table.Column | Exists? | Type match? | business_id scoped? |
|---|---|---|---|---|
| monthLineAgg | tp.id | Yes | UNIQUEIDENTIFIER | Yes (WHERE) |
| monthLineAgg | tp.business_id | Yes | UNIQUEIDENTIFIER | Yes |
| monthLineAgg | tp.purchase_date | Yes | DATE | Yes |
| monthLineAgg | tp.status | Yes | NVARCHAR(24) | via status filter |
| monthLineAgg | tpl.trade_purchase_id | Yes | UNIQUEIDENTIFIER | via join |
| monthLineAgg | *(amount expr cols)* | Yes | see tradeLineSql | Yes via tp |
| monthPaidTotal | tp.paid_amount | Yes | DECIMAL(14,2) | Yes |
| monthPaidTotal | tp.business_id, purchase_date, status | Yes | — | Yes |
| monthLineProfit | *(profit expr cols)* | Yes | — | Yes |
| topItemSpend | tpl.item_name | Yes | NVARCHAR(512) | Yes |
| topItemSpend | tpl.qty | Yes | DECIMAL(12,3) | Yes |
| snapshotSums | same trade cols + selling expr | Yes | — | Yes |
| unitRollups | bag/box/tin/kg expr cols | Yes | — | Yes |
| categoryNest | tpl.item_name, unit, unit_type, qty, catalog_item_id | Yes | — | Yes |
| categoryNest | ci.id, deleted_at, business_id, category_id | Yes | — | Yes (JOIN + WHERE) |
| categoryNest | ic.id, name, business_id | Yes | — | Yes (JOIN) |
| pendingDeliveryCount | tp.is_delivered, status, business_id | Yes | BIT / NVARCHAR | Yes |
| supplierCount | tp.supplier_id | Yes | UNIQUEIDENTIFIER NOT NULL | Yes |
| brokerCount | tp.broker_id | Yes | UNIQUEIDENTIFIER NULL | Yes |
| receivedDeliveryCount | tp.is_delivered + date filter | Yes | — | Yes |
| negativeStockCount | catalog_items.business_id, deleted_at, current_stock | Yes | DECIMAL(12,3) | Yes |
| inventorySummary | current_stock, default_landing_cost, last_purchase_price, stock_unit, default_unit, selling_unit | Yes | — | Yes |

---

## PASS/FAIL (Subagent 2)

| Check | Status |
|---|---|
| All S1 columns exist in DDL | **PASS** |
| Types compatible with usage (money/qty/date/bit) | **PASS** |
| Trade queries tenant-scoped | **PASS** |
| Catalog queries tenant-scoped | **PASS** (after JOIN fix) |
| No invented columns | **PASS** |

## Rollback

Revert the categoryNest JOIN commit; delete this report file if abandoning S2.

## Next

**STOP.** After approve → Subagent 3 frontend `/home` SCAFFOLD only (one route).
