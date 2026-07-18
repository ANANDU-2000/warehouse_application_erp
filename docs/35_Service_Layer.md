# 35 — Service layer (Phase 3.3)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 3 task **3.3**  
**Location:** `new-app/backend/src/services/`  
**Focus:** Login foundation only (thin 1:1 ports)  
**Branch:** `phase3/service-layer`  

---

## 1. Purpose

Port Login-related FastAPI service logic into Node/TypeScript services that sit on Phase 3.2 identity repositories. No Express Login routes (3.4), no JWT (3.5), no login DB writes until [`docs/modules/login.md`](modules/login.md) Unknown #1 is decided.

---

## 2. Layer rule

```
routes → controllers → services → repositories → SQL Server
```

Services apply business rules; repositories return raw row shapes only ([`docs/34_Repository_Pattern.md`](34_Repository_Pattern.md)).

---

## 3. Delivered services

| New file | Legacy source | Behavior |
|---|---|---|
| `passwords.service.ts` | `source-app/backend/app/services/passwords.py` | Strength (≥8, digit, not common set); bcrypt hash/verify; invalid hash → `false` |
| `permissions.service.ts` | `source-app/backend/app/services/permissions.py` | `PERMISSION_KEYS`, `ROLE_DEFAULTS`, `effectivePermissions`, `membershipPermissions`, `actorCanManageTarget`; parse `permissions_json` NVARCHAR |
| `authLogin.service.ts` | `source-app/backend/app/services/auth_login.py` | `normalizeLoginEmail`; `resolveUserByEmail` via `UsersRepository` |
| `accountEligibility.service.ts` | `routers/auth.py` login gates 213–218 | `deleted_at` / `is_blocked` / `!is_active` → same detail strings |
| `errors.ts` | — | `AccountInactiveError`, `AccountBlockedError`, `PasswordStrengthError` |
| `health.service.ts` | Phase 3.1 | unchanged |

### Account gate order (legacy parity)

```213:218:source-app/backend/app/routers/auth.py
        if getattr(user, "deleted_at", None) is not None:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Account is inactive")
        if getattr(user, "is_blocked", False):
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Account is blocked")
        if not user.is_active:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Account is inactive")
```

---

## 4. Explicitly deferred

| Item | Phase / note |
|---|---|
| JWT create/decode (`jwt_tokens.py`) | **3.5** |
| Google OAuth (`google_oauth.py`) | **3.5** |
| Express `/v1/auth/*` routers | **3.4** |
| Login DB writes (`last_login_at`, `user_sessions`, staff LOGIN audit) | Deferred — **Unknown #1** (`flush` without `commit`) |
| `staff_audit.py`, `default_workspace.py` | Need write repos; later |
| `require_permission_key` HTTP raise | **3.6** authorization middleware |
| Non-Login domain services | Per module later |

---

## 5. How 3.4 will consume (not built here)

1. `resolveUserByEmail` → missing / null `password_hash` / `!verifyPassword` → 401 `"Invalid email or password"`
2. `assertAccountEligible` → map domain errors to 403 with legacy strings
3. Token issue → **3.5**
4. Persist session / last_login / staff audit → only after Unknown #1 decision + repos

---

## 6. Tests

| Suite | Coverage |
|---|---|
| `tests/services/passwords.service.test.ts` | strength, hash/verify, bad hash |
| `tests/services/permissions.service.test.ts` | role defaults, overrides, alias, actor manage |
| `tests/services/authLogin.service.test.ts` | normalize, short-circuit, repo hit |
| `tests/services/accountEligibility.service.test.ts` | deleted / blocked / inactive / ok |

```bash
cd new-app/backend && npm test && npm run build
```

Live SQL Server **not** required.

---

## 7. Review PASS/FAIL (Legacy vs New)

| Check | Legacy | New | Result |
|---|---|---|---|
| Email normalize + resolve | `auth_login.py` | `authLogin.service.ts` | PASS |
| Password strength + bcrypt | `passwords.py` | `passwords.service.ts` | PASS |
| Role permission merge | `permissions.py` | `permissions.service.ts` | PASS |
| Account 403 detail strings | `auth.py` login | `accountEligibility.service.ts` | PASS |
| No JWT / routes / login writes | — | deferred | PASS |
| Unit tests + build | — | green | PASS |

**Verdict: PASS**

---

## 8. Rollback notes

1. Revert commits on `phase3/service-layer` (or delete branch).
2. Remove `bcrypt` / `@types/bcrypt` from `package.json` if rolling back dependency.
3. Set checklist **3.3 → ⬜**, **3.4 → 🔒**.
4. No schema changes in this phase.

---

## 9. Checklist impact

- **3.3** → ✅  
- **3.4** Controllers/routes → unlocked ⬜  
