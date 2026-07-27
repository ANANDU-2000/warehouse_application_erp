# Splash `/splash` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-18)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Splash `/splash` only (entry gate) — not Login form, not Dashboard bodies  
**Sources:** `splash_page.dart`; `session_notifier.dart` `_restoreImpl`; `jwt_access_token.dart`; `post_auth_route.dart`  
**Slice evidence:** scaffold · layout · buttons · wire compares below

**Verdict:** **PASS** for in-scope Splash page loop (SCAFFOLD → LAYOUT → BUTTONS → WIRE). Splash has no FIELDS step and no separate STATES step in [`FRONTEND_PAGE_BUILD_LOOP.md`](../FRONTEND_PAGE_BUILD_LOOP.md) — busy/error chrome is covered under LAYOUT/BUTTONS/WIRE. Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · BUTTONS · WIRE · **COMPARE** |
| 🟡 Current | Splash `/splash` route loop **PASS** — ask before next work |
| ⬜ Pending (ask first) | Users & Roles (Seq 3) **or** staff WIRE-2 bodies |
| ⏸ Deferred | SessionCache offline; Login `notice=` snack; merge `ops/dashboard-module` → `main`; full Dashboard Subagent 4 |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | Route `/splash` + `/` → splash | `SplashPage` | Same + redirect | PASS | [`splash_scaffold_compare.md`](splash_scaffold_compare.md) |
| 2 | Gradient brand chrome | `#062E28`→`#0E4F46`→`#159A8A` | CSS | PASS | scaffold compare |
| 3 | Title / tagline / footer v1.0 | `HexaColors` | Exact strings | PASS | scaffold compare |
| 4 | Logo `app_logo.png` + clip + fallback | Flutter asset | `/brand/app_logo.png` + SVG | PASS | [`splash_layout_compare.md`](splash_layout_compare.md) |
| 5 | Fade 800ms easeOut | `AnimationController` | `splash-fade` | PASS | layout compare |
| 6 | Busy spinner 24 / stroke 2.5 | when `_busy` | `.splash-page__spinner` | PASS | layout compare |
| 7 | Error pad / α / Retry + Use another account | Exact CTAs | CSS + labels | PASS | [`splash_buttons_compare.md`](splash_buttons_compare.md) |
| 8 | Cold start `_boot` | post-frame | `useEffect` → `boot` | PASS | [`splash_wire_compare.md`](splash_wire_compare.md) |
| 9 | Web 8s timeout + one warmup | Exact string + 10s | `splashCopy` constants | PASS | wire compare |
| 10 | Near-expiry refresh (90s) + `POST /auth/refresh` | `ensureFreshAccess` | `splashRestore` + `refreshTokens` | PASS | wire compare |
| 11 | `GET /me/businesses` → home path | `authenticatedHomePath` | Same helper | PASS | wire compare |
| 12 | No tokens → `/login` | Yes | `replace: true` | PASS | wire compare |
| 13 | Hard expire → `?notice=session_expired` | Yes | Same query | PASS | wire compare |
| 14 | Soft fail → Retry chrome string | Exact | `SPLASH_SESSION_REFRESH_ERROR` | PASS | wire compare |
| 15 | Retry re-runs boot | `_boot` | `handleRetry` → `boot` | PASS | wire (supersedes BUTTONS stub) |

**Overall (in-scope Splash `/splash`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| SessionCache offline businesses | Flutter offline path; no web SharedPreferences cache port yet |
| Super-admin flag on session | Unused for splash routing |
| Login snack for `notice=` / `msg=` | Login STATES snackbars not wired |
| Native non-web 25s restore timeout | Web-first port (`kIsWeb` 8s only) |
| Full `auth401CircuitOpenProvider` parity | Splash uses clear-tokens + notice path |
| Workspace bootstrap after restore | Flutter `_scheduleWorkspaceBootstrap` — post-home |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:splash-compare
# runs scaffold → layout → buttons → wire (+ splash_compare.md present)
npm run build
```

---

## 4. Rollback

Docs/checklist only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Ask before starting: **Users & Roles** (Seq 3 — backend still me/businesses only) **or** staff **WIRE-2** bodies  
2. Do **not** mark full Dashboard module ✅ until Subagent 4 remaining routes are agreed  
3. Hold merge of `ops/dashboard-module` to `main` until you review

---

## 6. Source references

```45:95:source-app/flutter_app/lib/features/splash/presentation/splash_page.dart
  Future<void> _boot() async {
    // restore timeout → warmup → home / login / Retry chrome
```

```27:75:new-app/frontend/src/features/splash/SplashPage.tsx
  const boot = useCallback(async () => {
    // restoreSessionWithWebTimeout → warmup → navigate / Retry
```
