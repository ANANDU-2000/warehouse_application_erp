# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3 platform COMPLETE** — see `docs/PHASE3_SIGN_OFF.md`.  
Next: Phase **4.1** React scaffold (or Login `GET /v1/me/businesses` micro-plan). Google OAuth still **501**.

See `docs/PHASE3_SIGN_OFF.md` (repo root docs).

## Layout

```
src/
  routes/         → /api/health + /v1/auth/*
  controllers/    → health + auth
  services/
  repositories/   → SqlClient (pool | Transaction)
  db/             → withTransaction
  auth/
  validation/
  middleware/     → requestId, requestLog, errorHandler, authz
  logging/        → JSON logger
  errors/
  http/
  types/
  config/         → env (SQL, JWT, LOG_LEVEL)
```

## Endpoints (current)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Liveness |
| POST | `/v1/auth/login` | 200 TokenPair |
| POST | `/v1/auth/refresh` | 200 TokenPair or 401 |
| POST | `/v1/auth/{register,forgot-password,reset-password,google}` | 501 stubs |

## Scripts

```bash
npm install
npm run dev
npm test
npm run build && npm start
```

Copy `.env.example` → `.env`. Set `JWT_*` and `LOG_LEVEL` as needed.
