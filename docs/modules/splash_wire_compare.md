# Splash UI — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `splash_page.dart` `_boot`; `session_notifier.dart` `_restoreImpl`; `jwt_access_token.dart`; `post_auth_route.dart`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold start calls restore | `_boot` post-frame | `useEffect` → `boot` | PASS |
| 2 | Web restore timeout 8s | `kIsWeb` 8s | `SPLASH_RESTORE_TIMEOUT_MS = 8000` | PASS |
| 3 | One warmup retry + exact copy | 10s delay + string | Same constants + `_warmupRetried` | PASS |
| 4 | Tokens → near-expiry refresh (90s) | `ensureFreshAccess` | `isAccessTokenExpiredOrNearExpiry` + `refreshTokens` | PASS |
| 5 | `GET /v1/me/businesses` | Yes | `meBusinesses` | PASS |
| 6 | Success → staff/owner home | `authenticatedHomePath` | Same helper | PASS |
| 7 | No tokens → `/login` | Yes | `replace: true` | PASS |
| 8 | Hard expire → `/login?notice=session_expired` | Yes | Same query | PASS |
| 9 | Tokens present, no session → Retry chrome | Exact refresh-fail string | `SPLASH_SESSION_REFRESH_ERROR` | PASS |
| 10 | Retry re-runs `_boot` | Yes | `handleRetry` → `boot` | PASS |
| 11 | Use another account → `/login` | Yes | Clears tokens + navigate | PASS |
| 12 | `POST /v1/auth/refresh` | Yes | `authApi.refreshTokens` | PASS |
| 13 | SessionCache offline businesses | Yes | **Deferred** | N/A |
| 14 | Super-admin flag on session | `_readIsSuperAdmin` | **Deferred** (routing unused) | N/A |
| 15 | Login snack for `notice=` | Yes | **Deferred** (Login STATES/notice) | N/A |

**Rollback:** Revert Splash WIRE commit; restore BUTTONS stub Retry (`setTimeout` 300ms); remove `splashRestore.ts` / `refreshTokens` if unused elsewhere; keep BUTTONS labels.

**Next:** Splash COMPARE (Step 7) — full Legacy vs New table — then ask before Users & Roles / staff WIRE-2 / Dashboard sign-off.
