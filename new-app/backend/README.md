# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3.6** — Authorization middleware (`app.authz`: Bearer user, membership, role, permission).  
Validation (Zod) → **3.7**. Google OAuth still **501**.

See `docs/38_Authorization.md` (repo root docs).

## Layout

```
src/
  routes/         → /api/health + /v1/auth/*
  controllers/    → health + auth
  services/       → Login foundation + jwtTokens + permissions
  repositories/   → users / businesses / memberships
  auth/           → loginRequest + TokenIssuer
  middleware/     → requestId, errorHandler, authz (auth + membership)
  types/          → Express Request augmentation
  config/
```

## Endpoints (current)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Liveness |
| POST | `/v1/auth/login` | 200 TokenPair |
| POST | `/v1/auth/refresh` | 200 TokenPair or 401 |
| POST | `/v1/auth/{register,forgot-password,reset-password,google}` | 501 stubs |

Protected business routes are not mounted yet; use `createApp().authz` when adding `/v1/businesses/:businessId/...`.

## Scripts

```bash
npm install
npm run dev
npm test
npm run build && npm start
```

Copy `.env.example` → `.env`. Set `JWT_*` for production (no `change-me`; ≥32 chars).
