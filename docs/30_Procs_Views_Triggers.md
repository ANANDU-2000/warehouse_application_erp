# 30 — Stored procedures / views / triggers (Phase 2.7)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.7** — *only if source DB logic requires them*  
**Sources scanned:**  
- `source-app/backend/sql/**/*.sql`  
- `source-app/backend/alembic/**/*.py`  
**Cross-check:** no call sites under `source-app/backend/app/` for the single function found  

---

## 1. Scan method

Case-insensitive search for:

- `CREATE [OR REPLACE] FUNCTION|PROCEDURE|TRIGGER|VIEW`
- `RETURNS TRIGGER`

Executed against `backend/sql` and `backend/alembic` on branch tip after Phase 2.6.

---

## 2. Inventory results

| Object type | Count | Result |
|---|---:|---|
| `CREATE TRIGGER` | **0** | None |
| `CREATE VIEW` | **0** | None |
| `CREATE PROCEDURE` | **0** | None |
| `CREATE FUNCTION` | **1** | See §3 |

**Verdict for SQL Server parity:** **No required** stored procedures, views, or triggers to ship under `new-app/database/` for Phase 2.7.

Business rules and multi-table writes live in FastAPI services (→ Phase 3 Node services), consistent with Phase 1 module analyses.

---

## 3. Sole function — disposition

### 3.1 Definition

**Name:** `cleanup_report_saved_views(retention interval DEFAULT interval '1 year')`  
**Source:** [`source-app/backend/sql/051_delivery_discrepancy_and_lifecycle.sql`](../source-app/backend/sql/051_delivery_discrepancy_and_lifecycle.sql) (lines ~233–246)  
**Alembic:** upgrade runs the SQL file; downgrade `DROP FUNCTION IF EXISTS cleanup_report_saved_views(interval)`  

**Behavior:**

```sql
DELETE FROM report_saved_views
WHERE created_at < now() - retention
  AND COALESCE(is_pinned, false) = false;
-- returns deleted row count (bigint)
```

### 3.2 App usage

| Check | Result |
|---|---|
| Called from `backend/app/` | **None found** |
| Role | Maintenance / ops helper, not request-path business logic |

### 3.3 Phase 2.7 decision

| Option | Choice |
|---|---|
| Emit SQL Server `CREATE PROCEDURE` in 2.7 | **No** |
| Disposition | Document only → optional **Phase 3** scheduled job or admin endpoint that runs the equivalent `DELETE` in Node |
| Do not invent | No cron DDL, no agent job wiring in this phase |

### 3.4 Related schema drift (`is_pinned`)

Same `051` script adds:

```sql
ALTER TABLE report_saved_views
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;
```

| Layer | `is_pinned` present? |
|---|---|
| Postgres SQL `051` | Yes |
| ORM `report_saved_view.py` | **No** |
| Phase 2.3 DDL `06_ops_aux.sql` | **No** |

**Unknown — needs verification** before adding to SQL Server DDL: whether production DBs still have `is_pinned` and whether any client uses it.  
**Phase 2.7 action:** do **not** invent the column. Flag for **2.8/2.9** schema alignment if confirmed.

---

## 4. What was *not* found (explicit)

- No trigger-based stock updates, audit trails, or cascade alternatives beyond ORM/FK `ON DELETE` already covered in Phase 2.4  
- No reporting views — reports are API/service queries (see `docs/modules/reports.md`)  
- No SQL Server-style stored-proc API surface in the legacy stack  

---

## 5. Rollback notes

Phase 2.7 is **documentation only** — nothing to drop in SQL Server.  
If a cleanup job is added in Phase 3, remove that job/endpoint; no DB proc dependency.

---

## 6. Verification

| Check | Result |
|---|---|
| `sql/` + `alembic/` scanned | PASS |
| Triggers / views / procedures required | **0** |
| Single function disposition documented | PASS |
| No invented T-SQL objects | PASS |
| Review | **PASS** |

---

## 7. Next

**Phase 2.8** — done: see `docs/31_Migration_Seed.md`.

---

*Phase 2.7 complete — audit only; no procs/views/triggers DDL shipped.*
