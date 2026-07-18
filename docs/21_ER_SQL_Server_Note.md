# 21 — ER Diagram Note for SQL Server (Phase 2.1)

**Status:** PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.1**  
**Branch:** `phase2/type-mapping`

## Decision

Phase 1 relationship and ER docs remain the **source of truth** for entities and cardinalities. SQL Server design **does not rename tables or invent new relationships** in Phase 2.

| Artifact | Role |
|---|---|
| [`docs/23_Relationships.md`](23_Relationships.md) | 103 ORM FKs + 4 soft UUID logical links; cardinality |
| [`docs/24_ER_Diagram.md`](24_ER_Diagram.md) | Domain mermaid ER (Core / Catalog / Contacts / Trade / Stock / Ops-Aux) |
| [`docs/20_Database_Analysis.md`](20_Database_Analysis.md) | Column inventory (types refined in `25_SQL_Server_Type_Mapping.md`) |

## SQL Server implications

- Same 46 tables (ORM `__tablename__` set); same PK/FK graph as `23`.
- Soft UUID columns without `ForeignKey` (`notifications.related_*`, `stock_movements.source_id`) stay **logical links** — do not add FKs in DDL unless product later requires them.
- `ondelete` behavior from ORM (CASCADE / SET NULL / default) must be mirrored in T-SQL FK clauses during **2.3 DDL**.
- No Customers / Sales master tables (absent in source) — do not create them in SQL Server.

## Review

| Check | Status |
|---|---|
| Cite Phase 1 `23`/`24` as SSOT | PASS |
| No schema rename / no invented entities | PASS |
| Soft links called out | PASS |

**Verdict:** 2.1 **PASS**. Next: type mapping (`25`) then DDL (`2.3`).
