# Users & Roles — Backend Slice 13 compare (`GET …/users/active-sessions`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`active_sessions`, `_user_row`, `_active_user_filter`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `GET …/users/active-sessions` | FastAPI | Same | PASS |
| 2 | Roles owner / manager / super_admin | Yes | Yes | PASS |
| 3 | **Admin excluded** | Yes | 403 | PASS |
| 4 | Cutoff = now UTC − 5 minutes | Yes | Same | PASS |
| 5 | Filters: last_active_at not null ≥ cutoff, is_active, deleted_at null | Yes | Same | PASS |
| 6 | Response `UserListOut` via `_user_row` enrichment | Yes | `buildUserListOut` | PASS |
| 7 | Stable `ORDER BY name` | Unspecified in FastAPI | Added for determinism | PASS* |
| 8 | bulk / UI | Out of slice | Not added | N/A |

\*Documented intentional stable sort (matches list_users).

**Smoke:** `npx vitest run tests/users/` (94 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove active-sessions route + service + repo method; restore boards to Slice 1–12.

**Next (ask first):** POST bulk · Users UI · Subagent 4.
