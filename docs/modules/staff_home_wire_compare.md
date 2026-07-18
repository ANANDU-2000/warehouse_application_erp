# Staff `/staff/home` — WIRE compare (Step 5, scoped)

**Branch:** `ops/dashboard-module`  
**Sources:** `dashboard.md` §16 Staff home; `staff_home_providers.dart`; FastAPI `me.py`, `trade_purchase_service.get_trade_purchase_delivery_pipeline`, `stock_helpers` / `stock_ops` / `stock_audit`

## Status tracker

| Status | Item |
|---|---|
| **Completed (this step)** | Profile name; floor KPI counts; low-stock badge; attention tile counts + gates; thin backends for Flutter paths |
| **Current** | `/staff/home` WIRE scoped — PASS when smoke/build green |
| **Pending next** | `/staff/home` **STATES** (skeleton / FriendlyLoadError / empty copy) |
| **Deferred (WIRE-2)** | Pull-refresh |
| **Completed WIRE-2a** | Warehouse & Purchases stats — [`staff_home_wire2a_compare.md`](staff_home_wire2a_compare.md) |
| **Completed WIRE-2b** | Pending delivery cards — [`staff_home_wire2b_compare.md`](staff_home_wire2b_compare.md) |
| **Completed WIRE-2c** | Shift today strip — [`staff_home_wire2c_compare.md`](staff_home_wire2c_compare.md) |
| **Completed WIRE-2d** | Recent activity feed — [`staff_home_wire2d_compare.md`](staff_home_wire2d_compare.md) |
| **Completed WIRE-2e** | Bell unread badge — [`staff_home_wire2e_compare.md`](staff_home_wire2e_compare.md) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Display name | `GET /v1/me/profile` | same | PASS |
| 2 | Delivery pipeline | `…/trade-purchases/delivery-pipeline` | same + pending sum helper | PASS |
| 3 | Low stock count | `…/stock/list?status=low&per_page=8&sort=stock_asc` → items.length | same | PASS |
| 4 | Opening missing | `…/stock/opening/missing` → `missing_count` | same | PASS |
| 5 | Missing item_code | Flutter pages + client filter | `missing_item_code=true` → `total` (same FastAPI filter) | PASS |
| 6 | Variances today | `…/stock/variances/today` → length | same | PASS |
| 7 | Not `home-overview` | Staff never | No staff call | PASS |
| 8 | Floor labels | Pending / Delivered / Low stock | exact | PASS |
| 9 | Attention titles | Opening stock / Missing barcodes / Stock mismatch | exact | PASS |
| 10 | Focus gates | `staffHomeShows*` | same | PASS |
| 11 | Warehouse / pending cards / shift / activity / notif | Yes | WIRE-2a–2e PASS; pull-refresh deferred | N/A |
| 12 | Full error/Retry UX | Yes | Minimal message — **STATES** | N/A |

**Smoke:** `npm run test:staff-home-wire`  
**Rollback:** Revert WIRE commit; remove staffHome routes/repos; restore BUTTONS empty counts.  
**Next:** Staff WIRE-2e PASS — see [`staff_home_wire2e_compare.md`](staff_home_wire2e_compare.md). Ask before pull-refresh / Subagent 4.