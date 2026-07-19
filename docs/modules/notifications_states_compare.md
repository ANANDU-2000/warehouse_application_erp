# Notifications `/notifications` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `notifications_page.dart` (loading/error/empty/RefreshIndicator); `load_state_error.dart`; `friendly_load_error.dart`

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · **STATES** |
| 🟡 Current | STATES PASS — ask before **COMPARE** |
| ⬜ Pending | COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | Purchase-due synthetics; Approve/Review card actions |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Linear progress while server loading | `LinearProgressIndicator` 2px | `notifications-page__progress` | PASS |
| 2 | Empty gated until server+stock idle | `showEmptyState` | `!serverLoading && !stockLoading` | PASS |
| 3 | Error title exact | `Could not refresh server notifications` | same constant | PASS |
| 4 | Subtitle via `loadStateErrorSubtitle` | status map + Tap to retry. | `mapNotificationsLoadSubtitle` | PASS |
| 5 | Warning icon + refresh trailing | ListTile | error icon + retry btn | PASS |
| 6 | Search/filters stay during load | Yes | same | PASS |
| 7 | Split server vs stock loads | Independent providers | sequential try blocks | PASS |
| 8 | `hasUnread` from visible list | `visible.any` | `visible.some` | PASS |
| 9 | No raw stack in error UI | Yes | mapped subtitle only | PASS |
| 10 | Pull-to-refresh invalidates | `RefreshIndicator` | touch pull → `retryTick` | PASS |
| 11 | Purchase-due / Approve-Review | Yes | **Deferred** | N/A |

**Smoke:** `npm run test:notifications-states` (+ scaffold→wire PASS); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE raw `loadErrorMessage` + ungated empty; remove load-subtitle helper + this compare + script; boards → ask before STATES.

**Next (ask first):** `/notifications` COMPARE.
