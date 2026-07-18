# Roles & permissions matrix

Source: `backend/app/services/permissions.py` (`ROLE_DEFAULTS`, `PERMISSION_KEYS`), Flutter `user_permission_groups.dart`, gates in `post_auth_route.dart`, endpoint roles in `routers/users.py`.

## Permission defaults by role

| Permission key | owner | admin | manager | staff |
|---|---|---|---|---|
| `stock_edit` | true | true | true | true |
| `purchase_create` | true | true | true | true |
| `purchase_edit` | true | true | true | **false** |
| `barcode_print` | true | true | true | true |
| `reports_access` | true | true | true | **false** |
| `export_access` | true | true | true | **false** |
| `user_manage` | true | true | **false** | **false** |
| `delete_access` | true | true | **false** | **false** |
| `analytics_access` | true | true | true | **false** |

`super_admin` (user flag): bypasses `require_role` / `require_permission` in `deps.py`.

## Settings Users UI / API capability by role

| Capability | owner | admin | manager | staff |
|---|---|---|---|---|
| Open `/settings/users` | yes | yes | **yes** | no (redirect) |
| Create user | yes | yes | **no** | no |
| Patch / delete / reset / edit perms / bulk | yes | yes* | **no** | no |
| View profile / list / most read endpoints | yes | yes | yes | no |
| Assign role `owner` | yes | **no** | no | no |
| Owner dashboard (`sessionHasOwnerDashboard`) | yes | yes | **yes** | no |

\*Admin cannot manage/create owner targets (`actor_can_manage_target`).

## Merge rules

1. Read effective = role defaults ⊕ bool overrides in `permissions_json`.
2. Legacy override key `delete_items` maps to `delete_access`.
3. Changing role (PATCH or bulk `set_role`) **replaces** overrides with a fresh copy of that role’s defaults.
4. PATCH `/permissions` merges selected bool keys into stored JSON.

## Checklist 1.11 status

**Manager role:** confirmed real — sees Users list and owner dashboard; cannot create/admin users; `user_manage` default false. No longer an inventory “unknown.”
