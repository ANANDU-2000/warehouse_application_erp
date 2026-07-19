# Staff purchase history `/staff/purchase-history` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Satellite:** Subagent 4 — next stub after Staff stock COMPARE (Settings hub skipped — implement locked).  
**Sources:** `staff_purchase_history_page.dart` (`StaffPurchaseHistoryPage`); `app_router.dart` `/staff/purchase-history`; `purchase-orders.md` boundary; `05_Navigation_Map.md`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff stock COMPARE · Staff purchase-history SCAFFOLD · LAYOUT · **FIELDS** |
| 🟡 Current | `/staff/purchase-history` **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/purchase-history/:purchaseId` detail page · trade-purchases API · Inform owner · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/staff/purchase-history` | `StaffPurchaseHistoryPage` | `StaffPurchaseHistoryPage` | PASS |
| 2 | AppBar title `Purchase orders` | exact | `STAFF_PH_TITLE` | PASS |
| 3 | Back pop → `/staff/home` fallback | AppBar leading | `popOrGo` + `STAFF_PH_BACK_FALLBACK` | PASS |
| 4 | Tabs Today · Week · All time · Low stock | TabBar length 4 | `STAFF_PH_TAB_ORDER` + `data-slot="tabs"` | PASS |
| 5 | Optional `?tab=` aliases | TabController only | `staffPhTabFromQuery` (SPA) | PASS* |
| 6 | Search hint (purchase / low) | two hints | inert `readOnly` | PASS |
| 7 | Status chips All · Undelivered · Delivered | FilterChips | inert `data-slot="statusChips"` | PASS |
| 8 | Low chips All low · Critical | FilterChips | inert `data-slot="lowStockChips"` | PASS |
| 9 | Empty `No purchase orders in this period` | `_emptyMessage` | `STAFF_PH_EMPTY_PERIOD` | PASS |
| 10 | Empty low `No low stock items` | exact | `STAFF_PH_EMPTY_LOW` | PASS |
| 11 | Slot: list / purchase rows | StaffPurchaseHistoryRow | `data-deferred="purchase-rows"` | PASS |
| 12 | Detail `/staff/purchase-history/:id` | `StaffPurchaseOrderDetailPage` | **Stub** (separate page) | N/A |
| 13 | Typing / chip / tab / API / RefreshIndicator | Yes | **Deferred** FIELDS/BUTTONS/WIRE/STATES | N/A |
| 14 | Low stock count in tab label | `Low stock (N)` | **Deferred** WIRE | N/A |
| 15 | Settings first in staff nest | Listed | **Skipped** — implement locked | N/A |

\*Flutter has no URL tab param; SPA aliases only for deep-link convenience.

**Smoke:** `npm run test:staff-purchase-history-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore list route → `DashboardRouteStubPage` title “Purchase history”; remove `features/staff/purchaseHistory/*` + this compare + script; boards → ask before purchase-history SCAFFOLD.

**Next (ask first):** FIELDS done — [`staff_purchase_history_fields_compare.md`](staff_purchase_history_fields_compare.md). Ask before BUTTONS.
