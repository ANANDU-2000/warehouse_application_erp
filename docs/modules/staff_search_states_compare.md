# Staff search `/staff/search` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `search_page.dart` (`AsyncValue.when` loading/error/data); `_SearchLoadingFallback`; `friendly_load_error.dart`; `load_state_error.dart`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications COMPARE · Staff search SCAFFOLD→**STATES** |
| 🟡 Current | Staff search **STATES PASS** — ask before COMPARE |
| ⬜ Pending | COMPARE · other stubs |
| ⏸ Deferred | `/staff/settings` · owner `/search`; desktop preview pane; TradeIntel fact-rich tile polish |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Reload: LinearProgress 2px + “Updating results…” | `searchReloading` | same | PASS |
| 2 | Cold load: spinner then 2s fallback copy + recent chips | `_SearchLoadingFallback` | same | PASS |
| 3 | Error title `Search failed` | FriendlyLoadError | exact | PASS |
| 4 | Default subtitle `Tap to retry.` | kFriendlyLoadNetworkSubtitle | same + status map | PASS |
| 5 | Retry invalidates / refetches | `invalidate(provider)` | bust cache + `retryTick` | PASS |
| 6 | Results gated until idle + no error | data branch | `showResults` | PASS |
| 7 | Search/filters stay during load | Yes | same | PASS |
| 8 | 12s TTL cache (max 40) | `_unifiedSearchTtl` | `STAFF_SEARCH_CACHE_TTL_MS` | PASS |
| 9 | Pull-to-refresh retry | N/A shell / Invalidate | touch pull → retry | PASS* |
| 10 | No raw exception in UI | Yes | mapped subtitle only | PASS |

\*Flutter search page has no RefreshIndicator; pull is SPA affordance matching notifications STATES pattern.

**Smoke:** `npm run test:staff-search-states` (+ scaffold→wire PASS); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE string error + ungated loading; remove load-subtitle helper + this compare + script; boards → ask before STATES.

**Next (ask first):** `/staff/search` COMPARE — do not start until approved.
