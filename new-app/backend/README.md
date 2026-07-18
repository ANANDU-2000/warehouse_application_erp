# Backend (Phase 3)

Node.js + Express + TypeScript API for the warehouse ERP migration.

## Status

**Phase 3.1** — folder structure + `GET /api/health` only.  
Repositories / SQL Server pool → **3.2**. Auth → **3.5**.

## Layout

```
src/
  routes/         → FastAPI routers
  controllers/    → thin HTTP adapters
  services/       → FastAPI services (business logic)
  repositories/   → data access (Phase 3.2+)
  middleware/
  config/
```

See `docs/33_Backend_Structure.md` (repo root docs).

## Scripts

```bash
npm install
npm run dev      # tsx watch
npm test         # vitest smoke
npm run build && npm start
```

Copy `.env.example` → `.env` before connecting to SQL Server (3.2).
