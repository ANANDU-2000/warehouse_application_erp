# Services (Phase 3.3)

Business logic ports from FastAPI `app/services/*.py` (Login foundation).

| File | Legacy source |
|---|---|
| `passwords.service.ts` | `passwords.py` |
| `permissions.service.ts` | `permissions.py` |
| `authLogin.service.ts` | `auth_login.py` |
| `accountEligibility.service.ts` | gates from `routers/auth.py` login |
| `jwtTokens.service.ts` | `jwt_tokens.py` (Phase 3.5) |
| `health.service.ts` | Phase 3.1 health |

**Deferred:** Google OAuth → later; Bearer middleware → 3.6; login DB writes (Unknown #1).

See `docs/35_Service_Layer.md` and `docs/37_Authentication_JWT.md`.
