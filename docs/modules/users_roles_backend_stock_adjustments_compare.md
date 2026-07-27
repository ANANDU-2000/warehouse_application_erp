# Users & Roles — Backend Slice 10 compare (`GET …/users/:userId/stock-adjustments`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`user_stock_adjustments`); `schemas/users.py` (`StockAdjustmentOut`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `GET …/stock-adjustments` | FastAPI | Same | PASS |
| 2 | Roles owner / manager / super_admin | Yes | Yes | PASS |
| 3 | **Admin excluded** (asymmetry) | Yes | 403 | PASS |
| 4 | No membership 404 (empty list OK) | Yes | Yes | PASS |
| 5 | `limit` default 50, range 1–200 | Yes | Shared parser | PASS |
| 6 | Filter business_id + updated_by | Yes | Same | PASS |
| 7 | LEFT JOIN catalog name; order updated_at DESC | Yes | Same | PASS |
| 8 | Shape id/item_id/item_name/old_qty/new_qty/type/reason/updated_at | Yes | Same | PASS |
| 9 | purchases / ledger / UI | Out of slice | See Slice 11 | N/A |

**Smoke:** `npx vitest run tests/users/` (70 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove stock-adjustments route + service + repo method; restore boards to Slice 1–9.

**Next:** Slice 11 purchases — [`users_roles_backend_purchases_compare.md`](users_roles_backend_purchases_compare.md).
