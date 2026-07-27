# Splash UI — BUTTONS compare (Step 4)

**Branch:** `phase4/login-scaffold`  
**Source:** `splash_page.dart` L179–209 (error CTAs; no `_boot` wire)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Error message pad H 40, 13px, α0.85, lh 1.45 | Yes | CSS | PASS |
| 2 | Demo error string (session refresh fail) | Exact string | Same constant | PASS |
| 3 | Retry filled α0.2 + refresh icon 18 | Yes | `.splash-page__retry` | PASS |
| 4 | Retry disabled when busy | `_busy` | `disabled={busy}` | PASS |
| 5 | Retry handler | `_boot` | Local stub 300ms (no API) → **superseded by WIRE** (`boot`) | PASS (BUTTONS); see WIRE |
| 6 | Use another account → `/login` | `context.go('/login')` | `navigate("/login")` | PASS |
| 7 | Gap 16 / 10 | Yes | CSS | PASS |
| 8 | `_boot` / refresh / me/businesses | Yes | **Deferred WIRE** | N/A |

**Rollback:** Revert BUTTONS commit; restore LAYOUT-only always-spinner Splash.
