# Database (Phase 2)

SQL Server DDL lives under [`ddl/`](ddl/).

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

**Foreign keys:** deferred to Phase **2.4** (columns present as `UNIQUEIDENTIFIER`; no `REFERENCES` yet).  
**Indexes (non-unique):** deferred to Phase **2.5**.

Type mapping: `docs/25_SQL_Server_Type_Mapping.md`.
