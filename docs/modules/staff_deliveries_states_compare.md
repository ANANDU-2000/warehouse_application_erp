# Staff deliveries `/staff/deliveries` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_pending_deliveries_page.dart` (`ListSkeleton(rowCount: 6)` / `FriendlyLoadError`); `friendly_load_error.dart` (`kFriendlyLoadNetworkSubtitle`); `list_skeleton.dart` (rowHeight 84 default). Snapshot keepAlive 2m deferred (page remount refetch).

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff activity COMPARE · Staff deliveries SCAFFOLD → **STATES** |
| 🟡 Current | superseded — see [`staff_deliveries_compare.md`](staff_deliveries_compare.md) |
| ⬜ Pending | Next Subagent 4 stub / hold |
| ⏸ Deferred | receive **body** · barcode **body** · purchase entry · Settings · keepAlive 2m · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold load: ListSkeleton 6 × 84 | exact | `STAFF_DEL_SKELETON_*` | PASS |
| 2 | Error title `Could not load pending deliveries` | FriendlyLoadError.message | `mapStaffDelLoadTitle` | PASS |
| 3 | Subtitle `Tap to retry.` | kFriendlyLoadNetworkSubtitle | `mapStaffDelLoadSubtitle` | PASS |
| 4 | Retry invalidates / refetches | `invalidateStaffDeliverySurfaces` | `retryTick` | PASS |
| 5 | AppBar + scan stay during load/error | Scaffold appBar | same | PASS |
| 6 | Skeleton only when sections null + loading | AsyncValue | `showInitialSkeleton` / `hasData` | PASS |
| 7 | Error only when sections null + hasError | exact | `showError` / `!hasData` | PASS |
| 8 | No raw exception in UI | FriendlyLoadError | mapped title/subtitle only | PASS |
| 9 | Empty copy when total 0 | exact | exact | PASS |
| 10 | keepAlive 2m snapshot | api_read_snapshots | **Deferred** remount refetch | N/A |

**Smoke:** `npm run test:staff-deliveries-states` (+ scaffold→wire PASS); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE text Loading… / plain Retry; remove `staffDeliveriesLoadSubtitle.ts` + this compare + states script; boards → ask before STATES.

**Next (ask first):** superseded — see [`staff_deliveries_compare.md`](staff_deliveries_compare.md).
