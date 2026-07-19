# User profile `/settings/users/:userId` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_profile_page.dart` (`profileAsync.when`, `_PermissionsTab` `async.when`); `hexa_error_card.dart` → `friendly_load_error.dart`; `load_state_error.dart`; `user_facing_errors.dart` / `friendlyApiError`  
**Copy:** [`userProfileCopy.ts`](../../new-app/frontend/src/features/users/userProfileCopy.ts) · [`usersLoadSubtitle.ts`](../../new-app/frontend/src/features/users/usersLoadSubtitle.ts)

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · **STATES** |
| 🟡 Current | STATES PASS — ask before **COMPARE** |
| ⬜ Pending | Profile COMPARE · Subagent 4 |
| ⏸ Deferred | Activity feed/stock/purchases/ledger load STATES; pull-to-refresh |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Profile loading = `Center(CircularProgressIndicator)` | Yes | `user-profile__spinner-ring` centered | PASS |
| 2 | Profile error title `Could not load user` | HexaErrorCard.fromError | exact + FriendlyLoadError | PASS |
| 3 | Subtitle via `loadStateErrorSubtitle` | Yes | `mapUsersLoadSubtitle` | PASS |
| 4 | Retry invalidates profile | Yes | `retryTick` / `loadProfile` | PASS |
| 5 | Empty `User not found.` | Yes | exact centered | PASS |
| 6 | No raw stack in error UI | Yes | mapped subtitle / facing only | PASS |
| 7 | Permissions loading spinner | Yes | tab cold spinner | PASS |
| 8 | Permissions error = FriendlyLoadError(`userFacingError`, subtitle null) | Yes | `mapUserFacingError` · no subtitle | PASS |
| 9 | Permissions Retry refetches | invalidate | `permRetryTick` / `loadPermissions` | PASS |
| 10 | View-only banner when !admin | exact string | `USER_PROFILE_PERMS_VIEW_ONLY` | PASS |
| 11 | Activity feed load STATES | Yes | **Deferred** (feeds not WIRE’d) | N/A |
| 12 | ListSkeleton for profile body | No (spinner) | spinner — not ListSkeleton | PASS |

**Smoke:** `npm run test:user-profile-states` (+ prior profile smokes); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE minimal loading/error paragraph; remove states compare + script; boards → ask before STATES.

**Next (ask first):** `/settings/users/:userId` COMPARE — master Legacy vs New PASS/FAIL.
