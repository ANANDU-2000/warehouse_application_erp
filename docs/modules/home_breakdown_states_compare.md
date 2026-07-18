# Owner `/home/breakdown-more` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_breakdown_list_page.dart` (cold `CircularProgressIndicator`; silent empty children — **no** `FriendlyLoadError` / `HexaEmptyState` on this route)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold load = centered spinner (full body) | `Center(CircularProgressIndicator)` | `showColdSpinner` + ring | PASS |
| 2 | Hide search / Total / tiles while cold loading | Yes | Content only after load | PASS |
| 3 | Empty rows = silent list (Total stays) | Zero children | Empty ranked slot | PASS |
| 4 | Fetch fail → empty seed, not exception UI | Provider empty seed | `emptyOverviewSeed()` | PASS |
| 5 | No raw exception string | Yes | Catch ignores message | PASS |
| 6 | No session → empty seed | Empty dashboard | Same | PASS |
| 7 | Units line empty → `0 KG` | `_dashboardUnitsLineFromTotals` | Same helper | PASS |
| 8 | FriendlyLoadError + Retry | **Not on this page** | Not added | N/A |
| 9 | HexaEmptyState / `No … breakdown for this period` | Home ranked list only | Not on this route | N/A |
| 10 | `HomeSectionSkeleton` rows | **Not used** | Not added | N/A |
| 11 | Row tap / period sync | Deferred | Deferred | N/A |

**Rollback:** Revert STATES commit; restore WIRE `Loading…` paragraph + raw error alert.

**Next:** `/home/breakdown-more` COMPARE — full Legacy vs New for this route.
