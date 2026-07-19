# Notifications `/notifications` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `notifications_page.dart`; `mergedNotificationFeedProvider`; `notifications.py`; WIRE-2e list/alerts

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · **STATES** |
| 🟡 Current | STATES PASS — ask before **COMPARE** |
| ⬜ Pending | COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | Purchase-due synthetics (trade list lacks `remaining`/`due_date`); Approve/Review actions |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/notifications` paginated | hexa_api | `listAppNotifications` | PASS |
| 2 | Merge server + warehouse + welcome | Yes | `mergeNotificationFeed` | PASS |
| 3 | Staff visibility + role routes | Yes | `notificationVisibleForRole` / `withRoleRoutes` | PASS |
| 4 | Category filter on live feed | Yes | `notificationMatchesCategoryFilter` | PASS |
| 5 | Warehouse alerts via stock summary + opening | Yes | `fetchStockAlertsSummary` / opening | PASS |
| 6 | Staff pending delivery synthetic | Yes | trade-purchases → pending | PASS |
| 7 | Card title/subtitle/time/priority | Yes | `NotificationAlertCard` | PASS |
| 8 | Mark all read API + local wh/manual | Yes | `POST mark-all-read` | PASS |
| 9 | Clear-all confirm + API | Yes | `DELETE clear-all` | PASS |
| 10 | Card tap PATCH read + navigate | Yes | `patchAppNotificationRead` | PASS |
| 11 | Load error banner + retry | Yes | minimal (STATES expands) | PASS* |
| 12 | Purchase due/overdue synthetics | Yes | **Deferred** (list fields) | N/A |
| 13 | Approve/Review / full STATES skeleton | Yes | **Deferred** | N/A |

\*Minimal progress + error strip; FriendlyLoadError polish = STATES.

**Smoke:** `npm run test:notifications-wire` (+ scaffold→buttons PASS); `npm run build` PASS.

**Rollback:** Revert WIRE commit; restore BUTTONS stubs (no fetch); remove mark-all/clear/patch backend routes + feed/api/card; remove this compare + script; boards → ask before WIRE.

**Next (ask first):** `/notifications` STATES — done → [`notifications_states_compare.md`](notifications_states_compare.md). Ask before next Subagent 4 stub.
