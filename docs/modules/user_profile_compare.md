# User profile `/settings/users/:userId` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** User profile `/settings/users/:userId` only — not list page, not Settings module, not activity feed APIs  
**Spec:** [`users-roles.md`](users-roles.md) · slice compares below

**Verdict:** **PASS** for in-scope user profile page loop (SCAFFOLD→STATES + profile/permissions APIs). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · COMPARE · **Activity WIRE** |
| 🟡 Current | Activity WIRE PASS — ask before Subagent 4 |
| ⬜ Pending (ask first) | Subagent 4 — [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) |
| ⏸ Deferred | Merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD slots / manage gate | `/settings/users/:userId` + redirect | `UserProfilePage` + `sessionCanManageUsers` | PASS | [`user_profile_scaffold_compare.md`](user_profile_scaffold_compare.md) |
| 2 | LAYOUT chrome | AppBar / header / TabBar Hexa | brand tokens + slots | PASS | [`user_profile_layout_compare.md`](user_profile_layout_compare.md) |
| 3 | FIELDS header + KPI + activity chips + perms catalog | widgets + catalogs | `userProfileFields` + helpers | PASS | [`user_profile_fields_compare.md`](user_profile_fields_compare.md) |
| 4 | BUTTONS back/Edit/More/Save/delete | popOrGo + sheets | Local handlers | PASS | [`user_profile_buttons_compare.md`](user_profile_buttons_compare.md) |
| 5 | WIRE profile GET/PATCH/reset/DELETE | `hexa_api` | `usersApi` profile methods | PASS | [`user_profile_wire_compare.md`](user_profile_wire_compare.md) |
| 6 | WIRE permissions GET/PATCH | admin | `getUserPermissions` / `patchUserPermissions` | PASS | wire compare |
| 7 | Overview KPI from `stats` | Purchases…Scans | live bind | PASS | wire compare |
| 8 | Overview Notes card when non-empty | `_OverviewTab` | `USER_PROFILE_NOTES_LABEL` + bind | PASS | page + copy |
| 9 | STATES loading spinner | `CircularProgressIndicator` | centered ring | PASS | [`user_profile_states_compare.md`](user_profile_states_compare.md) |
| 10 | STATES errors | HexaErrorCard `Could not load user` | FriendlyLoadError + subtitle map | PASS | states compare |
| 11 | STATES not found | `User not found.` | exact | PASS | states compare |
| 12 | STATES permissions load/error/view-only | spinner + FriendlyLoadError + banner | same | PASS | states compare |

**Overall (in-scope `/settings/users/:userId` profile):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Activity tab feed / stock / purchases / items / ledger APIs | **Activity WIRE PASS** — [`user_profile_activity_wire_compare.md`](user_profile_activity_wire_compare.md) |
| Activity load STATES (spinner/error per section) | Included in Activity WIRE |
| Pull-to-refresh `RefreshIndicator` | AppBar back + retry covers invalidate |
| Edit sheet Notes field | Flutter edit sheet has name/email/phone/role only |
| List page / Settings module | Separate routes |
| Merge to `main` | Ask first |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:user-profile-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc present)
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script (+ Notes card if bundled): revert COMPARE commit. Restore prior page/copy if Notes change included.

---

## 5. Next after Approve

1. Ask before: one **Subagent 4 satellite** from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md), **or**  
2. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**

*(Activity WIRE done — see [`user_profile_activity_wire_compare.md`](user_profile_activity_wire_compare.md).)*
