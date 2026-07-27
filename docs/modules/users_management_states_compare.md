# Users `/settings/users` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_management_page.dart` (`async.when`); `list_skeleton.dart`; `hexa_error_card.dart` → `friendly_load_error.dart`; `load_state_error.dart`  
**Copy:** [`usersManagementCopy.ts`](../../new-app/frontend/src/features/users/usersManagementCopy.ts) · [`usersLoadSubtitle.ts`](../../new-app/frontend/src/features/users/usersLoadSubtitle.ts)

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · **COMPARE** |
| 🟡 Current | COMPARE done — ask before profile SCAFFOLD **or** Subagent 4 |
| ⬜ Pending | Profile `/settings/users/:userId` · Subagent 4 |
| ⏸ Deferred | Pull-to-refresh gesture; card overflow menus; desktop detail panel |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Loading = entire body `ListSkeleton` (6×84) | Yes | `UsersListSkeleton` | PASS |
| 2 | Outer pad 16 + skeleton chrome | Yes | CSS wrap + bars `#EFF2F1` | PASS |
| 3 | Error title `Could not load users` | HexaErrorCard | exact | PASS |
| 4 | Subtitle via status map + `Tap to retry.` default | `loadStateErrorSubtitle` | `mapUsersLoadSubtitle` | PASS |
| 5 | Retry refetches list | invalidate | `retryTick` / `loadUsers` | PASS |
| 6 | Search + chips only after data | inside `data:` | same branch | PASS |
| 7 | Empty `No users match your filters.` | exact | exact | PASS |
| 8 | No raw stack in error UI | Yes | mapped subtitle only | PASS |
| 9 | AppBar refresh available while loading | Yes | not disabled | PASS |
| 10 | Pull-to-refresh / profile STATES | Yes / other route | **Deferred** | N/A |

**Smoke:** `npm run test:users-management-states` (+ prior users smokes); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE minimal loading/error in list slot; remove states compare + script; boards → ask before STATES.

**Next (ask first):** `/settings/users` COMPARE — done → [`users_management_compare.md`](users_management_compare.md). Ask before profile SCAFFOLD or Subagent 4.
