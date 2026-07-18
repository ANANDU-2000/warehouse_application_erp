# Staff `/staff/home` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_home_dashboard_widgets.dart` (floor skeleton / `Could not load floor counts`); `section_inline_error.dart` (`Retry`); `friendly_load_error.dart` (`Tap to retry.`); `staff_purchase_history_page.dart` (session); activity empty/error strings  
**Copy:** [`staffHomeLoadCopy.ts`](../../new-app/frontend/src/features/staff/staffHomeLoadCopy.ts)

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · **STATES** |
| 🟡 Current | STATES done — awaiting approve before COMPARE |
| ⬜ Pending | **COMPARE** |
| ⏸ Deferred | WIRE-2 bodies; pull-refresh; Splash WIRE |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Floor loading skeleton (3×88 shimmer) | `_StaffKpiRowSkeleton` | `StaffFloorKpiSkeleton` | PASS |
| 2 | Floor error + Retry | `Could not load floor counts` | exact + `SectionInlineError` | PASS |
| 3 | Network FriendlyLoadError | `No connection` + `Tap to retry.` | same | PASS |
| 4 | Session expired → login | staff session copy | `Session expired — sign in again` | PASS |
| 5 | Activity empty | `No activity yet today — tap Scan above.` | exact (feed deferred) | PASS |
| 6 | Activity error copy constant | `Could not load recent activity.` | in `staffHomeLoadCopy` (WIRE-2 feed) | PASS |
| 7 | Shift empty | `No activity today` | exact placeholder | PASS |
| 8 | Controls disabled while loading | — | `disabled={loading}` | PASS |
| 9 | Pull-refresh / auto-refresh | Yes | **Deferred** | N/A |

**Smoke:** `npm run test:staff-home-states`  
**Rollback:** Revert STATES commit; restore WIRE minimal error paragraph.  
**Next:** `/staff/home` COMPARE. Done → see [`staff_home_compare.md`](staff_home_compare.md).
