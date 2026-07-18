# Users & Roles — Backend Slice 2 compare (`POST …/users`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`create_user`); `schemas/users.py` (`UserCreateIn`, `UserCreateOut`); `user_username.py`; `readable_password.py`; `staff_audit.py` (`log_user_lifecycle` → `USER_CREATE`); `passwords.py`; `permissions.py` (`effective_permissions`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `POST /v1/businesses/{business_id}/users` | FastAPI | Same mount | PASS |
| 2 | Role gate owner/admin/super_admin (not manager) | `require_role(...)` | `createRequireRole(...)` | PASS |
| 3 | Manager → 403 | Yes | Yes | PASS |
| 4 | Admin cannot create owner | Guard in create_user | Same (dead vs schema) | PASS |
| 5 | Phone digits ≥6 else 400 Invalid phone | Yes | Yes | PASS |
| 6 | Email resolve `{digits}@staff.harisree.local` | Pydantic validator | Zod transform | PASS |
| 7 | allocate_username (requested=None) | user_username.py | `allocateUsername` | PASS |
| 8 | Email active duplicate → 409 | Yes | `emailExistsActive` | PASS |
| 9 | Password: provided strip or generate_readable | Yes | Same + `hashPassword` | PASS |
| 10 | `generated_password` if not body.password | Truthiness | Same | PASS |
| 11 | User + Membership + USER_CREATE audit in txn | commit | `withTransaction` | PASS |
| 12 | `permissions_json` = effective_permissions(role, None) | Yes | JSON.stringify same map | PASS |
| 13 | 201 `UserCreateOut` with UserListOut enrichment | `_user_row` | `buildUserListOut` | PASS |
| 14 | UI / PATCH / GET-by-id | Out of slice | Not added | N/A |

**Smoke:** `npx vitest run tests/users/` (20 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove POST handler; drop insert helpers / create services if unused; restore docs boards to Slice 1 only.

**Next (ask first):** GET `/{user_id}` profile · other mutate APIs · Users UI · Subagent 4 satellite.
