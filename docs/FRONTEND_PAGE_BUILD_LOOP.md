# Frontend page build loop

**Rule:** One page step at a time. Stop and show diff before the next step.  
**Master order:** [`06_Master_Page_Build_Order.md`](06_Master_Page_Build_Order.md)  
**Spec per module:** `docs/modules/<module>.md`

---

## Steps (every route)

| # | Step | Allowed | Forbidden |
|---|---|---|---|
| 1 | **SCAFFOLD** | Route + empty page shell / layout container | Fields, CTA, API |
| 2 | **LAYOUT** | Brand colors, background asset, title/chrome parity | Form fields, submit, API |
| 3 | **FIELDS** | Inputs + client validation from module doc | Submit/API wire |
| 4 | **BUTTONS** | CTA / secondary links (may navigate locally) | Live API calls |
| 5 | **WIRE** | Call backend endpoints from `18_API_Inventory` / module doc | Invented endpoints |
| 6 | **STATES** | Loading, error, success, disabled | Dropping legacy messages |
| 7 | **COMPARE** | Legacy vs New PASS/FAIL table | Calling module “done” without PASS |

After COMPARE PASS → update [`00_MASTER_CHECKLIST.md`](00_MASTER_CHECKLIST.md) → next route/module.

---

## Working example — Login

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | `phase4/login-scaffold` — `/login` + `AuthPageShell` + empty `AuthFormCard` |
| 2 LAYOUT | ✅ | Brand mint/primary, `getstarted_bg.png`, warehouse icon + titles |
| 3 FIELDS | ✅ | email/password + obscure + validators (`loginValidation.ts`) — no buttons/API |
| 4 BUTTONS | ✅ | Sign In + Forgot stub + helper/© — no live API |
| 5 WIRE | ✅ | `POST /v1/auth/login` → tokens → `GET /v1/me/businesses` → home stubs |
| 6 STATES | ✅ | network banner + full §12 HTTP error mapping |
| 7 COMPARE | ✅ | [`login_compare.md`](modules/login_compare.md) — in-scope **PASS**; deferrals listed |

### Splash (landing)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | `/splash` static shell (`SplashPage`) — no restore |
| 2 LAYOUT | ✅ | `app_logo.png` + 800ms fade + static spinner — [`splash_layout_compare.md`](modules/splash_layout_compare.md) |
| 4 BUTTONS | ✅ | Retry + Use another account → `/login` — [`splash_buttons_compare.md`](modules/splash_buttons_compare.md) |
| 5 WIRE | ✅ | tokens → refresh → me/businesses → home/login — [`splash_wire_compare.md`](modules/splash_wire_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`splash_compare.md`](modules/splash_compare.md) |

### Dashboard (owner `/home`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty section slots — [`home_scaffold_compare.md`](modules/home_scaffold_compare.md) |
| 2 LAYOUT | ✅ | compact header + cards — [`home_layout_compare.md`](modules/home_layout_compare.md) |
| 3 FIELDS | ✅ | period chips + client state — [`home_fields_compare.md`](modules/home_fields_compare.md) |
| 4 BUTTONS | ✅ | header + tools + View all stubs — [`home_buttons_compare.md`](modules/home_buttons_compare.md) |
| 5 WIRE | ✅ | `reports/home-overview` — [`home_wire_compare.md`](modules/home_wire_compare.md) |
| 6 STATES | ✅ | skeleton + FriendlyLoadError/Retry + empty — [`home_states_compare.md`](modules/home_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`home_compare.md`](modules/home_compare.md) |

### Dashboard (owner `/home/activity`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty slots — [`home_activity_scaffold_compare.md`](modules/home_activity_scaffold_compare.md) |
| 2 LAYOUT | ✅ | AppBar / caption / table header — [`home_activity_layout_compare.md`](modules/home_activity_layout_compare.md) |
| 3 FIELDS | ✅ | period chips + custom — [`home_activity_fields_compare.md`](modules/home_activity_fields_compare.md) |
| 4 BUTTONS | ✅ | back popOrGo `/home` — [`home_activity_buttons_compare.md`](modules/home_activity_buttons_compare.md) |
| 5 WIRE | ✅ | trade/audit/staff feed — [`home_activity_wire_compare.md`](modules/home_activity_wire_compare.md) |
| 6 STATES | ✅ | skeleton / FriendlyLoadError / empty — [`home_activity_states_compare.md`](modules/home_activity_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`home_activity_compare.md`](modules/home_activity_compare.md) |

### Dashboard (owner `/home/breakdown-more`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty slots — [`home_breakdown_scaffold_compare.md`](modules/home_breakdown_scaffold_compare.md) |
| 2 LAYOUT | ✅ | AppBar / Total card / search chrome — [`home_breakdown_layout_compare.md`](modules/home_breakdown_layout_compare.md) |
| 3 FIELDS | ✅ | search input + match helper — [`home_breakdown_fields_compare.md`](modules/home_breakdown_fields_compare.md) |
| 4 BUTTONS | ✅ | back popOrGo `/home` — [`home_breakdown_buttons_compare.md`](modules/home_breakdown_buttons_compare.md) |
| 5 WIRE | ✅ | home-overview Total + rows — [`home_breakdown_wire_compare.md`](modules/home_breakdown_wire_compare.md) |
| 6 STATES | ✅ | cold spinner / silent empty — [`home_breakdown_states_compare.md`](modules/home_breakdown_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`home_breakdown_compare.md`](modules/home_breakdown_compare.md) |

### Dashboard (staff `/staff/home`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty section slots — [`staff_home_scaffold_compare.md`](modules/staff_home_scaffold_compare.md) |
| 2 LAYOUT | ✅ | greeting + section headers — [`staff_home_layout_compare.md`](modules/staff_home_layout_compare.md) |
| 3 FIELDS | ✅ | Home focus radios — [`staff_home_fields_compare.md`](modules/staff_home_fields_compare.md) |
| 4 BUTTONS | ✅ | profile sheet + tools/CTAs — [`staff_home_buttons_compare.md`](modules/staff_home_buttons_compare.md) |
| 5 WIRE | ✅ | scoped shell counts — [`staff_home_wire_compare.md`](modules/staff_home_wire_compare.md) |
| 6 STATES | ✅ | skeleton / FriendlyLoadError — [`staff_home_states_compare.md`](modules/staff_home_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`staff_home_compare.md`](modules/staff_home_compare.md) |

### Users & Roles (`/settings/users`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty chrome slots + manage gate — [`users_management_scaffold_compare.md`](modules/users_management_scaffold_compare.md) |
| 2 LAYOUT | ✅ | AppBar + muted strips + cards — [`users_management_layout_compare.md`](modules/users_management_layout_compare.md) |
| 3 FIELDS | ✅ | search + status chips — [`users_management_fields_compare.md`](modules/users_management_fields_compare.md) |
| 4 BUTTONS | ✅ | back/select/Add/drawer/bulk — [`users_management_buttons_compare.md`](modules/users_management_buttons_compare.md) |
| 5 WIRE | ✅ | list/create/bulk + cards — [`users_management_wire_compare.md`](modules/users_management_wire_compare.md) |
| 6 STATES | ✅ | ListSkeleton + HexaErrorCard — [`users_management_states_compare.md`](modules/users_management_states_compare.md) |
| 7 COMPARE | ✅ | Master PASS — [`users_management_compare.md`](modules/users_management_compare.md) |

### User profile (`/settings/users/:userId`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty slots + manage gate — [`user_profile_scaffold_compare.md`](modules/user_profile_scaffold_compare.md) |
| 2 LAYOUT | ✅ | brand AppBar/header/tabs — [`user_profile_layout_compare.md`](modules/user_profile_layout_compare.md) |
| 3 FIELDS | ✅ | header + KPI/activity/perms catalogs — [`user_profile_fields_compare.md`](modules/user_profile_fields_compare.md) |
| 4 BUTTONS | ✅ | back/Edit/More/Save stubs — [`user_profile_buttons_compare.md`](modules/user_profile_buttons_compare.md) |
| 5 WIRE | ✅ | profile GET/PATCH/reset/delete/perms — [`user_profile_wire_compare.md`](modules/user_profile_wire_compare.md) |
| 6 STATES | ✅ | spinner + HexaErrorCard/FriendlyLoadError — [`user_profile_states_compare.md`](modules/user_profile_states_compare.md) |
| 7 COMPARE | ✅ | Master PASS — [`user_profile_compare.md`](modules/user_profile_compare.md) |
| — Activity WIRE | ✅ | feed/stock/purchases/items/ledger — [`user_profile_activity_wire_compare.md`](modules/user_profile_activity_wire_compare.md) |

### Notifications (`/notifications`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | appBar/search/filters/list slots — [`notifications_scaffold_compare.md`](modules/notifications_scaffold_compare.md) |
| 2 LAYOUT | ✅ | Hexa chips/search/card chrome — [`notifications_layout_compare.md`](modules/notifications_layout_compare.md) |
| 3 FIELDS | ✅ | search/filter state + empty catalogs — [`notifications_fields_compare.md`](modules/notifications_fields_compare.md) |
| 4 BUTTONS | ✅ | back/mark-all stub/clear dialog/CTA nav — [`notifications_buttons_compare.md`](modules/notifications_buttons_compare.md) |
| 5 WIRE | ✅ | list/merge/mark-all/clear/patch — [`notifications_wire_compare.md`](modules/notifications_wire_compare.md) |
| 6 STATES | ✅ | progress/error map/empty gate/pull — [`notifications_states_compare.md`](modules/notifications_states_compare.md) |
| 7 COMPARE | ✅ | in-scope PASS — [`notifications_compare.md`](modules/notifications_compare.md) |

### Staff search (`/staff/search`) — Subagent 4

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | search/filters/results (no AppBar) — [`staff_search_scaffold_compare.md`](modules/staff_search_scaffold_compare.md) |
| 2 LAYOUT | ✅ | ChoiceChip tokens + Quick filters empty chrome — [`staff_search_layout_compare.md`](modules/staff_search_layout_compare.md) |
| 3 FIELDS | ✅ | query/section/recents + empty catalogs — [`staff_search_fields_compare.md`](modules/staff_search_fields_compare.md) |
| 4 BUTTONS | ✅ | Quick-filter push/go — [`staff_search_buttons_compare.md`](modules/staff_search_buttons_compare.md) |
| 5 WIRE | ✅ | GET /search + rows + addRecent — [`staff_search_wire_compare.md`](modules/staff_search_wire_compare.md) |
| 6 STATES | ✅ | FriendlyLoadError + reload/cold gates + TTL — [`staff_search_states_compare.md`](modules/staff_search_states_compare.md) |
| 7 COMPARE | ⬜ | — |

### Prompt template (copy per page)

```
PAGE: <name>
STEP: <n. NAME>

READ FIRST:
1. docs/modules/<module>.md
2. docs/05_Navigation_Map.md (exact path)
3. Backend routes for this page (if WIRE+)

TASK: <one step only>
STOP after this. Show diff before next step.
```
