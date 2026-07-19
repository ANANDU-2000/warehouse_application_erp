# Notifications `/notifications` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Satellite:** Subagent 4 — first **backend-unlocked** stub (list API already from WIRE-2e).  
**Skipped (locked):** `/staff/settings` / Settings hub — Settings module **implement locked** until Settings backend (seq 13).  
**Sources:** `notifications_page.dart` chrome regions; `notifications_provider.dart` filter enum; WIRE-2e deferral of full page

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · **BUTTONS** |
| 🟡 Current | BUTTONS PASS — ask before **WIRE** |
| ⬜ Pending | WIRE→COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | Settings hub; mark-read/clear WIRE; warehouse-alert merge |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/notifications` | `NotificationsPage` | `features/notifications/NotificationsPage` | PASS |
| 2 | Title “Notifications” | AppBar | `NOTIFICATIONS_TITLE` | PASS |
| 3 | Slot order: appBar → search → filters → list | Column regions | `data-slot` same | PASS |
| 4 | Search hint `Search alerts…` | InputDecoration | exact (inert) | PASS |
| 5 | Owner filters All…System | all enum values | `NOTIFICATIONS_FILTER_ORDER_OWNER` | PASS |
| 6 | Staff filters omit Purchases | `_visibleFilters` | `NOTIFICATIONS_FILTER_ORDER_STAFF` | PASS |
| 7 | Mark all read / Clear chrome present | AppBar actions | inert disabled | PASS |
| 8 | Back / onClick / API / list rows | Yes | **Deferred** BUTTONS/WIRE | N/A |
| 9 | Settings `/staff/settings` first in inventory | Listed first | **Skipped** — implement locked | N/A |

**Smoke:** `npm run test:notifications-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore route → `DashboardRouteStubPage` title “Notifications”; remove `NotificationsPage*` + copy + filters + this compare + script; boards → ask before notifications SCAFFOLD.

**Next (ask first):** `/notifications` LAYOUT — done → [`notifications_layout_compare.md`](notifications_layout_compare.md). FIELDS — done → [`notifications_fields_compare.md`](notifications_fields_compare.md). BUTTONS — done → [`notifications_buttons_compare.md`](notifications_buttons_compare.md). Ask before WIRE.
