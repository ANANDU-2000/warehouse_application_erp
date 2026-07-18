# new-app (target)

Target stack: **React + TypeScript** frontend, **Node.js + Express + TypeScript** backend, **Microsoft SQL Server**.

## Status

| Area | Status |
|---|---|
| Database (Phase 2) | **COMPLETE** — `database/`, `docs/PHASE2_SIGN_OFF.md` |
| Backend (Phase 3.1) | **Scaffold** — `backend/` health only; see `docs/33_Backend_Structure.md` |
| Frontend (Phase 4) | Locked |

## Backend quick start

```bash
cd backend
npm install
npm test
npm run dev
# GET http://localhost:3000/api/health
```

## Rules

- Source of truth remains `../source-app/` until a module is migrated.
- Never edit `source-app/`.
- One module at a time after Analyze → Review → Implement → Test → Compare → Stop.
- Layout: [docs/TARGET_STRUCTURE.md](docs/TARGET_STRUCTURE.md).
