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

**46 tables** total. See `docs/26_SQL_Server_DDL.md`.

## Constraints (Phase 2.4)

| File | Contents |
|---|---|
| `ddl/constraints/10_fk_core.sql` … `15_fk_ops_aux.sql` | **103** ORM FKs from `docs/23` |
| `ddl/constraints/16_check.sql` | **6** CHECKs from latest Postgres SQL |
| `ddl/constraints/90_drop_constraints.sql` | Rollback DROP CONSTRAINT |

See `docs/27_SQL_Server_Constraints.md`. Soft UUID columns remain without FK.

**Indexes (non-unique):** deferred to Phase **2.5**.  
**RLS:** deferred to Phase **2.6**.

Type mapping: `docs/25_SQL_Server_Type_Mapping.md`.
