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
| 2 LAYOUT | ⬜ | logo asset + fade |
| 5 WIRE | ⬜ | tokens → refresh → me/businesses → home/login |
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
