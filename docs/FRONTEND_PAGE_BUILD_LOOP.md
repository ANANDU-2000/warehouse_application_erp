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
| 4 BUTTONS | ✅ | Retry stub + Use another account → `/login` — [`splash_buttons_compare.md`](modules/splash_buttons_compare.md) |
| 5 WIRE | ⬜ | tokens → refresh → me/businesses → home/login |
| 7 COMPARE | ⬜ | |

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

### Dashboard (staff `/staff/home`)

| Step | Status | Evidence |
|---|---|---|
| 1 SCAFFOLD | ✅ | empty section slots — [`staff_home_scaffold_compare.md`](modules/staff_home_scaffold_compare.md) |
| 2 LAYOUT | ✅ | greeting + section headers — [`staff_home_layout_compare.md`](modules/staff_home_layout_compare.md) |
| 3 FIELDS | ✅ | Home focus radios — [`staff_home_fields_compare.md`](modules/staff_home_fields_compare.md) |
| 4 BUTTONS | ⬜ | profile sheet / CTAs next |
| 7 COMPARE | ⬜ | |

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
