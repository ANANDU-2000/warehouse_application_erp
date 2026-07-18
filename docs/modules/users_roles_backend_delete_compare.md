# Users & Roles — Backend Slice 5 compare (`DELETE …/users/:userId`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`delete_user`, `_guard_actor_target`, `_revoke_user_tokens`); `staff_audit.py` (`USER_DELETE`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `DELETE …/users/{user_id}` | FastAPI | Same | PASS |
| 2 | Role owner/admin/super_admin | Yes | Yes | PASS |
| 3 | 404 User not found | Yes | Yes | PASS |
| 4 | Guard actor/target | Yes | `guardActorTarget` | PASS |
| 5 | 400 Cannot delete your own account | Yes | Yes | PASS |
| 6 | Soft-delete is_active=false + deleted_at | Yes | `patchById` | PASS |
| 7 | token_version += 1 | Yes | Yes | PASS |
| 8 | USER_DELETE activity log | Yes | `insertActivityLog` | PASS |
| 9 | 204 No Content | Yes | `res.status(204).send()` | PASS |
| 10 | reset-password / UI | Out of slice | See Slice 6 | N/A |

**Smoke:** `npx vitest run tests/users/` (39 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove DELETE route + delete service; restore boards to Slice 1–4.

**Next:** Slice 6 reset-password — [`users_roles_backend_reset_password_compare.md`](users_roles_backend_reset_password_compare.md).
