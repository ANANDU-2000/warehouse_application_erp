# User profile `/settings/users/:userId` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_profile_header.dart`; `user_overview_kpi_grid.dart`; `user_activity_tab.dart`; `user_permission_groups.dart`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Header empty name `—` | Yes | `USER_PROFILE_NAME_EMPTY` | PASS |
| 2 | Role / status pills via helpers | UserRoleStyle | `displayUserRole` / `userStatusLabel` | PASS |
| 3 | `Last active:` + label helper | UserLastActive | prefix + `userLastActiveLabel` | PASS |
| 4 | Warehouse / email / phone when present | Yes | prefix ready; values **WIRE** | PASS* |
| 5 | Main tabs Overview/Activity/Permissions switch | TabController | local `tab` state | PASS |
| 6 | Overview KPI labels order | Purchases…Scans | `USER_PROFILE_KPI_*` + `0` until WIRE | PASS |
| 7 | Activity chips order/labels | All activity…Ledger | `USER_ACTIVITY_SECTION_*` | PASS |
| 8 | Activity chip select local | section provider | `activitySection` state | PASS |
| 9 | Permission groups + keys/labels | exact catalog | `USER_PERMISSION_GROUPS` | PASS |
| 10 | Permission toggles (admin) | draft map | local `permDraft`; disabled if !admin | PASS |
| 11 | Edit / More / back / API | Yes | **Deferred** BUTTONS/WIRE | N/A |

\*Empty warehouse/email/phone omitted until profile GET (Flutter hides empty).

**Smoke:** `npm run test:user-profile-fields` (+ scaffold/layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT header bars; remove `userProfileFields.ts` + this compare + script; boards → ask before FIELDS.

**Next (ask first):** `/settings/users/:userId` BUTTONS — back popOrGo, Edit sheet, More menu actions (local / navigate; no live API yet if WIRE deferred).
