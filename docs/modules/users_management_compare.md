# Users `/settings/users` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Users list `/settings/users` only — not profile page body, not Settings module  
**Spec:** [`users-roles.md`](users-roles.md) · slice compares below

**Verdict:** **PASS** for in-scope users list page loop (SCAFFOLD→STATES + list/create/bulk APIs). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · COMPARE |
| 🟡 Current | List COMPARE PASS — profile COMPARE + **Activity WIRE PASS**; ask before Subagent 4 |
| ⬜ Pending (ask first) | Subagent 4 — [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) |
| ⏸ Deferred | Merge to `main`; desktop detail panel live; card overflow menus |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD slots / manage gate | `/settings/users` + redirect | `UserManagementPage` + `sessionCanManageUsers` | PASS | [`users_management_scaffold_compare.md`](users_management_scaffold_compare.md) |
| 2 | LAYOUT chrome | AppBar / strips / cards | Hexa tokens + slots | PASS | [`users_management_layout_compare.md`](users_management_layout_compare.md) |
| 3 | FIELDS search + chips | `user_list_filters.dart` | `userListFilters.ts` + chips | PASS | [`users_management_fields_compare.md`](users_management_fields_compare.md) |
| 4 | BUTTONS CTAs | back/select/Add/drawer/bulk | Local + sheets | PASS | [`users_management_buttons_compare.md`](users_management_buttons_compare.md) |
| 5 | WIRE list | `include_inactive=true` | `listBusinessUsers` | PASS | [`users_management_wire_compare.md`](users_management_wire_compare.md) |
| 6 | WIRE create + credentials | POST users + share dialog | `createBusinessUser` + dialog | PASS | wire compare |
| 7 | WIRE bulk | POST `/users/bulk` | `bulkBusinessUsers` | PASS | wire compare |
| 8 | Compact card display | name/role/email/status/last active | `UserCompactCard` + `userLastActive` | PASS | wire compare |
| 9 | STATES loading | `ListSkeleton` 6×84 | `UsersListSkeleton` | PASS | [`users_management_states_compare.md`](users_management_states_compare.md) |
| 10 | STATES errors | HexaErrorCard `Could not load users` | FriendlyLoadError + subtitle map | PASS | states compare |
| 11 | STATES empty | `No users match your filters.` | exact | PASS | states compare |
| 12 | Profile tap route exists | `/settings/users/:id` | `UserProfilePage` COMPARE PASS | PASS | [`user_profile_compare.md`](user_profile_compare.md) |

**Overall (in-scope `/settings/users` list):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Profile page tabs / permissions / ledger | Profile COMPARE + Activity WIRE PASS |
| Card overflow: reset password / block / copy credentials / delete | Use bulk or profile later |
| Desktop `UserManagementDetailPanel` live content | Split chrome present; body deferred |
| Pull-to-refresh `RefreshIndicator` | AppBar refresh covers invalidate |
| `session.isSuperAdmin` in manage gate | No flag on `PrimaryBusinessSession` yet |
| Settings module pages | Queue later |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:users-management-compare
# runs layout → fields → buttons → wire → states (+ compare doc present)
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Ask before: **`/notifications` WIRE** — [`notifications_buttons_compare.md`](notifications_buttons_compare.md), **or**  
2. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**

*(Notifications BUTTONS done — see [`notifications_buttons_compare.md`](notifications_buttons_compare.md).)*
