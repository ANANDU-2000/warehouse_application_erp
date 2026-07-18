# Services (Phase 3.3)

Business logic ports from FastAPI `app/services/*.py` (Login foundation).

| File | Legacy source |
|---|---|
| `passwords.service.ts` | `passwords.py` |
| `permissions.service.ts` | `permissions.py` |
| `authLogin.service.ts` | `auth_login.py` |
| `accountEligibility.service.ts` | gates from `routers/auth.py` login |
| `health.service.ts` | Phase 3.1 health |

**Deferred:** JWT (`jwt_tokens.py`) → 3.5; Login routes → 3.4; login DB writes (Unknown #1) → later.

See `docs/35_Service_Layer.md`.
