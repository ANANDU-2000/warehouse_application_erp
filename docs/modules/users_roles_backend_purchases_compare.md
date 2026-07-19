# Users & Roles — Backend Slice 11 compare (`GET …/users/:userId/purchases`)

**Branch:** `ops/dashboard-module`  
**Sources:** `source-app/backend/app/routers/users.py` (`user_purchases`); `schemas/users.py` (`UserPurchaseBrief`)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Path `GET …/purchases` | FastAPI | Same | PASS |
| 2 | Roles owner/admin/manager/super_admin | Yes | Yes | PASS |
| 3 | No membership 404 (empty list OK) | Yes | Yes | PASS |
| 4 | `limit` default 50, range 1–**100** | Yes | `parseUsersListLimit50to100` | PASS |
| 5 | Filter business_id + user_id; order created_at DESC | Yes | Same | PASS |
| 6 | LEFT JOIN supplier name | Yes | Same | PASS |
| 7 | item_count = COUNT trade_purchase_lines | Yes | Subquery | PASS |
| 8 | purchase_date date → UTC midnight; else created_at | Yes | `normalizePurchaseDate` | PASS |
| 9 | Shape id/human_id/purchase_date/status/total_amount/supplier_name/item_count | Yes | Same | PASS |
| 10 | ledger / UI | Out of slice | Not added | N/A |

**Smoke:** `npx vitest run tests/users/` (80 PASS); `tsc --noEmit` PASS.

**Rollback:** Revert this commit; remove purchases route + service + repo method; restore boards to Slice 1–10.

**Next (ask first):** ledger · Users UI · Subagent 4.
