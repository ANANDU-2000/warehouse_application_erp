# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3 platform COMPLETE** — see `docs/PHASE3_SIGN_OFF.md`.  
Login E2E **L1 PASS** — `GET /v1/me/businesses` (`docs/43_Me_Businesses.md`). Next: **L2** login DB commit. Google OAuth still **501**.

See `docs/43_Me_Businesses.md` (repo root docs).

## Layout

```
src/
  routes/         → /api/health + /v1/auth/* + /v1/me/*
  controllers/    → health + auth + me
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
| GET | `/v1/me/businesses` | Bearer → `BusinessBrief[]` |

## Scripts

```bash
npm install
npm run dev
npm test
npm run build && npm start
```

Copy `.env.example` → `.env`. Set `JWT_*` and `LOG_LEVEL` as needed.
