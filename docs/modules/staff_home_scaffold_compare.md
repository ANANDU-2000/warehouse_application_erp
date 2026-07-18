# Staff `/staff/home` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Sources:** `dashboard.md` §1 Staff layout; `staff_home_page.dart` body order

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/staff/home` | `StaffHomePage` | `features/staff/StaffHomePage` | PASS |
| 2 | Max width 560 | `DesktopPageShell` | `.staff-home__shell` | PASS |
| 3 | Greeting → floor KPIs → warehouse → pending → shift → tools → quick actions → scan → attention → activity | Staff body order | Same `data-slot` order | PASS |
| 4 | Focus filter / KPIs / API / CTAs | Yes | **Deferred** | N/A |
| 5 | Owner `/home` unchanged | Separate workflow | Untouched | PASS |

**Rollback:** Revert SCAFFOLD commit; restore `StaffHomeStubPage` on `/staff/home`.

**Next:** `/staff/home` LAYOUT — HexaOp / greeting chrome (still no API).
