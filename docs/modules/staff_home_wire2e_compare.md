# Staff `/staff/home` — WIRE-2e compare (Notifications bell badge)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_home_page.dart` Badge; `notificationsUnreadCountProvider` / `mergedNotificationFeedProvider` (staff); `warehouseAlertNotificationItemsProvider`; `notifications.py`; `stock/alerts/summary`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Bell → `/notifications` | Yes | Same + stub | PASS |
| 2 | Badge visible only when unread > 0 | Yes | Same | PASS |
| 3 | Label `99+` when > 99 | Yes | `staffBellBadgeLabel` | PASS |
| 4 | Count from merged feed (not unread-count alone) | Yes | `countStaffBellUnread` | PASS |
| 5 | `GET …/notifications` paginated | hexa_api | `fetchAppNotifications` | PASS |
| 6 | Staff role visibility filter | Yes | `notificationVisibleForStaff` | PASS |
| 7 | Warehouse synthetics + server-kind dedupe | Yes | Same rules | PASS |
| 8 | `GET …/stock/alerts/summary` for low/out/missing | Yes | Backend + fetch | PASS |
| 9 | Kind toggles prefs default on | Yes | `pref_notif_kind_*` | PASS |
| 10 | Server error → empty server rows | `orElse []` | `.catch(() => [])` | PASS |
| 11 | Not `home-overview` | Staff never | No call | PASS |
| 12 | Full `/notifications` page | Separate | **Deferred** | N/A |
| 13 | Pull-to-refresh | Separate | **Deferred** | N/A |

**Smoke:** `npm run test:staff-home-wire2e`  
**Rollback:** Revert WIRE-2e commit; restore bell without badge; unmount notifications + alerts/summary if unused.  
**Next:** Ask before pull-refresh · Users & Roles (blocked) · Dashboard Subagent 4.
