# Login — Legacy vs New COMPARE (Step 7)

**Status:** Review PASS (2026-07-18) — operator E2E: Login DB + UI tested, no errors  
**Branch:** `phase4/login-scaffold`  
**Spec:** [`login.md`](login.md) · slice compares below  
**Verdict:** **PASS** for in-scope Login password path (UI + API + live SQL). Known deferrals listed as N/A (not FAIL).

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | Layout shell | mint, max-width 420, blurred bg + card | same | PASS | [`login_layout_compare.md`](login_layout_compare.md) |
| 2 | Branding | Harisree Agency / Warehouse Management / `#0E4F46` | same | PASS | layout compare |
| 3 | Email / password fields | validation + obscure toggle | `loginValidation.ts` + filled inputs | PASS | [`login_fields_compare.md`](login_fields_compare.md) |
| 4 | Sign In / Forgot / footer | CTA + link + helper + © 2026 | same (+ forgot stub page) | PASS | [`login_buttons_compare.md`](login_buttons_compare.md) |
| 5 | `POST /v1/auth/login` | TokenPair | `authApi.login` | PASS | [`login_wire_compare.md`](login_wire_compare.md) |
| 6 | Token storage (web) | `hexa_*_token_bk` | `tokenStore.ts` | PASS | wire compare |
| 7 | `GET /v1/me/businesses` | BusinessBrief[] | `authApi.meBusinesses` | PASS | wire + `docs/43` |
| 8 | Post-auth nav | staff → `/staff/home` else `/home` | `postAuthRoute.ts` + stubs | PASS | wire compare |
| 9 | Error STATES | 401/403/422/network banner | `mapLoginError` + `AuthNetworkErrorBanner` | PASS | [`login_states_compare.md`](login_states_compare.md) |
| 10 | Loading / disabled | spinner on Sign In | same | PASS | states / buttons |
| 11 | Live SQL / health | Postgres legacy | SQL Server 46/103/149 + `databaseConnected` | PASS | `docs/44` + operator E2E |
| 12 | One adaptive layout | single Flutter tree | one React form | PASS | fields compare |

**Overall (in-scope):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Biometric sign-in | Out of Login UI slices; no dedicated biometric API |
| Query snackbars (`msg`/`notice`) | STATES deferred snackbars |
| Full Forgot / Reset pages | Stub route only; full FIELDS/API later |
| Splash `/splash` session restore | **Done** — [`splash_compare.md`](splash_compare.md) |
| Google OAuth button | Not on legacy LoginPage; backend 501 |
| Login L2 DB commit | Unknown #1 intentional; TokenPair works without it |
| Real Dashboard `/home` UI | Home stubs only; Dashboard backend not built |

---

## 3. E2E flow (verified)

```
Sign In → POST /v1/auth/login → store tokens → GET /v1/me/businesses
  → navigate /home or /staff/home (stub)
```

Operator report: Login DB + UI tested, no errors (2026-07-18).

---

## 4. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:layout && npm run test:fields && npm run test:buttons && npm run test:wire && npm run test:states && npm run build
```

---

## 5. Rollback

Docs/checklist only: revert COMPARE commit. Application code unchanged by this step.

---

## 6. Next after Approve

1. Ask before starting: Users & Roles (Seq 3) **or** staff WIRE-2  
2. Splash `/splash` — **COMPARE PASS** ([`splash_compare.md`](splash_compare.md))  
3. Hold merge of `phase4/login-scaffold` / `ops/local-sql-bootstrap` / `ops/dashboard-module` to `main` until you review
