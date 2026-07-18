# Staff `/staff/home` — WIRE-2d compare (Recent activity feed)

**Branch:** `ops/dashboard-module`  
**Sources:** `StaffHomeRecentActivitySection`; `staffRecentActivityProvider` / `staffActivityLabel` / `staffRecentScansProvider`; `barcode_recent_scans.dart` (`barcode_recent_scans_v1`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/activity-log?period=today` | `staffTodayActivityProvider` | `fetchActivityLogToday` | PASS |
| 2 | Local recent scans prefs | SharedPreferences key | `localStorage` `barcode_recent_scans_v1` | PASS |
| 3 | Merge + sort + take 8 | Yes | `buildStaffRecentActivity` | PASS |
| 4 | `staffActivityLabel` map | Exact cases | Exact | PASS |
| 5 | Loading height 120 spinner | Yes | Same | PASS |
| 6 | Error copy | `Could not load recent activity.` | Exact | PASS |
| 7 | Empty copy | `No activity yet today — tap Scan above.` | Exact | PASS |
| 8 | Row tap → `/catalog/item/:id?source=scan` | Yes | stub + navigate | PASS |
| 9 | `Full activity log` → `/staff/activity` | Yes | stub | PASS |
| 10 | Double section header (page + widget) | Yes | Outer LAYOUT + inner widget | PASS |
| 11 | Not `home-overview` | Staff never | No call | PASS |
| 12 | Notifications unread badge | Separate | **Deferred** | N/A |
| 13 | Pull-to-refresh | Separate | **Deferred** | N/A |

**Smoke:** `npm run test:staff-home-wire2d`  
**Rollback:** Revert WIRE-2d commit; restore empty recent-activity slot; remove `/catalog/item/:itemId` stub if unused.  
**Next:** Ask before notifications badge · pull-refresh · Users & Roles (blocked) · Dashboard Subagent 4.
