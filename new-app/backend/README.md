# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3.2** — `mssql` pool + core identity repositories (`users`, `businesses`, `memberships`).  
Service layer → **3.3**. Auth → **3.5**.

See `docs/34_Repository_Pattern.md` (repo root docs).

## Layout

```
src/
  routes/         → FastAPI routers
  controllers/    → thin HTTP adapters
  services/       → FastAPI services (business logic) — 3.3
  repositories/   → data access (users / businesses / memberships)
  middleware/
  config/         → env + mssql pool (connect / close / getPool)
```

## Scripts

```bash
npm install
npm run dev      # tsx watch
npm test         # vitest (mocked repos + health)
npm run build && npm start
```

Copy `.env.example` → `.env` and set `SQLSERVER_*` before calling `connect()` against a live server (optional; tests do not need live SQL).
