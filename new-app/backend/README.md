# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3.4** — Login HTTP at `/v1/auth` (`POST /login` wired; other auth routes 501).  
JWT TokenIssuer → **3.5**. Validation (Zod) → **3.7**.

See `docs/36_Controllers_Routes.md` (repo root docs).

## Layout

```
src/
  routes/         → /api/health + /v1/auth/*
  controllers/    → health + auth
  services/       → Login foundation + health
  repositories/   → users / businesses / memberships
  auth/           → loginRequest parse + TokenIssuer port
  middleware/
  config/
```

## Endpoints (current)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Liveness |
| POST | `/v1/auth/login` | 401/403 gates; 503 until JWT (3.5) |
| POST | `/v1/auth/{register,forgot-password,reset-password,google,refresh}` | 501 stubs |

## Scripts

```bash
npm install
npm run dev
npm test
npm run build && npm start
```

Copy `.env.example` → `.env` and set `SQLSERVER_*` before `connect()` (tests mock the users repo).
