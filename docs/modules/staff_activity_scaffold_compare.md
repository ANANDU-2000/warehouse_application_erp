# Staff activity `/staff/activity` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Satellite:** Subagent 4 — next after Staff low-stock COMPARE.  
**Sources:** `staff_activity_page.dart` (`StaffActivityPage`); `app_router.dart` `/staff/activity`; `05_Navigation_Map.md`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff low-stock COMPARE · Staff activity **SCAFFOLD** |
| 🟡 Current | `/staff/activity` **SCAFFOLD PASS** — ask before LAYOUT |
| ⬜ Pending | LAYOUT → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | period selection · activity-log fetch · ListSkeleton / HexaErrorCard · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/staff/activity` | `StaffActivityPage` | `StaffActivityPage` | PASS |
| 2 | AppBar title `My activity` | exact | `STAFF_ACT_TITLE` | PASS |
| 3 | Back pop → `/staff/home` | `popOrGo('/staff/home')` | `STAFF_ACT_BACK_FALLBACK` | PASS |
| 4 | Period segments Today · Week · Month | SegmentedButton | disabled chips `data-deferred="period-select"` | PASS |
| 5 | Default period `today` | StateProvider | `STAFF_ACT_DEFAULT_PERIOD` | PASS |
| 6 | Empty title `No activity in this period` | exact | `STAFF_ACT_EMPTY` | PASS |
| 7 | Empty subtitle scans/stock/purchases | exact | `STAFF_ACT_EMPTY_SUB` | PASS |
| 8 | Activity list rows | ListView | `data-deferred="activity-rows"` | PASS |
| 9 | Period onSelectionChanged | Yes | **Deferred** FIELDS | N/A |
| 10 | `listActivityLog` API | Yes | **Deferred** WIRE | N/A |
| 11 | ListSkeleton / HexaErrorCard | Yes | **Deferred** STATES | N/A |
| 12 | Purchase entry / barcode / receive | — | **Backend blocked** (docs/06) | N/A |

**Smoke:** `npm run test:staff-activity-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore route → `DashboardRouteStubPage` title “Staff activity”; remove `features/staff/activity/*` + this compare + script; boards → ask before activity SCAFFOLD.

**Next (ask first):** LAYOUT — do not start until approved.
