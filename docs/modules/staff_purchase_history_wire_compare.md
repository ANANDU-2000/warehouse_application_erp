# Staff purchase history `/staff/purchase-history` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `staffTradePurchasesHistoryProvider` · `staffLowStockAlertsProvider` · `hexa_api.listTradePurchases` / `listStock` · `homeActivity.listTradePurchases`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff stock COMPARE · Staff purchase-history SCAFFOLD → **WIRE** |
| 🟡 Current | `/staff/purchase-history` **WIRE PASS** — ask before STATES |
| ⬜ Pending | STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | full pack · delivery badge · staff amount redact · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/trade-purchases` paginate 50 · max 500 | provider loop | `fetchStaffPhPurchases` | PASS |
| 2 | Period today / week(Mon) / allTime → purchase_from/to | `_todayApiDate` / weekday | `staffPhPeriodRange` | PASS |
| 3 | List fields status · broker · items_count · is_delivered | TradePurchaseOut | homeActivity SELECT extended | PASS |
| 4 | Sort purchase_date DESC | provider sort | same | PASS |
| 5 | Low tab: `listStock` status=low sort=stock_asc perPage=8 | staffLowStockAlertsProvider | `fetchStaffPhLowStock` | PASS |
| 6 | Tab label `Low stock (N)` when data | lowAsync.maybeWhen | `lowRows.length` | PASS |
| 7 | Client filters still apply after fetch | `_filterPurchases` | same | PASS |
| 8 | Loading / error + Retry (basic) | AsyncValue | slots (STATES polishes) | PASS* |
| 9 | Rows render + detail / Inform owner nav | BUTTONS | same | PASS |
| 10 | Full pack summary / delivery badge | include_lines / badge | **Deferred** | N/A |
| 11 | RefreshIndicator | Yes | **Deferred** STATES | N/A |
| 12 | Staff financial redaction | `redact_trade_purchase_dict` | **Deferred** (UI hides ₹) | N/A |
| 13 | Detail page body | StaffPurchaseOrderDetailPage | stub route | N/A |

\*FriendlyLoadError subtitle map deferred to STATES.

**Smoke:** `npm run test:staff-purchase-history-wire` (+ prior PASS); `npm run build` PASS.

**Rollback:** Revert WIRE commit; restore BUTTONS empty catalogs; roll back homeActivity SELECT extras if needed; remove api/period modules + this compare + script; boards → ask before WIRE.

**Next (ask first):** STATES done — see [`staff_purchase_history_states_compare.md`](staff_purchase_history_states_compare.md). Ask before COMPARE.
