# 33 — Backend structure (Phase 3.1)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 3 task **3.1**  
**Location:** `new-app/backend/`  
**Stack:** Node 20+, Express, TypeScript (strict), CommonJS + `tsc`, Vitest  

---

## 1. Purpose

Scaffold Clean Architecture layers for the Node/Express API. Prove the process boots with **`GET /api/health` only**. No domain modules (Login, catalog, etc.) yet.

---

## 2. Layer map (legacy → new)

| New layer | Role | FastAPI analogue |
|---|---|---|
| `src/routes/` | Mount paths, wire controllers | `app/routers/*.py` |
| `src/controllers/` | HTTP in/out only | Thin router handlers |
| `src/services/` | Business logic | `app/services/*.py` |
| `src/repositories/` | SQL Server data access | SQLAlchemy session queries |
| `src/middleware/` | Cross-cutting | FastAPI deps / middleware |
| `src/config/` | Env + DB config stub | `app/config.py` |

**Rule:** routes → controllers → services → repositories. Controllers must not contain SQL.

---

## 3. Layout created

```
new-app/backend/
  package.json
  tsconfig.json
  vitest.config.ts
  .env.example
  src/
    index.ts
    app.ts
    config/env.ts
    config/database.ts      # stub until 3.2
    middleware/requestId.ts
    middleware/errorHandler.ts   # stub until 3.8
    routes/index.ts
    routes/health.routes.ts
    controllers/health.controller.ts
    services/health.service.ts
    repositories/README.md       # filled in 3.2
    types/
    utils/
  tests/health.test.ts
```

Aligns with coding rules (`routes → controllers → services → repositories`).  
[`new-app/docs/TARGET_STRUCTURE.md`](../new-app/docs/TARGET_STRUCTURE.md) updated to note flat layers for Phase 3.1 (feature `modules/auth/` folders appear when implementing Login after 3.2+).

---

## 4. Endpoints in 3.1

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Smoke / liveness |

---

## 5. Explicitly deferred

| Item | Phase |
|---|---|
| `mssql` pool + table repositories | **3.2** |
| Service business logic ports | **3.3** |
| Express routers matching `18_API_Inventory.md` | **3.4** |
| JWT / Google OAuth | **3.5** |
| Role + `permissions_json` + business scoping | **3.6** |
| Zod validation | **3.7** |
| Full error middleware | **3.8** |
| Logging | **3.9** |
| Multi-table transactions | **3.10** |

---

## 6. Verification

| Check | Result |
|---|---|
| `npm test` (Vitest health smoke) | PASS |
| `npm run build` (`tsc`) | PASS |
| No Login / domain repos | PASS |
| Review | **PASS** |

---

## 7. Rollback notes

Remove `new-app/backend/` package (keep `new-app/database/`). No schema changes in 3.1.

---

## 8. Next

**Phase 3.2** — Repository pattern per table/aggregate + SQL Server client.

---

*Phase 3.1 complete — scaffold only; stop before feature APIs.*
