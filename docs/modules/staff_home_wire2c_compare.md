# Staff `/staff/home` — WIRE-2c compare (Shift today strip)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_home_dashboard_widgets.dart` (`StaffHomeShiftSnapshotStrip`); `staff_home_providers.dart` (`staffTodayActivityProvider`, `staffTodayStockWorkProvider`, `summarizeStaffToday`, `staffPendingDeliveryCountProvider`); FastAPI `users.py` `list_activity`; `stock_audit.py` `audit/feed`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/activity-log?period=today&page=1&per_page=80` | Yes | `fetchActivityLogToday` | PASS |
| 2 | `GET …/stock/audit/feed?on=YYYY-MM-DD&limit=200` | Yes | `fetchStockAuditFeedToday` | PASS |
| 3 | `summarizeStaffToday` action buckets + stock=audit length | Yes | `staffShiftSummary.ts` | PASS |
| 4 | Deliveries tile = pipeline pending count | `staffPendingDeliveryCountProvider` | `counts.pending` | PASS |
| 5 | Loading → `–` tiles | Skeleton row | Same dashes | PASS |
| 6 | Error → `–` tiles; deliveries if pending>0 | Yes | Same | PASS |
| 7 | Empty: title + subtitle → `/barcode/scan` | Exact copy | Exact | PASS |
| 8 | Tiles: Scans / Stock / Purchases / Deliveries | Yes | Same labels + values | PASS |
| 9 | Not `home-overview` | Staff never | No call | PASS |
| 10 | Recent activity feed rows | Separate strip | **WIRE-2d PASS** — [`staff_home_wire2d_compare.md`](staff_home_wire2d_compare.md) | PASS |

**Smoke:** `npm run test:staff-home-wire2c`  
**Rollback:** Revert WIRE-2c commit; restore empty shift slot; unmount `activity-log` + `/audit/feed` alias if unused elsewhere.  
**Next:** Staff WIRE-2d PASS — [`staff_home_wire2d_compare.md`](staff_home_wire2d_compare.md). Ask before notifications / Subagent 4.
