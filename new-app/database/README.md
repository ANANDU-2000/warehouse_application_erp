# Database (Phase 2)

SQL Server DDL lives under [`ddl/`](ddl/).

## Tables (Phase 2.3)

| File | Contents |
|---|---|
| `ddl/00_schema.sql` | Header + `USE [dbo]` |
| `ddl/01_core.sql` | businesses, users, memberships, sessions, tokens, admin/usage/webhook logs, business_goals |
| `ddl/02_catalog.sql` | categories, catalog items/variants/defaults, units & packaging intelligence |
| `ddl/03_contacts.sql` | brokers, suppliers, broker_supplier_m2m |
| `ddl/04_trade.sql` | trade purchases/lines/drafts, lifecycle events, damage reports |
| `ddl/05_stock.sql` | stock movements, adjustments, counts, audits, disputes, reorder, staff purchase logs |
| `ddl/06_ops_aux.sql` | notifications, report views, activity, daily usage, checklists |

**46 tables** — `docs/26_SQL_Server_DDL.md`.

## Constraints (Phase 2.4)

| File | Contents |
|---|---|
| `ddl/constraints/10_fk_*.sql` … `15_fk_*.sql` | **103** ORM FKs |
| `ddl/constraints/16_check.sql` | **6** CHECKs |
| `ddl/constraints/90_drop_constraints.sql` | Rollback |

See `docs/27_SQL_Server_Constraints.md`.

## Indexes (Phase 2.5)

| File | Contents |
|---|---|
| `ddl/indexes/20_ix_core.sql` … `25_ix_ops_aux.sql` | **149** non-unique indexes |
| `ddl/indexes/91_drop_indexes.sql` | Rollback |

See `docs/28_SQL_Server_Indexes.md`.

## Tenancy / RLS (Phase 2.6)

**Strategy:** app-layer `business_id` scoping in Node (Phase 3) — primary equivalent of Postgres `054` RLS.  
**No** `CREATE SECURITY POLICY` scripts yet (optional later).  
See `docs/29_RLS_Equivalent_Strategy.md`.

**Next:** Phase **2.7** — procs/views/triggers only if source requires.

Type mapping: `docs/25_SQL_Server_Type_Mapping.md`.
