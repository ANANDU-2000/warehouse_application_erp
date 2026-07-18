# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3.8** — Error middleware returns `{ detail }` and maps domain throws.  
Logging → **3.9**. Google OAuth still **501**.

See `docs/40_Error_Handling.md` (repo root docs).

## Layout

```
src/
  routes/         → /api/health + /v1/auth/*
  controllers/    → health + auth
  services/       → Login foundation + jwtTokens + permissions
  repositories/   → users / businesses / memberships
  auth/           → loginRequest + TokenIssuer
  validation/     → Zod schemas
  middleware/     → requestId, errorHandler ({ detail }), authz
  errors/         → HttpError
  http/           → sendDetail
  types/
  config/
```

## Endpoints (current)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Liveness |
| POST | `/v1/auth/login` | Zod body; 200 TokenPair |
| POST | `/v1/auth/refresh` | Zod body; 200 TokenPair or 401 |
| POST | `/v1/auth/{register,forgot-password,reset-password,google}` | 501 stubs |

## Scripts

```bash
npm install
npm run dev
npm test
npm run build && npm start
```

Copy `.env.example` → `.env`. Set `JWT_*` for production (no `change-me`; ≥32 chars).
