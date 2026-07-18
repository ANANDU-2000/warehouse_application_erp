# Users & Roles — Backend Slice 8 compare (`GET/PATCH …/users/:userId/permissions`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`get_permissions`, `patch_permissions`); `permissions.py` (`PERMISSION_KEYS`, `membership_permissions`); `schemas/users.py` (`PermissionsOut`, `PermissionsPatchIn`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Paths GET/PATCH `…/permissions` | FastAPI | Same | PASS |
| 2 | Role owner/admin/super_admin (not manager) | Yes | Yes | PASS |
| 3 | 404 User not found | Yes | Yes | PASS |
| 4 | No `_guard_actor_target` | Yes | Not called | PASS |
| 5 | GET returns role + effective permissions | Yes | `membershipPermissions` | PASS |
| 6 | PATCH merges only `PERMISSION_KEYS` into sparse JSON | Yes | Same | PASS |
| 7 | Response uses effective map (not sparse only) | Yes | Same | PASS |
| 8 | Empty permissions `{}` allowed | Yes | Zod default | PASS |
| 9 | created-items / UI | Out of slice | See Slice 9 | N/A |

**Smoke:** `npx vitest run tests/users/` (56 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove permissions routes + `usersPermissions.service` + `updatePermissionsJson`; restore boards to Slice 1–7.

**Next:** Slice 9 created-items — [`users_roles_backend_created_items_compare.md`](users_roles_backend_created_items_compare.md).
