# Staff stock `/staff/stock` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `stockListProvider` · `hexa_api.listStock` · `stock_helpers._query_items` / `_stock_status_sql_filter` / `_latest_physical_count_map` · `StockWarehouseRow` / `StockRowMetrics`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff items COMPARE · Staff stock SCAFFOLD→**WIRE** · STATES · **COMPARE** |
| 🟡 Current | Staff stock **COMPARE PASS** — ask before next stub |
| ⬜ Pending | `/staff/purchase-history` · other Subagent 4 stubs |
| ⏸ Deferred | delivery-indicator-counts · Activity feed · period purchased totals · shell-bundle · subcategory/supplier pickers |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/stock/list` membership | Yes | existing staffHome routes | PASS |
| 2 | per_page default 50 · max 2000 | StockListQuery | `STAFF_STOCK_PER_PAGE` + backend clamp | PASS |
| 3 | Bootstrap sort `recent` | `_bootstrapStockListQueryOnce` | `STAFF_STOCK_DEFAULT_SORT` | PASS |
| 4 | Status all / shortage / out (+ low/critical SQL) | `_stock_status_sql_filter` | `stockStatusWhereSql` | PASS |
| 5 | Search `q` name/code/barcode | `_query_items` | `@qLike` | PASS |
| 6 | missing_barcode / missing_item_code / reorder_only / unit | query flags | controller + repo | PASS |
| 7 | Physical qty from latest count | `_latest_physical_count_map` | `OUTER APPLY stock_physical_counts` | PASS |
| 8 | SYS = current_stock · PHYS · DIFF | StockRowMetrics | `staffStockRowMetrics` | PASS |
| 9 | Rows render + tap → `/catalog/item/:id` | StockWarehouseRow | `data-slot="itemRow"` | PASS |
| 10 | Paginate load more | scroll page++ | `data-action="load-more"` | PASS |
| 11 | Loading / error + Retry (basic) | AsyncValue | slots (STATES polishes map) | PASS* |
| 12 | Delivery indicator chips | counts provider | **Deferred** `data-deferred` | N/A |
| 13 | Activity tab feed | StockChangesTab | **Deferred** `data-deferred` | N/A |
| 14 | Period purchased / includePeriod | applyStockPagePeriod | **Deferred** (period UI local only) | N/A |
| 15 | shell-bundle first page | stockShellBundleProvider | **Deferred** | N/A |

\*FriendlyLoadError subtitle map deferred to STATES.

**Smoke:** `npm run test:staff-stock-wire` (+ prior PASS); backend `vitest` `tests/stock/stockStatus.test.ts`; `npm run build` PASS.

**Rollback:** Revert WIRE commit; restore BUTTONS empty catalog; remove `staffStockApi.ts` / row metrics; roll back listStock query extensions if needed; boards → ask before WIRE.

**Next (ask first):** COMPARE done — [`staff_stock_compare.md`](staff_stock_compare.md). Ask before next Subagent 4 stub.
