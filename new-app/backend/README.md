# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3.3** — Login-foundation services (`authLogin`, `passwords`, `permissions`, `accountEligibility`) on identity repos.  
Controllers/routes → **3.4**. Auth (JWT) → **3.5**.

See `docs/35_Service_Layer.md` (repo root docs).

## Layout

```
src/
  routes/         → FastAPI routers (3.4+)
  controllers/    → thin HTTP adapters (3.4+)
  services/       → business logic (Login foundation + health)
  repositories/   → data access (users / businesses / memberships)
  middleware/
  config/         → env + mssql pool
```

## Scripts

```bash
npm install
npm run dev      # tsx watch
npm test         # vitest (repos + services + health)
npm run build && npm start
```

Copy `.env.example` → `.env` and set `SQLSERVER_*` before calling `connect()` against a live server (optional; tests do not need live SQL).
