# Users & Roles — Backend Slice 6 compare (`POST …/users/:userId/reset-password`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`reset_password`, `_guard_actor_target`); `staff_audit.py` (`log_password_reset`); `schemas/users.py` (`ResetPasswordOut`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `POST …/users/{user_id}/reset-password` | FastAPI | Same | PASS |
| 2 | Role owner/admin/super_admin (not manager) | Yes | Yes | PASS |
| 3 | 404 User not found | Yes | Yes | PASS |
| 4 | Guard actor/target | Yes | `guardActorTarget` | PASS |
| 5 | `generate_readable_password(user.name)` | Yes | `generateReadablePassword` | PASS |
| 6 | `hash_password` → `password_hash` only | Yes | `patchById({ password_hash })` | PASS |
| 7 | No `token_version` bump on reset | Yes | Not set | PASS |
| 8 | PASSWORD_RESET log (`target_user_id`, `target_name` = name\|username) | Yes | `insertActivityLog` | PASS |
| 9 | 200 `{ new_password, login_email }` | Yes | Same | PASS |
| 10 | credentials GET / permissions / UI | Out of slice | Not added | N/A |

**Smoke:** `npx vitest run tests/users/` (44 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove reset-password route + `usersResetPassword.service`; restore boards to Slice 1–5.

**Next (ask first):** credentials GET · permissions · Users UI · Subagent 4.
