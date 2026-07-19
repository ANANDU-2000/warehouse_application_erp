# Users `/settings/users` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_list_filters.dart`; `user_management_page.dart` `_searchBar`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Primary filters order | all / active / inactive / blocked | `USER_LIST_PRIMARY_ORDER` | PASS |
| 2 | Labels | All users / Active / Inactive / Blocked | `USER_LIST_PRIMARY_LABELS` | PASS |
| 3 | Default primary | `all` | `DEFAULT_USER_LIST_FILTER` | PASS |
| 4 | Search hint | `Search users…` | `USERS_MGMT_SEARCH_HINT` | PASS |
| 5 | Search updates client state | filter provider | `useState` + `onChange` | PASS |
| 6 | Chip select updates primary | onTap | chip `onClick` → `setPrimary` | PASS |
| 7 | Chip count helper | `countForPrimaryFilter` | same; rows `[]` until WIRE → `(0)` | PASS |
| 8 | `applyUserListFilters` rules | active/inactive/blocked/roles/search | `userListFilters.ts` | PASS |
| 9 | admin role filter matches owner | Yes | same | PASS |
| 10 | Role filter drawer / AppBar CTAs / API | Yes | **Deferred** | N/A (BUTTONS/WIRE) |

**Smoke:** `npm run test:users-management-fields` (+ layout still PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT search/chips chrome; remove this compare + check script; boards → ask before FIELDS.

**Next (ask first):** `/settings/users` BUTTONS — done → [`users_management_buttons_compare.md`](users_management_buttons_compare.md). Ask before WIRE.
