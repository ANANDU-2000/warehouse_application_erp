# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3.5** — JWT + refresh: `POST /v1/auth/login` and `/refresh` return `TokenPair`.  
Authorization middleware → **3.6**. Google OAuth still **501** (deferred).

See `docs/37_Authentication_JWT.md` (repo root docs).

## Layout

```
src/
  routes/         → /api/health + /v1/auth/*
  controllers/    → health + auth (login, refresh)
  services/       → Login foundation + jwtTokens
  repositories/   → users / businesses / memberships
  auth/           → loginRequest + TokenIssuer (JwtTokenIssuer)
  middleware/
  config/         → env (SQL + JWT)
```

## Endpoints (current)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Liveness |
| POST | `/v1/auth/login` | 401/403 gates; **200** TokenPair |
| POST | `/v1/auth/refresh` | **200** TokenPair or 401 |
| POST | `/v1/auth/{register,forgot-password,reset-password,google}` | 501 stubs |

## Scripts

```bash
npm install
npm run dev
npm test
npm run build && npm start
```

Copy `.env.example` → `.env`. Set `JWT_*` for production (no `change-me`; ≥32 chars).
