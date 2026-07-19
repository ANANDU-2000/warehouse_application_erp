# Users `/settings/users` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `business_users_provider.dart`; `hexa_api.dart` list/create/bulk; `user_compact_card.dart`; `user_last_active.dart`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/users?include_inactive=true` | Yes | `listBusinessUsers` | PASS |
| 2 | businessId from primary session | Yes | `sessionStore` | PASS |
| 3 | Client filter + chip counts on live rows | Yes | `applyUserListFilters` | PASS |
| 4 | Compact card name/role/email/status/last active | Yes | `UserCompactCard` | PASS |
| 5 | Select-mode checkbox + bulk POST | Yes | `bulkBusinessUsers` | PASS |
| 6 | Create POST + credential dialog | Yes | create + Share credentials | PASS |
| 7 | Refresh refetch | invalidate | `retryTick` reload | PASS |
| 8 | Empty filter copy | `No users match your filters.` | exact | PASS |
| 9 | Profile tap → `/settings/users/:id` | Yes | stub route | PASS |
| 10 | Full skeleton / FriendlyLoadError | Yes | Minimal loading/error — **STATES** | N/A |
| 11 | Card overflow reset/block/credentials | Yes | **Deferred** | N/A |

**Smoke:** `npm run test:users-management-wire` (+ prior users smokes); `npm run build` PASS.

**Rollback:** Revert WIRE commit; restore BUTTONS stubs; remove wire compare + script; boards → ask before WIRE.

**Next (ask first):** `/settings/users` STATES — skeleton + FriendlyLoadError / Retry copy.
