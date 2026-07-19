# Staff deliveries `/staff/deliveries` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Satellite:** Subagent 4 — next after Staff activity COMPARE.  
**Sources:** `staff_pending_deliveries_page.dart` (`StaffPendingDeliveriesPage`); `app_router.dart` `/staff/deliveries`; `goods-receipt.md`; `05_Navigation_Map.md`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff activity COMPARE · Staff deliveries **SCAFFOLD** |
| 🟡 Current | superseded — see [`staff_deliveries_layout_compare.md`](staff_deliveries_layout_compare.md) |
| ⬜ Pending | FIELDS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | back/scan handlers · trade-purchases grouping · ListSkeleton / FriendlyLoadError · receive body · barcode · purchase entry · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/staff/deliveries` | `StaffPendingDeliveriesPage` | `StaffDeliveriesPage` | PASS |
| 2 | AppBar title `Pending deliveries` | exact (or with count) | `STAFF_DEL_TITLE` | PASS |
| 3 | Scan purchase AppBar action | `Icons.qr_code_scanner` → `/barcode/scan` | `data-deferred="scan-barcode"` | PASS |
| 4 | Section Dispatched | exact + empty copy | slots | PASS |
| 5 | Section Arrived | exact + empty + highlight flag | slots | PASS |
| 6 | Section Pending verification | exact + empty copy | slots | PASS |
| 7 | Global empty | `No pending deliveries right now.` | `STAFF_DEL_EMPTY_ALL` | PASS |
| 8 | Sample rows deferred | ListTile | `data-deferred="delivery-rows"` | PASS |
| 9 | Back / scan / row onTap | Yes | **Deferred** BUTTONS (receive/barcode blocked) | N/A |
| 10 | `staffTradePurchasesForAlerts` / sections | Yes | **Deferred** WIRE | N/A |
| 11 | ListSkeleton / FriendlyLoadError | Yes | **Deferred** STATES | N/A |
| 12 | Purchase entry / barcode / receive body | — | **Backend blocked** (docs/06) | N/A |

**Smoke:** `npm run test:staff-deliveries-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore route → `DashboardRouteStubPage` title “Staff deliveries”; remove `features/staff/deliveries/*` + this compare + script; boards → ask before deliveries SCAFFOLD.

**Next (ask first):** LAYOUT — do not start until approved.
