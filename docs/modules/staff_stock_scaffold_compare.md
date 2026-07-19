# Staff stock `/staff/stock` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Satellite:** Subagent 4 — next unlockable stub after Staff items COMPARE (Settings hub skipped — implement locked).  
**Sources:** `stock_page.dart` `StockPage(mode: StockPageMode.staff)`; `stock_operational_top_bar.dart`; `app_router.dart` `/staff/stock` + `changes` redirect; `inventory.md`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications COMPARE · Staff search COMPARE · Staff items SCAFFOLD→COMPARE · Staff stock **SCAFFOLD** |
| 🟡 Current | Staff stock **SCAFFOLD PASS** — ask before LAYOUT |
| ⬜ Pending | Staff stock LAYOUT → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings` (implement locked); owner `/stock`; listStock / Activity feed (WIRE); export PDF/Excel (staff null in legacy) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/staff/stock` | `StockPage(staff)` | `StaffStockPage` | PASS |
| 2 | Redirect `/staff/stock/changes` → `?tab=changes` | GoRoute redirect | `Navigate` replace | PASS |
| 3 | AppBar title `Stock` | `StockOperationalTopBar` | `STAFF_STOCK_TITLE` + `data-slot="appBar"` | PASS |
| 4 | Back → `/staff/home` | `context.go('/staff/home')` | same | PASS |
| 5 | Tabs `Stock` · `Activity` | TabBar | `STAFF_STOCK_TAB_ORDER` + `data-slot="tabs"` | PASS |
| 6 | `?tab=` aliases (`changes`, `movement`, `today`, `activity`) | `_tabIndex` | `staffStockTabFromQuery` | PASS |
| 7 | Status chips All · Low · Out | `StockStatusQuickChips` | inert labels + `data-slot="statusChips"` | PASS |
| 8 | `?status=` map (`out`, `low`/`shortage`→shortage, `all`) | `_mapRouteStatus` | `staffStockStatusFromQuery` | PASS |
| 9 | Search hint `Search item, code, barcode…` | `StockInlineSearchBar` | inert `readOnly` | PASS |
| 10 | Table header ITEM · SYS · PHYS · DIFF | `StockWarehouseTableHeader` | `data-slot="tableHeader"` | PASS |
| 11 | Empty chrome `No stock items yet` | HexaEmptyState catalog empty | `STAFF_STOCK_EMPTY` | PASS |
| 12 | Slot: deliveryChips (counts-gated) | conditional chips | empty `data-deferred` slot | PASS |
| 13 | Action icons period/filters/search/more | AppBar actions | inert `data-slot="actions"` | PASS* |
| 14 | Typing / chip select / tab click / listStock / row actions | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |
| 15 | FriendlyLoadError / skeleton | Yes | **Deferred** STATES | N/A |
| 16 | Owner `/stock` + export PDF/Excel | Owner mode | **Deferred** (staff slice; exports null in staff) | N/A |
| 17 | Settings first in staff nest | Listed first | **Skipped** — implement locked | N/A |

\*Action slots present as empty chrome; handlers deferred BUTTONS.

**Smoke:** `npm run test:staff-stock-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore route → `DashboardRouteStubPage` title “Staff stock”; remove `features/staff/stock/*` + this compare + script; boards → ask before staff stock SCAFFOLD.

**Next (ask first):** `/staff/stock` LAYOUT — do not start until approved.
