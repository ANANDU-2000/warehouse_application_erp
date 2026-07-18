# Staff `/staff/home` — WIRE-2a compare (Warehouse & Purchases stats)

**Branch:** `ops/dashboard-module`  
**Sources:** `StaffHomeWarehousePurchaseStats` in `staff_home_dashboard_widgets.dart`; `stockOnHandTotalsProvider` / `stockTotalsProvider(AppPeriod.month)`; `stock_ops.stock_totals`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/stock/totals` on-hand (no period) | Yes | `stockTotalsOnHand` | PASS |
| 2 | `GET …/stock/totals?period_start&period_end` | Yes | `stockTotalsPurchased` | PASS |
| 3 | Month = calendar day 1 → today | `AppPeriod.month` | `staffAppPeriodMonthDates` | PASS |
| 4 | Not owner rolling-30 / home-overview | Staff never | No call | PASS |
| 5 | Dual boxes Warehouse / Purchases | `_StatsBox` | Same titles/subtitles | PASS |
| 6 | Unit grid Bags / KG / Box / Tin + colors | Yes | Exact labels + hex | PASS |
| 7 | Inline errors + Retry | SectionInlineError | Exact messages | PASS |
| 8 | Loading 2px bar | LinearProgressIndicator | CSS progress | PASS |
| 9 | Tap → `/staff/stock` / `/staff/deliveries` | Yes | navigate stubs | PASS |
| 10 | Pending cards / shift / activity / notif | Later WIRE-2 | Deferred | N/A |

**Smoke:** `npm run test:staff-home-wire2a`  
**Rollback:** Revert WIRE-2a commit; remove `/totals` route + warehouse body bind.  
**Next:** Staff WIRE-2b PASS — see [`staff_home_wire2b_compare.md`](staff_home_wire2b_compare.md). Next WIRE-2c shift strip.
