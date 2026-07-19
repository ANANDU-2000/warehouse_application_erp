# User profile `/settings/users/:userId` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_profile_page.dart` AppBar/edit sheet/delete dialog/permissions save; `user_profile_header.dart` more menu

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back → popOrGo `/settings/users` | Yes | `popOrGo` + `USER_PROFILE_BACK_FALLBACK` | PASS |
| 2 | Edit opens sheet | Yes | modal `Edit user` | PASS |
| 3 | Edit fields Full name / Email / Phone / Role | Yes | exact labels; Staff/Manager/Admin | PASS |
| 4 | Save changes | PATCH user | **no fetch** stub | PASS (WIRE) |
| 5 | More: Reset / Copy email | Yes | menu items | PASS |
| 6 | More: Block·Unblock / Activate·Deactivate / Delete | non-owner | labels + stubs | PASS (WIRE) |
| 7 | Delete confirm copy | Delete user? + body | exact | PASS |
| 8 | Save permissions | PATCH perms | button + toast stub | PASS (WIRE) |
| 9 | Live profile GET / PATCH / reset / DELETE | Yes | **Deferred** | N/A |

**Smoke:** `npm run test:user-profile-buttons` (+ scaffold/layout/fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS inert Edit/More; remove this compare + script; boards → ask before BUTTONS.

**Next (ask first):** `/settings/users/:userId` WIRE — done → [`user_profile_wire_compare.md`](user_profile_wire_compare.md). STATES — done → [`user_profile_states_compare.md`](user_profile_states_compare.md). Ask before COMPARE.
