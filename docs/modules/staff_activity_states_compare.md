# Staff activity `/staff/activity` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_activity_page.dart` (`ListSkeleton(rowCount: 10)` / `HexaErrorCard.fromError`); `hexa_error_card.dart` → `FriendlyLoadError`; `load_state_error.dart` (`loadStateErrorSubtitle`); `list_skeleton.dart` (rowHeight 84 default). No `RefreshIndicator` / no keepAlive (`FutureProvider.autoDispose`).

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff low-stock COMPARE · Staff activity SCAFFOLD → **STATES** |
| 🟡 Current | superseded — see [`staff_activity_compare.md`](staff_activity_compare.md) |
| ⬜ Pending | Next Subagent 4 stub |
| ⏸ Deferred | purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold load: ListSkeleton 10 × 84 | exact | `STAFF_ACT_SKELETON_*` | PASS |
| 2 | Error title `Could not load activity` | HexaErrorCard.fromError | `mapStaffActLoadTitle` | PASS |
| 3 | Subtitle `loadStateErrorSubtitle` / default `Tap to retry.` | exact | `mapStaffActLoadSubtitle` | PASS |
| 4 | Retry invalidates / refetches | provider invalidate | `retryTick` | PASS |
| 5 | AppBar + period chips stay during load/error | Column outside Expanded | same | PASS |
| 6 | Skeleton/error only in results | AsyncValue.when | `showInitialSkeleton` / `showError` | PASS |
| 7 | No raw exception in UI | HexaErrorCard | mapped title/subtitle only | PASS |
| 8 | Empty copy when data [] | exact | exact | PASS |
| 9 | RefreshIndicator | none | none | PASS |
| 10 | keepAlive TTL | autoDispose | none | PASS |

**Smoke:** `npm run test:staff-activity-states` (+ scaffold→wire PASS); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE text Loading… / plain Retry; remove `staffActivityLoadSubtitle.ts` + this compare + states script; boards → ask before STATES.

**Next (ask first):** COMPARE — do not start until approved.
