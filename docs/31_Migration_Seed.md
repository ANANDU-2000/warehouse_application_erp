# 31 — Migration / seed scripts (Phase 2.8)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.8**  
**Prerequisite:** Phases 2.3–2.7 DDL, constraints, indexes, RLS strategy, procs audit  
**Branch tip context:** orchestration only — does not re-author Alembic / `sql/021+` history  

---

## 1. What “migration scripts” means here

| In scope | Out of scope |
|---|---|
| Ordered apply of existing `new-app/database/ddl/**` | Porting every Postgres hand SQL file 021–067 as T-SQL |
| Rollback orchestration | Live apply against production (docs/scripts only unless asked) |
| Document seed strategy | Inventing bulk catalog `INSERT` SQL |

---

## 2. Apply order

Listed in [`new-app/database/migrate/00_apply_order.txt`](../new-app/database/migrate/00_apply_order.txt):

1. Tables: `ddl/00_schema.sql` … `06_ops_aux.sql` (46 tables)  
2. Constraints: `ddl/constraints/10`–`16` (103 FKs + 6 CHECKs)  
3. Indexes: `ddl/indexes/20`–`25` (149 non-unique)

**Runner:** [`migrate/Apply-Schema.ps1`](../new-app/database/migrate/Apply-Schema.ps1)

```powershell
# Dry-run (default)
cd new-app/database/migrate
.\Apply-Schema.ps1

# Execute (when SQL Server + sqlcmd available)
.\Apply-Schema.ps1 -Server localhost -Database WarehouseErp -TrustedConnection
```

---

## 3. Rollback

| Step | Script |
|---|---|
| 1 Drop indexes | `ddl/indexes/91_drop_indexes.sql` |
| 2 Drop FK/CHECK | `ddl/constraints/90_drop_constraints.sql` |
| 3 Drop tables | `migrate/92_drop_tables.sql` (46 tables) |

**Runner:** [`migrate/Rollback-Schema.ps1`](../new-app/database/migrate/Rollback-Schema.ps1) (dry-run by default).

Prefer full DB restore for production-like environments.

---

## 4. Seed strategy

### 4.1 Not shipped as SQL in Phase 2.8

Source workspace/catalog seeding is **application-layer**:

| Source | Role |
|---|---|
| `source-app/backend/app/services/catalog_suppliers_seed.py` | Idempotent categories/products/suppliers from JSON |
| `source-app/backend/app/services/mandatory_workspace_seed.py` | Min demo broker/suppliers/categories/items |
| `source-app/data/files/*.json` / `backend/scripts/data/` | Seed JSON files |
| `backend/scripts/seed_*.py` | Ops scripts |

**Decision:** Port these in **Phase 3** (Node bootstrap / admin endpoint), not as T-SQL `INSERT` scripts in 2.8. Do not invent demo catalog SQL.

### 4.2 Global reference (`master_units`)

No `INSERT INTO master_units` found in `source-app/backend/sql`. Table exists for unit intelligence; population is app/script driven if used. **No SQL seed required** for 2.8 PASS.

### 4.3 Empty schema

After `Apply-Schema.ps1` execute, database has structure only (no businesses/users). Creating the first tenant remains Login/bootstrap (Phase 3+).

---

## 5. Deferred gaps (for Phase 2.9 verification)

| Gap | Notes |
|---|---|
| `report_saved_views.is_pinned` | PG `051`; absent ORM / 2.3 DDL — do not invent in 2.8 |
| `ux_catalog_items_public_token` | PG UNIQUE `033`; not in 2.3 UNIQUE list |
| Partial UNIQUE indexes | Skipped in 2.5 (documented) |

---

## 6. Verification

| Check | Result |
|---|---|
| Apply order file covers tables+constraints+indexes | PASS |
| Apply / Rollback scripts (dry-run default) | PASS |
| No invented catalog SQL seed | PASS |
| Review | **PASS** |

---

## 7. Next

**Phase 2.9** — done: see `docs/32_Schema_Verification.md`.

---

*Phase 2.8 complete — orchestration + seed strategy docs only.*
