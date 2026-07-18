# Splash UI — SCAFFOLD compare (Step 1)

**Branch:** `phase4/login-scaffold`  
**Source:** `splash_page.dart` (visual shell only)

| Check | Legacy | New | Status |
|---|---|---|---|
| Route `/splash` | Yes | `SplashPage` | PASS |
| `/` entry | splash (router) | redirect → `/splash` | PASS |
| Gradient `#062E28`→`#0E4F46`→`#159A8A` | Yes | CSS | PASS |
| Logo box 96×96 | Yes | placeholder warehouse icon | PASS |
| Title Harisree Warehouse | `HexaColors.appName` | same | PASS |
| Tagline Stock · Purchase · Delivery | `appTagline` | same | PASS |
| Footer `… v1.0` | Yes | same | PASS |
| `_boot` / restore / Retry | Yes | **Deferred** | N/A |

**Rollback:** Revert SCAFFOLD commit; restore `/` → `/login`.
