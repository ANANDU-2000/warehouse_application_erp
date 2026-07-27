# Owner `/home` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_dashboard_provider.dart` (`reportsHomeOverview`); `home_owner_dashboard_body.dart`; `buildHomeOverview`; `dashboard.md` §16

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Primary API `…/reports/home-overview` | Yes | `fetchHomeOverview` | PASS |
| 2 | Query `from`/`to`/`compact`/`shell_bundle` | Yes | Same | PASS |
| 3 | Period → inclusive API dates | half-open −1ms | `homePeriodApiDates` | PASS |
| 4 | businessId from session | primaryBusiness | `sessionStore` after Login | PASS |
| 5 | KPI / alerts / purchase / delivery bind | Yes | Bound from overview JSON | PASS |
| 6 | Not `GET /dashboard` | Flutter never | No UI call | PASS |
| 7 | Activity feed rows | Satellites | **Deferred** (View all only) | N/A |
| 8 | Full error/Retry UX | Yes | Minimal message — **STATES** | N/A |

**Rollback:** Revert WIRE commit; clear `hexa_primary_business_bk`; restore BUTTONS empty shells.

**Next:** `/home` STATES — skeletons, Retry, empty activity copy — then COMPARE.
