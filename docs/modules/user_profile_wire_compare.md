# User profile `/settings/users/:userId` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `hexa_api.dart` get/patch/delete/reset/permissions; `user_profile_page.dart`; `user_profile_providers.dart`; `user_profile_header.dart`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/users/:userId` on mount | Yes | `getBusinessUser` | PASS |
| 2 | Header name/role/status/email/phone/warehouse/last active | Yes | live bind | PASS |
| 3 | Overview KPI from `stats` | Yes | purchases/stock/items/scans totals | PASS |
| 4 | `GET …/permissions` (admin) | Yes | `getUserPermissions` → draft | PASS |
| 5 | Edit Save → `PATCH …/users/:id` | Yes | `patchBusinessUser` | PASS |
| 6 | Reset → `POST …/reset-password` + dialog | Yes | reset + New password | PASS |
| 7 | Block / activate → PATCH flags | Yes | `is_blocked` / `is_active` | PASS |
| 8 | Delete → `DELETE` then pop list | Yes | `deleteBusinessUser` + popOrGo | PASS |
| 9 | Save permissions → `PATCH …/permissions` | Yes | `patchUserPermissions` | PASS |
| 10 | Copy email clipboard | Yes | email \|\| login_email | PASS |
| 11 | Activity feed/stock/purchases/ledger APIs | Yes | **Deferred** | N/A |
| 12 | Full skeleton / FriendlyLoadError | Yes | Minimal loading/error — **STATES** | N/A |

**Smoke:** `npm run test:user-profile-wire` (+ prior profile smokes); `npm run build` PASS.

**Rollback:** Revert WIRE commit; restore BUTTONS stubs; remove wire compare + script; boards → ask before WIRE.

**Next (ask first):** `/settings/users/:userId` STATES — ListSkeleton/FriendlyLoadError polish for profile load.
