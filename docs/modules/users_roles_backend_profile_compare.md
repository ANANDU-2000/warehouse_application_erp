# Users & Roles — Backend Slice 3 compare (`GET …/users/:userId`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`get_user`, `_load_user_membership`, `_user_row` profile=True, `_profile_stats`); `schemas/users.py` (`UserProfileOut`, `ProfileStatsOut`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `GET …/users/{user_id}` | FastAPI | `GET /:userId` after `/` | PASS |
| 2 | Role owner/admin/manager/super_admin | `require_role` | Same | PASS |
| 3 | Staff → 403 | Yes | Yes | PASS |
| 4 | Load: biz + user + deleted_at IS NULL (no is_active filter) | `_load_user_membership` | `findMemberByUserId` | PASS |
| 5 | 404 `User not found` | Yes | Yes | PASS |
| 6 | Base UserListOut fields (today_stats, activity_7d, warehouse) | `_user_row` | `buildUserListOut` | PASS |
| 7 | `login_email` = user.email | Yes | Yes | PASS |
| 8 | `purchases_7d` trade_purchases created_at 7d | Yes | `purchases7d` | PASS |
| 9 | `stock_updates_7d` stock_adjustment_log updated_at 7d | Yes | `stockUpdates7d` | PASS |
| 10 | `stats` stock_edits / purchases / SCAN / items created | `_profile_stats` | `profileStats` | PASS |
| 11 | PATCH / nested tab APIs / UI | Out of slice | Not added | N/A |

**Smoke:** `npx vitest run tests/users/` (25 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove `GET /:userId` + profile helpers; restore docs boards to Slice 1–2.

**Next (ask first):** DELETE · reset-password · permissions · Users UI · Subagent 4. PATCH: [`users_roles_backend_patch_compare.md`](users_roles_backend_patch_compare.md).
