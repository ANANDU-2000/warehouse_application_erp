# Staff item gallery `/staff/items` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_item_gallery_page.dart` (`AsyncValue.when`); `friendly_load_error.dart`; `load_state_error.dart`; `staffGalleryStockProvider` keepAlive 3m

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff search COMPARE · Staff items SCAFFOLD→**COMPARE** · Staff stock **COMPARE** |
| 🟡 Current | Staff stock **COMPARE PASS** — ask before next Subagent 4 stub |
| ⬜ Pending | Other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; QuickStockActionSheet |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold load: full-body spinner (no search/filters) | `when(loading: Center CircularProgressIndicator)` | `showData` gate + loading slot | PASS |
| 2 | Error: FriendlyLoadError title `Could not load items` | exact | same | PASS |
| 3 | Default subtitle `Tap to retry.` | kFriendlyLoadNetworkSubtitle | `STAFF_GALLERY_RETRY_SUBTITLE` + status map | PASS |
| 4 | Retry invalidates / refetches | `invalidate(provider)` | bust cache + `retryTick` | PASS |
| 5 | Data chrome only when idle + no error | data branch | `showData` | PASS |
| 6 | AppBar stays during load/error | Scaffold appBar | same | PASS |
| 7 | 3m keepAlive cache | `registerProviderKeepAliveTimer(3m)` | `STAFF_GALLERY_CACHE_TTL_MS` | PASS |
| 8 | No raw exception in UI | FriendlyLoadError | mapped subtitle only | PASS |
| 9 | Pull-to-refresh retry | N/A gallery | touch pull → retry | PASS* |
| 10 | QuickStockActionSheet | Yes | **Deferred** | N/A |

\*Flutter gallery has no RefreshIndicator; pull is SPA affordance matching search/notifications STATES.

**Smoke:** `npm run test:staff-items-states` (+ scaffold→wire PASS); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE string error + results-area loading; remove load-subtitle helper + this compare + script; boards → ask before STATES.

**Next (ask first):** COMPARE done — [`staff_items_compare.md`](staff_items_compare.md). Ask before next Subagent 4 stub.
