# Login UI — WIRE compare (Step 5)

**Branch:** `phase4/login-scaffold`  
**Sources:** `login.md` §13–14, §16, §18–22; `docs/43`; `session_notifier._loginImpl`; `post_auth_route.dart`

| Call / piece | Source | Built | Match? |
|---|---|---|---|
| POST /v1/auth/login | `{email,password}` → TokenPair | `authApi.login` | PASS |
| GET /v1/me/businesses | Bearer → BusinessBrief[] | `authApi.meBusinesses` | PASS |
| Token keys | `hexa_access_token_bk` / `hexa_refresh_token_bk` | `tokenStore` | PASS |
| Staff nav | `role.toLowerCase()=='staff'` → `/staff/home` | `postAuthRoute` | PASS |
| Else nav | `/home` | same | PASS |
| primaryBusiness | `businesses.first` | `[0]` | PASS |
| Empty businesses | restore clears session | clear tokens + generic error | PASS |
| 401 UI copy | `Invalid email or password. Try again.` | MSG_401 | PASS |
| Loading spinner | during `_signIn` | `loading` state | PASS |
| Vite proxy | — | `/v1` → `:3000` | PASS |
| Full Dashboard | — | stub only | N/A |
| Network banner / 403 variants | §12 | **STATES later** | N/A |

**Rollback:** Revert WIRE commit; restore stub Sign In; remove proxy/api/tokenStore/home stubs.
