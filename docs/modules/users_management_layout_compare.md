# Users `/settings/users` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `user_management_page.dart` AppBar/body chrome; `HexaColors` / `adaptiveElevated`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg operational | adaptiveScaffold / brand bg | `#F7F9F6` | PASS |
| 2 | AppBar white + border | adaptiveAppBarBg | white + `#E5E7EB` | PASS |
| 3 | Title “Users” w800 / 24 | titleLarge | `USERS_MGMT_TITLE` + CSS | PASS |
| 4 | Inert back / refresh icons | IconButtons | `pointer-events: none` spans | PASS |
| 5 | Select icon when admin | canAdmin | `sessionCanAdminUsers` visibility | PASS |
| 6 | Add tonal chrome when create | canCreate | `sessionCanCreateUsers` inert chip | PASS |
| 7 | Search strip outline r10 | TextField chrome | muted bar, **no input** | PASS |
| 8 | Status strip elevated | chips row | `#F2F2F7` strip, no chips | PASS |
| 9 | List/detail white cards r12 | list + panel | cards + flex 4:5; detail ≥900px | PASS |
| 10 | Bulk bar chrome | bottom bar when select | muted footer strip | PASS |
| 11 | Slot order + manage gate | SCAFFOLD | unchanged | PASS |
| 12 | Fields / onClick / API | Yes | **Deferred** | N/A |

**Smoke:** `npm run test:users-management-layout`; `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove this compare + check script; boards → ask before LAYOUT.

**Next (ask first):** `/settings/users` FIELDS — done → [`users_management_fields_compare.md`](users_management_fields_compare.md). Ask before BUTTONS.
