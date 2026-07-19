# Users & Roles — Backend Slice 12 compare (`GET …/users/:userId/ledger`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`user_ledger`); `schemas/users.py` (`LedgerEntryOut`, `LedgerGroupedOut`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `GET …/ledger` | FastAPI | Same | PASS |
| 2 | Roles owner/admin/manager/super_admin | Yes | Yes | PASS |
| 3 | No membership 404 | Yes | Yes | PASS |
| 4 | `limit` default 80, range 1–200 | Yes | `parseLedgerLimit` | PASS |
| 5 | `grouped` bool Query default false | Yes | `parseGroupedQuery` | PASS |
| 6 | Activity entries kind/title/subtitle/details | Yes | Same | PASS |
| 7 | Stock entries kind=stock title=STOCK_UPDATE | Yes | Same | PASS |
| 8 | Merge sort by at desc; trim to limit | Yes | `buildLedgerEntries` | PASS |
| 9 | Flat → array; grouped → today/yesterday/this_week | Yes | Same | PASS |
| 10 | Older than week_start dropped when grouped | Yes | Same | PASS |
| 11 | Users UI / bulk / active-sessions | Out of slice | See Slice 13 | N/A |

**Smoke:** `npx vitest run tests/users/` (89 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove ledger route + service + activity list method; restore boards to Slice 1–11.

**Next:** Slice 13 active-sessions — [`users_roles_backend_active_sessions_compare.md`](users_roles_backend_active_sessions_compare.md).
