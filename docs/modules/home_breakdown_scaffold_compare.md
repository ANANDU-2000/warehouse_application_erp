# Owner `/home/breakdown-more` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Sources:** `dashboard.md` Definition (Breakdown more); `home_breakdown_list_page.dart` section order; `home_breakdown_tab_providers.dart`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/home/breakdown-more` | `HomeBreakdownListPage` | `features/home/HomeBreakdownListPage` | PASS |
| 2 | `?tab=` → default category | `homeBreakdownTabFromQuery` | `homeBreakdownTab.ts` | PASS |
| 3 | AppBar title `All — {label}` | Yes | Title in appbar slot | PASS |
| 4 | Section order | total header → search → ranked rows | Empty `data-slot` order | PASS |
| 5 | Brand bg `#F7F9F6` | `HexaColors.brandBackground` | CSS | PASS |
| 6 | Back / search input / rows / API | Yes | **Deferred** | N/A |
| 7 | Owner `/home` + `/home/activity` | Separate | Untouched | PASS |

**Rollback:** Revert SCAFFOLD commit; remove `/home/breakdown-more` route and page files.

**Next:** `/home/breakdown-more` LAYOUT — AppBar chrome + total-header card shell (no API).
