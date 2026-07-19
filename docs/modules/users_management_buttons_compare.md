# Users `/settings/users` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_management_page.dart` AppBar/bulk; `user_list_filters.dart` drawer; create sheet labels

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back → popOrGo `/settings` | Yes | `popOrGo` + `USERS_MGMT_BACK_FALLBACK` | PASS |
| 2 | Select mode title `{n} selected` | Yes | local `selectMode` | PASS |
| 3 | Leading close exits select | Yes | same | PASS |
| 4 | Refresh clickable | invalidate caches | stub no-op (WIRE) | PASS* |
| 5 | Add opens sheet (create gate; hidden in select) | Yes | modal `Add user` | PASS |
| 6 | Create sheet field labels | Full name… Create user | exact copy constants | PASS |
| 7 | Create submit | POST users | **no fetch** stub | PASS (WIRE) |
| 8 | Role drawer heading + Staff/Manager/Admin·Owner | Yes | exact | PASS |
| 9 | Clear / Apply draft roles | Yes | Apply commits `roles` | PASS |
| 10 | Bulk bar Activate/Deactivate/Block/Delete | Yes | labels + stub handlers | PASS (WIRE) |
| 11 | Live list/create/bulk API | Yes | **Deferred** | N/A |

\*Refresh button wired; invalidate = WIRE.

**Smoke:** `npm run test:users-management-buttons` (+ layout/fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS inert AppBar; remove this compare + script; boards → ask before BUTTONS.

**Next (ask first):** `/settings/users` WIRE — `GET …/users` list + create/bulk APIs.
