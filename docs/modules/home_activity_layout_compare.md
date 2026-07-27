# Owner `/home/activity` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_warehouse_activity_page.dart` AppBar + period caption + `_ActivityTableHeader` + Card r16

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | `HexaColors.brandBackground` | CSS | PASS |
| 2 | AppBar title w800 “Warehouse activity” | `titleLarge` + w800 | `.home-activity-page__title` | PASS |
| 3 | Back chevron chrome | `Icons.arrow_back_rounded` | SVG inert (no navigate) | PASS |
| 4 | Period strip height 32 placeholder | `HomePeriodFilterRow` h32 | Muted strip (chips → FIELDS) | PASS |
| 5 | Caption exact + 11px `#64748B` | Yes | `HOME_ACTIVITY_PERIOD_CAPTION` | PASS |
| 6 | List card r16 | `BorderRadius.circular(16)` | CSS | PASS |
| 7 | Table header labels + `#F1F5F9` r10 | `_ActivityTableHeader` | Exact copy + CSS | PASS |
| 8 | Column flex ~34/38/28 | Expanded flex | CSS flex | PASS |
| 9 | Period chips / back navigate / rows / API | Yes | **Deferred** | N/A |

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD empty slots only.

**Next:** `/home/activity` FIELDS PASS — see [`home_activity_fields_compare.md`](home_activity_fields_compare.md). Next BUTTONS (back → `/home`).
