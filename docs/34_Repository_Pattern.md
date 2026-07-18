# 34 — Repository pattern (Phase 3.2)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 3 task **3.2**  
**Location:** `new-app/backend/src/repositories/` + `src/config/database.ts`  
**Driver:** [`mssql`](https://www.npmjs.com/package/mssql) (Tedious)  
**DDL source:** `new-app/database/ddl/01_core.sql`  

---

## 1. Purpose

Wire a SQL Server connection pool and establish the repository pattern with **core identity** repositories only (`users`, `businesses`, `memberships`) as the Login-ready foundation. No auth/JWT (3.5), no service business logic (3.3), no Express Login routes (3.4).

---

## 2. Pattern rules

| Rule | Detail |
|---|---|
| Layer | routes → controllers → services → **repositories** → SQL Server |
| Repos return | Typed row shapes (`UserRow`, `BusinessRow`, `MembershipRow`) — raw columns only |
| No business rules | Password verify, active/blocked checks, role logic → **3.3 / 3.5** |
| Column names | Match DDL / ORM exactly — **no renames** |
| Queries | Parameterized only (`@id`, `@email`, …) via `sql.ts` helpers |
| Pool injection | Repositories take `ConnectionPool` in constructor (tests mock pool) |
| Scope | Core identity aggregate only — **do not** stub all 46 tables |

---

## 3. Pool API (`src/config/database.ts`)

| Function | Behavior |
|---|---|
| `connect()` | Creates/connects `mssql` `ConnectionPool`; requires credentials |
| `close()` | Closes pool |
| `getPool()` | Returns connected pool or throws |
| `ping()` | Optional `SELECT 1` when already connected |
| `hasDatabaseCredentials()` | Host + database + user + non-empty password |

Live SQL Server is **not** required for Phase 3.2 PASS — unit tests mock the pool.

---

## 4. Repositories delivered

| Table | File | Methods | Tenancy |
|---|---|---|---|
| `users` | `users.repository.ts` | `findById`, `findByEmail` | Global identity — no `business_id` |
| `businesses` | `businesses.repository.ts` | `findById` | Explicit id only — no list-all |
| `memberships` | `memberships.repository.ts` | `listByUserId`, `findById`, `findByUserAndBusiness` | Has `business_id`; `findByUserAndBusiness` filters both ids |

### Types

`src/repositories/types.ts` — columns from:

```27:67:new-app/database/ddl/01_core.sql
CREATE TABLE users (
    id                      UNIQUEIDENTIFIER NOT NULL,
    email                   NVARCHAR(320)    NOT NULL,
    ...
);
...
CREATE TABLE memberships (
    id               UNIQUEIDENTIFIER NOT NULL,
    user_id          UNIQUEIDENTIFIER NOT NULL,
    business_id      UNIQUEIDENTIFIER NOT NULL,
    ...
);
```

### Tenancy (docs/29)

Future tenant-table repositories **must** accept `businessId` and include `WHERE business_id = @businessId`. Silent cross-tenant reads are forbidden.

---

## 5. Deferred (not in 3.2)

| Item | Phase |
|---|---|
| Catalog / trade / stock repos | Per module after Login |
| Service ports from FastAPI | **3.3** |
| Express Login routers | **3.4** |
| JWT / password verify | **3.5** |

---

## 6. How 3.3 consumes repos

Services will:

1. Call `connect()` at process start (or use injected pool).
2. Construct `UsersRepository` / `BusinessesRepository` / `MembershipsRepository`.
3. Apply business rules on returned rows (active, blocked, deleted, role, etc.) — **not** inside repos.

---

## 7. Tests

| Suite | Coverage |
|---|---|
| `tests/repositories/users.repository.test.ts` | `findById`, `findByEmail` (mocked pool) |
| `tests/repositories/businesses.repository.test.ts` | `findById` |
| `tests/repositories/memberships.repository.test.ts` | `listByUserId`, `findByUserAndBusiness` |
| `tests/repositories/database.test.ts` | config helpers / getPool guard |
| `tests/health.test.ts` | Existing health smoke |

```bash
cd new-app/backend && npm test && npm run build
```

---

## 8. Review PASS/FAIL (Legacy vs New)

| Check | Legacy / source | New | Result |
|---|---|---|---|
| `users` columns | ORM / `01_core.sql` | `UserRow` + SELECT list | PASS |
| `businesses` columns | ORM / `01_core.sql` | `BusinessRow` + SELECT list | PASS |
| `memberships` columns | ORM / `01_core.sql` | `MembershipRow` + SELECT list | PASS |
| Parameterized queries | SQLAlchemy binds | `@params` via mssql | PASS |
| Tenancy intent (docs/29) | App-layer `business_id` | Explicit ids; documented for future repos | PASS |
| No invented columns | — | Core identity only | PASS |
| No auth/JWT in repos | FastAPI auth separate | Deferred 3.5 | PASS |
| Unit tests without live DB | — | Mocked pool | PASS |

**Verdict: PASS**

---

## 9. Rollback notes

1. Revert commit(s) on `phase3/repositories` (or delete branch).
2. Remove `mssql` / `@types/mssql` from `package.json` if rolling back dependency.
3. Restore `database.ts` stub from Phase 3.1 if needed.
4. Set checklist **3.2 → ⬜**, **3.3 → 🔒**.
5. No production schema changes in this phase (repos are read-only app code).

---

## 10. Checklist impact

- **3.2** → ✅  
- **3.3** Service layer → unlocked ⬜  
