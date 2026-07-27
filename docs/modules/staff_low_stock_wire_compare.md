# Staff low stock `/staff/low-stock` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `low_stock_providers.dart` · `hexa_api.listLowStockOperations` / `notifyOwnerStockItem` · `stock_list.low_stock_operations` · `stock_detail.notify_owner_about_item` · `stock_helpers` pending/period/last-PO maps

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff purchase-history COMPARE · Staff low-stock SCAFFOLD → **WIRE** |
| 🟡 Current | `/staff/low-stock` **WIRE PASS** — ask before STATES |
| ⬜ Pending | STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | PDF/CSV bytes · + Stock / reorder sheets · `/low-stock/operations/summary` KPI endpoint · server-side filter/sort/dispute bands · staff_quick period qty · owner `/stock/low-stock` · purchase entry · barcode/print · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Ops list path | `GET …/stock/low-stock/operations` | same route + `listLowStockOperations` | PASS |
| 2 | Shortage candidates | `status=shortage` pool | `listStock({ status: "shortage" })` + enrich | PASS |
| 3 | Period query | `period_start` / `period_end` from HomePeriod | `homePeriodApiDates("month")` default | PASS |
| 4 | Pending / period / last PO fields | `_pending_order_meta_map` / `_period_purchased_map` / `_last_trade_meta_map` | repo maps + `qty_in_stock_unit` prefer | PASS |
| 5 | Supplier name | `_supplier_names_bulk` | `supplierNameMap` via `last_supplier_id` | PASS |
| 6 | Group tree | `groupLowStockOperationItems` | same helper | PASS |
| 7 | Inform owner HTTP | `POST …/stock/{id}/notify-owner` | same + notifications INSERT + dedupe | PASS |
| 8 | Inform success snack | `Owner notified about {name}` | `staffLsOwnerNotified` | PASS |
| 9 | Loading / error / retry | AsyncValue | `data-slot="loading\|error"` + retry | PASS* |
| 10 | PDF/CSV bytes | Yes | **Deferred** | N/A |
| 11 | + Stock / Set reorder | Yes | **Deferred** | N/A |
| 12 | Ops summary KPI route | `GET …/low-stock/operations/summary` | **Deferred** (attention uses client tab counts) | N/A |
| 13 | Server filter/sort/dispute | filter/sort/dispute enrichment | Client tabs only (FIELDS) | N/A |

\*Skeleton/cache polish → STATES.

**Smoke:** `npm run test:staff-low-stock-wire` (+ scaffold→buttons); backend types compile via `npm run build` (frontend).

**Rollback:** Revert WIRE commit; restore BUTTONS empty `EMPTY_GROUPED` + deferred notify; remove `staffLowStockApi.ts` / load-subtitle / repo ops+notify / routes / this compare + script; boards → ask before WIRE.

**Next (ask first):** STATES — do not start until approved.
