# Owner `/home` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_period_filter_row.dart`; `home_sticky_period_header.dart`; `HomePeriod` / `homePeriodRange` in `home_dashboard_provider.dart`; `_operationalPillChip`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Chips Today / Week / Month / Year / All time / Custom | Yes | `HOME_PERIOD_ORDER` + labels | PASS |
| 2 | Default Month | `homePeriodProvider` → month | `useState("month")` | PASS |
| 3 | Selected pill brandPrimary | Yes | `.home-page__period-chip--selected` | PASS |
| 4 | Caption under chips | Sticky header text | Same string | PASS |
| 5 | Custom date range | DateRangePicker | Two `type="date"` inputs; default −29d→today | PASS (FIELDS) |
| 6 | `homePeriodRange` windows | Dart half-open | `homePeriod.ts` | PASS |
| 7 | API / KPI refresh on change | Yes | **Deferred** (WIRE) | N/A |

**Rollback:** Revert FIELDS commit; restore LAYOUT period chrome bar.

**Next:** BUTTONS (local CTA stubs; still no live API).
