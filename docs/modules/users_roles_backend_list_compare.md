# Users & Roles — Backend Slice 1 compare (`GET …/users`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`list_users`, `_user_row`, `_today_stats`, `_activity_count_7d`, `_warehouse_name`, `_active_user_filter`); `source-app/backend/app/schemas/users.py` (`UserListOut`, `TodayStatsOut`); `deps.py` `require_role("owner", "admin", "manager", "super_admin")`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `GET /v1/businesses/{business_id}/users` | FastAPI router prefix | `createUsersRoutes` mounted same | PASS |
| 2 | Auth Bearer + membership | `get_current_user` + `require_membership` | `requireAuth` + `requireMembership` | PASS |
| 3 | Role gate owner/admin/manager/super_admin | `require_role(...)` | `createRequireRole(...)` (+ `is_super_admin` bypass) | PASS |
| 4 | Staff role → 403 | Yes | Yes | PASS |
| 5 | `include_inactive` default false | `Query(False)` | `parseIncludeInactive` | PASS |
| 6 | Soft-deleted excluded | `User.deleted_at.is_(None)` | `u.[deleted_at] IS NULL` | PASS |
| 7 | Active filter when inactive false | `User.is_active.is_(True)` | `u.[is_active] = 1` | PASS |
| 8 | Order by name | `order_by(User.name)` | `ORDER BY u.[name]` | PASS |
| 9 | Response = list of `UserListOut` | Pydantic | JSON same fields | PASS |
| 10 | `today_stats` SCAN/STOCK_UPDATE/ITEM_CREATE UTC day | `_today_stats` | `todayStats` | PASS |
| 11 | `activity_count_7d` | `_activity_count_7d` | `activityCount7d` | PASS |
| 12 | `warehouse_name` = Business.name | `_warehouse_name` | `businesses.findById` → `name` | PASS |
| 13 | Fields: id/name/phone/email/username/role/is_active/is_blocked/last_*/notes/created_at | Yes | Yes | PASS |
| 14 | No invent zero stats when rows exist | Counts from log | Same queries | PASS |
| 15 | POST/PATCH/DELETE/UI | Out of slice | Not implemented | N/A |

**Smoke:** `npx vitest run tests/users/usersList.test.ts tests/repositories/businessUsers.repository.test.ts` (13 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; unmount `/v1/businesses/:businessId/users`; remove `businessUsers` from `createApp` / `index.ts`; delete `businessUsers.repository.ts`, `usersList.service.ts`, `users.controller.ts`, `users.routes.ts`, compare MD.

**Next (ask first):** POST create / GET by id / more users APIs, **or** Users UI SCAFFOLD (still blocked until enough APIs), **or** one Subagent 4 satellite.
