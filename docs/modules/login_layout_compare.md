# Login UI — LAYOUT compare (Step 2)

**Branch:** `phase4/login-scaffold`  
**Sources:** `docs/modules/login.md` §2–5; `auth_page_shell.dart`; `login_page.dart` title block

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Scaffold mint `#E8F5F2` | Yes | `hexaColors.scaffoldMint` | PASS |
| 2 | Shell max-width 420 | Yes | `.auth-page-shell__column` | PASS |
| 3 | Blurred `getstarted_bg.png` + scrim | Yes | `/brand/getstarted_bg.png` + blur/scrim | PASS |
| 4 | Atmosphere gradient fallback | Yes | `.auth-page-shell__atmosphere` | PASS |
| 5 | Brand primary `#0E4F46` on icon | Yes | SVG fill | PASS |
| 6 | Title Harisree Agency / Warehouse Management | Yes | LoginPage chrome | PASS |
| 7 | Sign In heading (no fields yet) | Yes (above fields) | Heading only | PASS |
| 8 | Email/password fields | Yes | **Deferred to FIELDS** | N/A (by design) |
| 9 | Sign In button / Forgot link | Yes | **Deferred** | N/A |
| 10 | API calls | Yes | None in LAYOUT | PASS |

**Rollback:** Revert LAYOUT commit; keep SCAFFOLD empty card; remove `public/brand/getstarted_bg.png` if needed.
