# Owner `/home` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_owner_dashboard_body.dart`; `friendly_load_error.dart`; `home_page.dart` (Session expired); `home_delivery_pipeline_card.dart`; `home_warehouse_activity_feed.dart`; `home_dashboard_provider.dart` (`No connection`); `dashboard.md` §22–24  
**Copy constants:** `homeLoadCopy.ts` (exact literals; smoke asserts)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Loading skeleton + `Loading dashboard…` | Card + 4 bars + copy | `HomeSectionSkeleton` + constant | PASS |
| 2 | Network error + `Tap to retry.` + Retry | FriendlyLoadError | Same | PASS |
| 3 | `No connection` | Provider banner key | Same message | PASS |
| 4 | `Session expired` + subtitle → login | home_page.dart | Same + clear tokens | PASS |
| 5 | Delivery `Could not load delivery pipeline` | SectionInlineError | Same | PASS |
| 6 | Hide delivery when counts 0 | SizedBox.shrink | `showDeliveryPipeline` | PASS |
| 7 | Activity empty title/subtitle | HexaEmptyState | Exact strings | PASS |
| 8 | `Activity unavailable` + Retry | Feed error | Same on overview fail | PASS |
| 9 | KPI subtitle `Clear` when pending 0 | Yes | Constant | PASS |
| 10 | Period chips disabled while loading | — | `disabled={loading}` | PASS |
| 11 | Activity feed rows / ETag / pull-refresh | Yes | **Deferred** | N/A |

**Rollback:** Revert STATES commit; keep WIRE minimal loading paragraph.

**Next:** `/home` COMPARE — full Legacy vs New for owner route.
