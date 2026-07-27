# Users & Roles — Backend Slice 14 compare (`POST …/users/bulk`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`bulk_users`) · `schemas/users.py` (`UserBulkIn`, `UserBulkOut`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `POST …/users/bulk` (static before `/:userId`) | FastAPI | Same | PASS |
| 2 | Roles owner / admin / super_admin | Yes | Yes | PASS |
| 3 | Manager excluded | 403 | 403 | PASS |
| 4 | Body: `user_ids` min 1 max 100 | Field constraints | Zod same | PASS |
| 5 | Actions: activate\|deactivate\|block\|unblock\|delete\|set_role | Literal | z.enum | PASS |
| 6 | Bulk `role` pattern admin\|manager\|staff only | Yes | Yes | PASS |
| 7 | Missing membership → `failed` (no abort) | Yes | Yes | PASS |
| 8 | `_guard_actor_target` failure → `failed` (not HTTP 403) | Yes | Yes | PASS |
| 9 | Self + deactivate\|delete\|block → `failed` | Yes | Yes | PASS |
| 10 | activate: is_active + clear deleted_at + is_blocked | Yes | Yes | PASS |
| 11 | deactivate: is_active=false only (no audit) | Yes | Yes | PASS |
| 12 | block: is_blocked + revoke + USER_BLOCK audit | Yes | Yes | PASS |
| 13 | unblock: is_blocked=false (no audit) | Yes | Yes | PASS |
| 14 | delete: soft-delete + revoke + USER_DELETE | Yes | Yes | PASS |
| 15 | set_role: require role; ROLE_DEFAULTS; admin→owner fail | Yes | Yes | PASS |
| 16 | Response `{ updated, failed }` | UserBulkOut | Same | PASS |
| 17 | Single commit / txn | db.commit once | runBulkInTransaction | PASS |

**Smoke:** `npx vitest run tests/users/` (108 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove bulk route + `usersBulk.service` + schema; restore boards to Slice 1–13.

**Next (ask first):** Users UI · Subagent 4.
