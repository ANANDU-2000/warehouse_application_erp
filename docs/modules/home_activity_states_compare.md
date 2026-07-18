# Owner `/home/activity` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_warehouse_activity_page.dart`; `friendly_load_error.dart`; `hexa_empty_state.dart`; `home_recent_changes_section.dart` (`HomeSectionSkeleton`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Skeleton `HomeSectionSkeleton(rows: 8)` | Yes | Same bars `#f1f5f9` / 44px | PASS |
| 2 | FriendlyLoadError `Could not load activity` | Fixed message | `HOME_ACTIVITY_LOAD_ERROR` | PASS |
| 3 | Subtitle `Tap to retry.` + Retry | Default FriendlyLoadError | `HOME_RETRY_*` | PASS |
| 4 | Empty title `No activity in this period` | HexaEmptyState | Same | PASS |
| 5 | Empty subtitle deliveries/purchases/stock | Full page (not feed) | `HOME_ACTIVITY_EMPTY_SUBTITLE` | PASS |
| 6 | Cache while refresh + 2px progress banner | `showRefreshBanner` | Same | PASS |
| 7 | Period chips disabled while loading | — | `disabled={loading}` | PASS |
| 8 | Null session → empty list | Provider `[]` | `setCachedItems([])` | PASS |
| 9 | No raw exception string in error UI | FriendlyLoadError | Catch → fixed message | PASS |
| 10 | Pull-to-refresh gesture | RefreshIndicator | **Deferred** | N/A |
| 11 | Row tap / detail sheet | Yes | **Deferred** | N/A |
| 12 | Business-write invalidation | Yes | **Deferred** | N/A |

**Rollback:** Revert STATES commit; restore WIRE plain loading/error paragraphs.

**Next:** `/home/activity` COMPARE PASS — see [`home_activity_compare.md`](home_activity_compare.md). Next `/home/breakdown-more` SCAFFOLD.
