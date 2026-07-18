# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3.9** — Structured JSON logging + HTTP access trail (`requestId`).  
Transactions → **3.10**. Google OAuth still **501**.

See `docs/41_Logging.md` (repo root docs).

## Layout

```
src/
  routes/         → /api/health + /v1/auth/*
  controllers/    → health + auth
  services/
  repositories/
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
