# Users & Roles — Backend Slice 9 compare (`GET …/users/:userId/created-items`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`user_created_items`); `schemas/users.py` (`CreatedItemOut`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `GET …/created-items` | FastAPI | Same | PASS |
| 2 | Roles include manager | Yes | Yes | PASS |
| 3 | No membership 404 (empty list OK) | Yes | Yes | PASS |
| 4 | `limit` default 50, range 1–200 | Yes | `parseCreatedItemsLimit` | PASS |
| 5 | Filter business + created_by + deleted_at null | Yes | Same SQL | PASS |
| 6 | Order created_at DESC + TOP limit | Yes | Same | PASS |
| 7 | `barcode` ← `item_code`; category name; reorder_level | Yes | Same | PASS |
| 8 | `updated_at` ← last_stock_updated_at OR created_at | Yes | COALESCE | PASS |
| 9 | stock-adjustments / UI | Out of slice | See Slice 10 | N/A |

**Smoke:** `npx vitest run tests/users/` (63 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove created-items route + service + repo method; restore boards to Slice 1–8.

**Next:** Slice 10 stock-adjustments — [`users_roles_backend_stock_adjustments_compare.md`](users_roles_backend_stock_adjustments_compare.md).
