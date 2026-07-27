# Owner `/home/activity` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `_fetchHomeWarehouseActivity` in `home_owner_dashboard_providers.dart`; `home_activity_units.dart`; FastAPI `trade_purchases` list + `stock/audit/recent` + `stock/staff-purchases`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/trade-purchases` (limit page 50, from/to, status=all) | Yes | `listTradePurchases` + repo | PASS |
| 2 | `GET …/stock/audit/recent` (limit 250) | Yes | `listStockAuditRecent` | PASS |
| 3 | `GET …/stock/staff-purchases` (limit 30) | Yes | `listStaffPurchaseLogs` | PASS |
| 4 | Merge keepKinds + delivery collapse | Yes | `homeActivityFeed.ts` | PASS |
| 5 | Period window filter + API dates | `homePeriodRange` | Shared `homePeriod.ts` | PASS |
| 6 | Full page limits 60 / 200 / 30s | Yes | Same defaults | PASS |
| 7 | Debounce period refetch 150ms | Home pills | `setTimeout` 150 | PASS |
| 8 | Card title + `N events in period` | Yes | Bound | PASS |
| 9 | Rows Bill · Qty · Verified | DetailRow columns | Display-only rows | PASS |
| 10 | Minimal loading copy | Spinner | `Loading activity…` | PASS |
| 11 | Not month `GET /dashboard` | Never | No UI call | PASS |
| 12 | Skeletons / empty HexaEmptyState / Retry | Yes | **Deferred STATES** | N/A |
| 13 | Row tap / detail sheet | Yes | **Deferred** | N/A |
| 14 | Audit variance_expected map | Optional | null | N/A |

**Rollback:** Revert WIRE commit; remove homeActivity repo/routes; restore BUTTONS-only page (no feed fetch).

**Next:** `/home/activity` STATES PASS — see [`home_activity_states_compare.md`](home_activity_states_compare.md). Next COMPARE.
