# Owner `/home/activity` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_period_filter_row.dart`; `_periodTitle` in `home_warehouse_activity_page.dart`; `homePeriod.ts` (shared with `/home`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Chips Today / Week / Month / Year / All time / Custom | `HomePeriodFilterRow` | `HOME_PERIOD_ORDER` + labels | PASS |
| 2 | Default Month | `homePeriodProvider` → month | `useState("month")` | PASS |
| 3 | Selected pill brandPrimary | Yes | `.home-activity-page__period-chip--selected` | PASS |
| 4 | Caption under chips | Exact string | `HOME_ACTIVITY_PERIOD_CAPTION` | PASS |
| 5 | Custom date range | DateRangePicker | Two `type="date"`; default −29d→today | PASS |
| 6 | Custom validation | Range start ≤ end | `isValidCustomRange` + exact error | PASS |
| 7 | Card title `_periodTitle` | switch on period | `homeActivityPeriodTitle` | PASS |
| 8 | Shared `homePeriodRange` helpers | Dart | `homePeriod.ts` | PASS |
| 9 | Back navigate / feed API / event count | Yes | **Deferred** BUTTONS/WIRE | N/A |

**Rollback:** Revert FIELDS commit; restore LAYOUT muted period strip (no chips).

**Next:** `/home/activity` BUTTONS — back → `/home` (still no API).
