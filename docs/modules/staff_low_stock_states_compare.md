# Staff low stock `/staff/low-stock` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `low_stock_dashboard_page.dart` (`AsyncValue.when` loading/error/data); `load_state_error.dart` (`loadStateErrorSubtitle`); `friendly_load_error.dart` (`Tap to retry.`); `_scheduleLoadSlowTimer` 10s; `RefreshIndicator`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff purchase-history COMPARE · Staff low-stock SCAFFOLD → **STATES** |
| 🟡 Current | `/staff/low-stock` **STATES PASS** — ask before COMPARE |
| ⬜ Pending | COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | PDF/CSV bytes · + Stock / reorder sheets · ops summary KPI · ListSkeleton (Flutter uses spinner) · keepAlive TTL (ops provider is autoDispose) · purchase entry · barcode/print · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold load: center CircularProgressIndicator | exact | `staff-ls-spinner` + `CircularProgressIndicator` aria | PASS |
| 2 | After 10s still loading: `Taking longer than usual` + Refresh | `_scheduleLoadSlowTimer` | `STAFF_LS_LOAD_SLOW_MS` / `STAFF_LS_SLOW_LOAD` | PASS |
| 3 | Error title `Could not load low stock` | exact | `STAFF_LS_LOAD_FAILED` | PASS |
| 4 | Subtitle `loadStateErrorSubtitle` / default `Tap to retry.` | exact | `mapStaffLsLoadSubtitle` | PASS |
| 5 | Retry refreshes ops | invalidate providers | `retryTick` | PASS |
| 6 | AppBar title+back stay during load/error | Scaffold appBar | same | PASS |
| 7 | Search/tabs/attention only when data | `maybeWhen(data:)` bottom | `showDataChrome` | PASS |
| 8 | Export actions only when data | `maybeWhen(data:)` actions | `showDataChrome` | PASS |
| 9 | Pull-to-refresh | RefreshIndicator | touch pull → retry | PASS |
| 10 | No raw exception in UI | FriendlyLoadError | mapped title/subtitle only | PASS |
| 11 | ListSkeleton / 2m keepAlive | N/A (spinner; autoDispose) | **N/A** | N/A |
| 12 | PDF/CSV bytes · + Stock / reorder | — | **Deferred** | N/A |

**Smoke:** `npm run test:staff-low-stock-states` (+ scaffold→wire PASS); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE always-on chrome + text loading; roll back load-subtitle HTTP map + this compare + script; boards → ask before STATES.

**Next (ask first):** COMPARE — do not start until approved.
