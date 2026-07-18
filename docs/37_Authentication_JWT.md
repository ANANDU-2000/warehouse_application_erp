# 37 — Authentication JWT (Phase 3.5)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 3 task **3.5** (JWT + refresh; Google OAuth deferred)  
**Location:** `new-app/backend/src/services/jwtTokens.service.ts`, `src/auth/jwtTokenIssuer.ts`  
**Branch:** `phase3/jwt-auth`  
**Source:** `source-app/backend/app/services/jwt_tokens.py`, `routers/auth.py` refresh  

---

## 1. Purpose

Port FastAPI JWT create/decode 1:1. Replace `NotImplementedTokenIssuer` so `POST /v1/auth/login` returns `TokenPair`. Wire `POST /v1/auth/refresh`. No Google OAuth, no Bearer middleware (3.6), no login DB writes (Unknown #1).

---

## 2. Claims (legacy parity)

| Token | Secret env | Claims |
|---|---|---|
| Access | `JWT_SECRET` | `sub` (user id), `typ=access`, `exp`, `tv` (token_version) |
| Refresh | `JWT_REFRESH_SECRET` | `sub`, `typ=refresh`, `exp` |

| Setting | Default | FastAPI analogue |
|---|---|---|
| `JWT_ACCESS_TTL_MINUTES` | 15 | `jwt_access_ttl_minutes` |
| `JWT_REFRESH_TTL_DAYS` | 30 | `jwt_refresh_ttl_days` |
| `expires_in` | access minutes × 60 | same |

Algorithm: **HS256** (`jsonwebtoken`).

Production: `assertJwtSecretsForProduction()` — reject `change-me` and secrets &lt; 32 chars when `NODE_ENV=production` (same intent as FastAPI config).

---

## 3. HTTP behavior after 3.5

| Method | Path | Behavior |
|---|---|---|
| POST | `/v1/auth/login` | 400 / 401 / 403 unchanged; success → **200** TokenPair |
| POST | `/v1/auth/refresh` | 401 invalid / user not found; success → **200** TokenPair |
| POST | `/v1/auth/google` | **501** — Google OAuth deferred (Login UI has no button) |
| POST | `/v1/auth/register` etc. | Still 501 |

Refresh does **not** check deleted/blocked/inactive (legacy `auth.py` refresh does not either — do not invent).

---

## 4. Files

| File | Role |
|---|---|
| `jwtTokens.service.ts` | create/decode helpers |
| `jwtTokenIssuer.ts` | `TokenIssuer` implementation |
| `auth.controller.ts` | login + refresh |
| `config/env.ts` | JWT settings |
| `.env.example` | documented vars |

Default in `createApp`: `new JwtTokenIssuer()`.

---

## 5. Deferred

| Item | When |
|---|---|
| Google OAuth (`/google`) | Follow-up micro-slice |
| Bearer `get_current_user` middleware + `token_version` revoke | **3.6** |
| Login DB writes | Unknown #1 |

---

## 6. Tests

- Unit: access/refresh round-trip; wrong `typ` → null  
- Login: **200** TokenPair with claims  
- Refresh: 401 / 200  

```bash
cd new-app/backend && npm test && npm run build
```

---

## 7. Review PASS/FAIL

| Check | Result |
|---|---|
| Claims/secrets/TTLs match `jwt_tokens.py` | PASS |
| Login success → TokenPair | PASS |
| Refresh parity (no extra eligibility) | PASS |
| Google still 501 | PASS |
| No 3.6 middleware / no login writes | PASS |
| Tests + build | PASS |

**Verdict: PASS** (JWT + refresh; Google noted deferred)

---

## 8. Rollback

1. Revert `phase3/jwt-auth`.
2. Restore `NotImplementedTokenIssuer` as default.
3. Checklist: 3.5 → ⬜, 3.6 → 🔒.

---

## 9. Checklist impact

- **3.5** → ✅ (JWT + refresh; Google OAuth still 501)  
- **3.6** Authorization → unlocked ⬜  
