# Users `/settings/users` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Sources:** `users-roles.md` §2; `user_management_page.dart` chrome regions; `post_auth_route.dart` `sessionCanManageUsers`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/settings/users` | `UserManagementPage` | `features/users/UserManagementPage` | PASS |
| 2 | Gate: !manage → `/settings` | app_router redirect | `Navigate` + `sessionCanManageUsers` | PASS |
| 3 | Slot order: appBar → searchFilter → statusChips → list \| detailPanel → bulkBar | Flutter build regions | Same `data-slot` order | PASS |
| 4 | Title placeholder “Users” | AppBar title | `h1` | PASS |
| 5 | Desktop detail panel region | flex ~4:5 | CSS flex; hide &lt;900px | PASS |
| 6 | Fields / CTAs / API / profile route | Yes | **Deferred** | N/A |
| 7 | `session.isSuperAdmin` in manage gate | Yes | Deferred (no user flag on `PrimaryBusinessSession`) | N/A |

**Smoke:** `npm run build` in `new-app/frontend` PASS.

**Rollback:** Revert this commit; restore `/settings/users` → `DashboardRouteStubPage`; remove `features/users/*` + this compare; restore boards to ask-before Users UI.

**Next (ask first):** `/settings/users` LAYOUT — AppBar icons/colors (still no API).
