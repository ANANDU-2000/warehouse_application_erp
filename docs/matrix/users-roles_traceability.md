# Traceability matrix — Users & Roles

| Legacy Feature | Future React (placeholder) | Future API | DB | Rules | Status |
|---|---|---|---|---|---|
| User list `/settings/users` | `features/settings/users/UserManagementPage` | `GET …/users` | users, memberships | manage gate includes manager | Complete |
| Create user sheet | `…/CreateUserSheet` | `POST …/users` | users, memberships | create gate excludes manager; no owner role | Complete |
| User profile tabs | `…/UserProfilePage` | `GET/PATCH …/users/{id}` | users, memberships | admin mutate | Complete |
| Permission switches | `…/PermissionsTab` | GET/PATCH permissions | memberships.permissions_json | ROLE_DEFAULTS + merge | Complete |
| Reset password | dialog | `POST …/reset-password` | users.password_hash | readable password | Complete |
| Soft delete / block | menus | DELETE / PATCH / bulk | users flags | no self-delete; guard owner | Complete |
| Bulk actions | bulk bar | `POST …/bulk` | users, memberships | set_role resets perms | Complete |
| Active sessions | home/ops consumer | `GET …/active-sessions` | users.last_active_at | 5 min window | Complete |
| Activity / ledger tabs | profile activity | created-items, stock-adjustments, purchases, ledger | various | manager read on most | Complete |
| Route redirect | router guard | — | — | !manage → /settings | Complete |

Evidence: [`docs/modules/users-roles.md`](../modules/users-roles.md)
