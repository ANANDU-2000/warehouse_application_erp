# Database (Phase 2)

SQL Server DDL lives under [`ddl/`](ddl/).

## Tables (Phase 2.3)

| File | Contents |
|---|---|
| `ddl/00_schema.sql` | Header + `USE [dbo]` |
| `ddl/01_core.sql` … `06_ops_aux.sql` | **46** tables |

See `docs/26_SQL_Server_DDL.md`.

## Constraints (Phase 2.4)

`ddl/constraints/` — **103** FKs + **6** CHECKs. See `docs/27_SQL_Server_Constraints.md`.

## Indexes (Phase 2.5)

`ddl/indexes/` — **149** non-unique. See `docs/28_SQL_Server_Indexes.md`.

## Tenancy / RLS (Phase 2.6)

App-layer primary — `docs/29_RLS_Equivalent_Strategy.md`.

## Procs / views / triggers (Phase 2.7)

None required — `docs/30_Procs_Views_Triggers.md`.

## Migration apply / rollback (Phase 2.8)

| File | Role |
|---|---|
| `migrate/00_apply_order.txt` | Ordered file list |
| `migrate/Apply-Schema.ps1` | Dry-run by default; `-Server`/`-Database` to execute |
| `migrate/Rollback-Schema.ps1` | Indexes → constraints → tables |
| `migrate/92_drop_tables.sql` | Drop 46 tables |

Seed strategy (app-layer Phase 3) — `docs/31_Migration_Seed.md`.

## Schema verification (Phase 2.9)

Structural ORM vs DDL **PASS** — `docs/32_Schema_Verification.md`.

**Next:** Phase **2.10** sign-off.

Type mapping: `docs/25_SQL_Server_Type_Mapping.md`.
