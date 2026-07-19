# User profile `/settings/users/:userId` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_profile_page.dart` chrome regions; `users-roles.md` §2; `app_router.dart` `/settings/users*` manage gate

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/settings/users/:userId` | `UserProfilePage` | `features/users/UserProfilePage` | PASS |
| 2 | Gate: !manage → `/settings` | redirect on `/settings/users*` | `Navigate` + `sessionCanManageUsers` | PASS |
| 3 | Slot order: appBar → header → tabBar → tabBody | Flutter Column regions | Same `data-slot` order | PASS |
| 4 | Title “User profile” | AppBar title | `USER_PROFILE_TITLE` | PASS |
| 5 | Tab labels Overview / Activity / Permissions | TabBar texts | exact copy constants | PASS |
| 6 | `userId` from route param | widget.userId | `useParams` | PASS |
| 7 | Fields / CTAs / API / tab bodies | Yes | **Deferred** | N/A |
| 8 | Back popOrGo `/settings/users` | Yes | **Deferred** (BUTTONS) | N/A |

**Smoke:** `npm run test:user-profile-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore route → `DashboardRouteStubPage` title “User profile”; remove `UserProfilePage*` + copy + this compare + script; boards → ask before profile SCAFFOLD.

**Next (ask first):** `/settings/users/:userId` LAYOUT — brand chrome for AppBar/header/tabs.
