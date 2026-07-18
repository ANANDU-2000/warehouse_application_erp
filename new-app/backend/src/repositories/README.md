# Repositories (Phase 3.2)

SQL Server data access via [`mssql`](https://www.npmjs.com/package/mssql). Repositories return **typed row shapes** only — no business rules (Phase 3.3), no JWT (3.5).

## Core identity (Login foundation) — done

| Table | File | Methods |
|---|---|---|
| `users` | `users.repository.ts` | `findById`, `findByEmail` |
| `businesses` | `businesses.repository.ts` | `findById` |
| `memberships` | `memberships.repository.ts` | `listByUserId`, `findById`, `findByUserAndBusiness` |

Column names match `../../database/ddl/01_core.sql` — **no renames**.

## Tenancy (docs/29)

- `users` — global identity; no `business_id`.
- `businesses` / `memberships` — load by **explicit ids**; never silent cross-tenant list-all.
- Future tenant-table repos **must** accept `businessId` and filter `WHERE business_id = @businessId`.

## Deferred

Catalog, trade, stock, and remaining tables — add per module after Login gates. Do **not** invent empty stubs for all 46 tables.

## Pool

`src/config/database.ts`: `connect` / `close` / `getPool` / optional `ping`.

Inject `SqlClient` (`ConnectionPool` or `Transaction`) into repository constructors (tests mock the pool). Multi-table writes use `withTransaction` (Phase 3.10).
