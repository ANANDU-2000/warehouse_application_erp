# 32 — Schema verification (Phase 2.9)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.9** — structural parity (not production data copy)  
**Sources:** ORM `source-app/backend/app/models/*.py`, `docs/20`, `docs/23`–`30`, `new-app/database/ddl/**`  
**Prerequisite:** Phase 2.8 migration orchestration  

---

## 1. Method

1. Enumerate ORM `__tablename__` + `Mapped[...]` attribute names (map `event_metadata` / `alert_metadata` → column `metadata`).  
2. Enumerate `CREATE TABLE` columns in `ddl/01`–`06`.  
3. Compare table sets and per-table column sets (exact names; no renames).  
4. Count FKs / CHECKs / indexes from constraint and index scripts; cross-check prior docs.  
5. Record intentional exceptions (partial indexes, PG-only drift).

---

## 2. PASS/FAIL matrix

| Check | Expected | Observed | Result |
|---|---|---|---|
| ORM table count | 46 | 46 | **PASS** |
| DDL table count | 46 | 46 | **PASS** |
| Tables only in ORM | none | none | **PASS** |
| Tables only in DDL | none | none | **PASS** |
| Columns: ORM missing in DDL | none | none | **PASS** |
| Columns: DDL extra vs ORM | none | none | **PASS** |
| FK `FOREIGN KEY` count | 103 (`docs/23`) | 103 | **PASS** |
| Soft UUID FKs | 0 | 0 (columns only) | **PASS** |
| CHECK constraints | 6 (`docs/27`) | 6 | **PASS** |
| Non-unique indexes | 149 (`docs/28`) | 149 | **PASS** |
| Procs / views / triggers required | 0 (`docs/30`) | 0 | **PASS** |
| Type mapping documented | `docs/25` | Present | **PASS** |

**Overall structural review:** **PASS** (with documented exceptions below — not silent failures).

---

## 3. Documented exceptions (PASS with exception)

| Item | Source | SQL Server Phase 2 | Disposition |
|---|---|---|---|
| `report_saved_views.is_pinned` | PG `051` | Absent ORM + DDL | Unknown — verify live PG before adding; do not invent |
| `ux_catalog_items_public_token` UNIQUE | PG `033` | Not in 2.3 UNIQUE | Gap — unique index on `public_token` not shipped; ORM has non-unique `index=True` only |
| Partial UNIQUE / filtered indexes | various `sql/*` | Skipped in 2.5 | Intentional — see `docs/28` |
| GIN / pg_trgm indexes | `optional_pg_trgm_indexes.sql` | Skipped | Intentional — no SQL Server equivalent |
| `cleanup_report_saved_views` function | PG `051` | No T-SQL proc | Intentional — Phase 3 job (`docs/30`) |
| Postgres RLS | `054` | App-layer strategy | Intentional — `docs/29` |
| Non-ORM tables in `schema_expected.json` (e.g. assistant_*) | legacy JSON | Not in 46 ORM tables | Out of Phase 2 scope — not in current models |

---

## 4. Legacy vs New (structural)

| Area | Legacy (Postgres / ORM) | New (SQL Server DDL) | Verdict |
|---|---|---|---|
| Core ORM tables | 46 models | 46 `CREATE TABLE` | PASS |
| Column names | ORM attributes (+ metadata rename) | Exact match | PASS |
| Relationships | 103 ORM FKs | 103 `ALTER` FKs | PASS |
| Soft links | 4 UUID cols no FK | Same | PASS |
| CHECKs (active PG) | 6 applicable to 46 tables | 6 | PASS |
| Indexes (non-unique btree) | ORM + full btree SQL | 149 | PASS |
| Business logic in DB | Essentially none (1 cleanup fn) | None required | PASS |

---

## 5. Rollback notes

Verification is documentation only. Schema rollback remains `migrate/Rollback-Schema.ps1` (`docs/31`).

---

## 6. Next

**Phase 2.10** — done: see `docs/PHASE2_SIGN_OFF.md`.

---

*Phase 2.9 complete — structural verification PASS; data migration not in scope.*
