# Staff low stock `/staff/low-stock` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Satellite:** Subagent 4 — next after Staff purchase-history COMPARE (Inform owner target).  
**Sources:** `low_stock_dashboard_page.dart` (`LowStockDashboardPage(staffMode: true)`); `app_router.dart` `/staff/low-stock`; `inventory.md`; `05_Navigation_Map.md`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff purchase-history COMPARE · Staff low-stock SCAFFOLD → **LAYOUT** |
| 🟡 Current | `/staff/low-stock` **LAYOUT PASS** — ask before FIELDS |
| ⬜ Pending | FIELDS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | category tree data · Inform owner API · PDF/CSV · filter sheet · owner `/stock/low-stock` · purchase entry · barcode/print · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/staff/low-stock` | `LowStockDashboardPage(staffMode: true)` | `StaffLowStockPage` | PASS |
| 2 | AppBar title `Low stock` | exact | `STAFF_LS_TITLE` | PASS |
| 3 | Back pop → `/staff/home` fallback | AppBar leading | `popOrGo` + `STAFF_LS_BACK_FALLBACK` | PASS |
| 4 | Search hint | `Search item, subcategory, supplier…` | inert `readOnly` | PASS |
| 5 | Filter tune control | IconButton tooltip | inert `data-deferred="filter-sheet"` | PASS |
| 6 | Attention strip | `N need attention · Period follows Home` | `staffLsAttentionLine(0)` scaffold | PASS* |
| 7 | Segmented tabs All · Out · Bought · Pending · Delivery | `_LowStockSegmentedTabs` | `STAFF_LS_TAB_ORDER` + `(0)` | PASS |
| 8 | Optional `?filter=` aliases | `_tabIndexFromFilter` | `staffLsTabFromFilter` | PASS |
| 9 | Empty `No low-stock items here` | HexaEmptyState title | `STAFF_LS_EMPTY` | PASS |
| 10 | PDF / CSV AppBar actions | IconButtons when data | disabled slots `data-deferred` | PASS |
| 11 | Category tree / rows | `LowStockCategoryTree` | `data-deferred="category-tree"` | PASS |
| 12 | Staff Inform owner | notifyOwnerStockItem | `data-deferred="inform-owner"` | PASS |
| 13 | Typing / filter sheet / API / export / RefreshIndicator | Yes | **Deferred** FIELDS/BUTTONS/WIRE/STATES | N/A |
| 14 | Owner `/stock/low-stock` | same widget staffMode:false | **Separate** (still stub) | N/A |
| 15 | Owner-only Order now | `onOrderNow` null in staff | N/A staff | N/A |

\*Flutter shows search/tabs only after data; SCAFFOLD keeps chrome visible for layout parity — STATES will gate like Flutter.

**Smoke:** `npm run test:staff-low-stock-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore route → `DashboardRouteStubPage` title “Staff low stock”; remove `features/staff/lowStock/*` + this compare + script; boards → ask before low-stock SCAFFOLD.

**Next (ask first):** LAYOUT done — [`staff_low_stock_layout_compare.md`](staff_low_stock_layout_compare.md). Ask before FIELDS.
