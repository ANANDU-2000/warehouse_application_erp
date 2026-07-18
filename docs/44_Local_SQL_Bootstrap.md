# 44 — Local SQL Server bootstrap

**Status:** Review PASS (2026-07-18)  
**Branch:** `ops/local-sql-bootstrap`  
**Purpose:** Apply `new-app/database` DDL to local SQL Server, wire backend pool, prove live smoke via `GET /api/health`.

---

## 1. Exact env names

From [`new-app/backend/.env.example`](../new-app/backend/.env.example):

| Variable | Local dev |
|---|---|
| `SQLSERVER_HOST` | `localhost` |
| `SQLSERVER_PORT` | `1433` |
| `SQLSERVER_DATABASE` | `WarehouseErp` |
| `SQLSERVER_USER` | `warehouse_dev` |
| `SQLSERVER_PASSWORD` | *(SQL login — never commit; `.env` gitignored)* |
| `SQLSERVER_ENCRYPT` | `true` |
| `SQLSERVER_TRUST_SERVER_CERTIFICATE` | `true` |

---

## 2. Verify gate (hard)

```sql
USE WarehouseErp;
SELECT COUNT(*) AS table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
-- expect 46
SELECT COUNT(*) AS fk_count FROM sys.foreign_keys;
-- expect 103
```

Also expect **6** CHECK constraints and **149** nonclustered indexes after full apply.

**Verified locally (2026-07-18):** `table_count=46`, `fk_count=103`, indexes=149.  
**Smoke:** `GET /api/health` → `databaseConnected: true` (msnodesqlv8 + ODBC Driver 18).

---

## 3. Apply notes

- [`ddl/00_schema.sql`](../new-app/database/ddl/00_schema.sql) must **not** `USE [dbo]` (dbo is a schema). Fixed in this branch; connect with `-d WarehouseErp`.
- `sqlcmd` may be missing from PATH — apply via `Apply-Schema.ps1` when available, or execute files in [`00_apply_order.txt`](../new-app/database/migrate/00_apply_order.txt) order.
- SQL Server rejects some `ON DELETE SET NULL` / `CASCADE` pairs as **multiple cascade paths**. Local apply used **`ON DELETE NO ACTION`** fallback for:
  - `FK_users_created_by`
  - `FK_catalog_items_updated_by_user_id`
  - `FK_stock_dispute_cases_resolved_by`
  - `FK_staff_purchase_logs_stock_movement_id`
  - `FK_notifications_triggered_by_user_id`  
  Documented intentional SQL Server adaptation vs ORM cascade intent — parent delete no longer auto-clears these FKs.
- Mixed mode: `LoginMode=2` required for `warehouse_dev` SQL auth; **restart** `MSSQLSERVER` after enabling.

---

## 4. Backend bootstrap

[`src/index.ts`](../new-app/backend/src/index.ts):

- If `SQLSERVER_USER` + `SQLSERVER_PASSWORD` set → `connect()` → inject real users/memberships/businesses repos.
- Else → fail-closed stubs (tests / no `.env`).

**Driver:** On Windows, default is **`msnodesqlv8`** (ODBC Driver 18 connection string) so Node works even when SQL Server TCP/IP is disabled (shared memory / local). Use `SQLSERVER_DRIVER=tedious` when TCP port 1433 is enabled. Optional `SQLSERVER_ODBC_DRIVER` overrides the ODBC driver name.

Health [`GET /api/health`](../new-app/backend/src/routes/health.routes.ts):

| Field | Meaning |
|---|---|
| `databaseConfigured` | host + database env present |
| `databaseConnected` | live `SELECT 1` on connected pool |

Smoke expect: `status: "ok"` and `databaseConnected: true`.

---

## 5. Operator smoke

```powershell
cd new-app/backend
# .env already filled locally (not in git)
npm install
npm run dev
# curl http://localhost:3000/api/health
```

---

## 6. Review PASS/FAIL

| Check | Expected | Result |
|---|---|---|
| Tables | 46 | PASS |
| FKs | 103 | PASS |
| Indexes | 149 | PASS |
| Env names | SQLSERVER_* | PASS |
| Pool wired in `index.ts` | connect + repos | PASS |
| Health live ping | `databaseConnected` | PASS |
| `.env` not committed | gitignore | PASS |

**Verdict: PASS**

---

## 7. Rollback

1. Revert `ops/local-sql-bootstrap`.
2. Delete local `.env`.
3. Optional: `DROP DATABASE WarehouseErp` and recreate.

---

## 8. Checklist impact

- Local SQL bootstrap documented; next Login E2E **L2** (or Phase 4.1) when ready.
