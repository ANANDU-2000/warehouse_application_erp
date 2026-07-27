# Users & Roles — Backend Slice 4 compare (`PATCH …/users/:userId`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`patch_user`, `_guard_actor_target`, `_revoke_user_tokens`); `schemas/users.py` (`UserPatchIn`); `permissions.py` (`actor_can_manage_target`, `ROLE_DEFAULTS`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `PATCH …/users/{user_id}` | FastAPI | Same | PASS |
| 2 | Role owner/admin/super_admin (not manager) | Yes | Yes | PASS |
| 3 | 404 User not found | Yes | Yes | PASS |
| 4 | Guard: admin cannot manage owner | `actor_can_manage_target` | `actorCanManageTarget` + guard | PASS |
| 5 | Guard: owner account protected | Yes | Yes | PASS |
| 6 | Super admin bypass | Yes | Yes | PASS |
| 7 | full_name / email / phone / notes patch | Yes | Yes | PASS |
| 8 | Email unique among active others → 409 | Yes | `emailExistsActiveExcluding` | PASS |
| 9 | Role change + ROLE_DEFAULTS reset | Yes | `updateRoleAndPermissions` | PASS |
| 10 | Admin cannot assign owner | Yes | Yes | PASS |
| 11 | is_active true clears deleted_at + is_blocked | Yes | Yes | PASS |
| 12 | is_blocked true → token_version++ + USER_BLOCK | Yes | Yes | PASS |
| 13 | Response UserListOut | Yes | `buildUserListOut` | PASS |
| 14 | DELETE / reset / UI | Out of slice | Not added | N/A |

**Smoke:** `npx vitest run tests/users/` (34 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove PATCH route + patch service/repo methods; restore boards to Slice 1–3.

**Next (ask first):** reset-password · permissions · Users UI · Subagent 4. DELETE: [`users_roles_backend_delete_compare.md`](users_roles_backend_delete_compare.md).
