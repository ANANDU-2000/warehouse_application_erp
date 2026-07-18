# Users & Roles — Backend Slice 7 compare (`GET …/users/:userId/credentials`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`user_credentials`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `GET …/users/{user_id}/credentials` | FastAPI | Same | PASS |
| 2 | Role owner/admin/super_admin (not manager) | Yes | Yes | PASS |
| 3 | 404 User not found | Yes | Yes | PASS |
| 4 | No `_guard_actor_target` | Yes | Not called | PASS |
| 5 | Body keys username, login_email, phone, note | Yes | Same | PASS |
| 6 | Fixed note string (no password retrieval) | Yes | Exact copy | PASS |
| 7 | No password / hash in response | Yes | Asserted in tests | PASS |
| 8 | permissions / UI | Out of slice | Not added | N/A |

**Smoke:** `npx vitest run tests/users/` (48 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove credentials route + `usersCredentials.service`; restore boards to Slice 1–6.

**Next (ask first):** GET/PATCH permissions · Users UI · Subagent 4.
