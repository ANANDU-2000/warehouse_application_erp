# Staff stock `/staff/stock` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `stock_operational_top_bar.dart` · `stock_page.dart` `_StockPeriodSheet` / `_openFilters` · `operational_stock_filter_sheet.dart` · `countWarehouseActiveFilters`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff items COMPARE · Staff stock SCAFFOLD · LAYOUT · FIELDS · **BUTTONS** · WIRE |
| 🟡 Current | Staff stock **WIRE PASS** — ask before STATES |
| ⬜ Pending | Staff stock STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | listStock done; delivery counts · Activity feed · period purchased (STATES/later) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Period AppBar action + badge when ≠ allTime | date_range Badge | `data-action="period"` + badge | PASS |
| 2 | Period sheet title `Filter by period` | `_StockPeriodSheet` | `STAFF_STOCK_PERIOD_SHEET_TITLE` | PASS |
| 3 | Period options Today / This Week / Month / Year / All Time | sheet options | `STAFF_STOCK_PERIOD_SHEET_ORDER` | PASS |
| 4 | Period pick local (dates → WIRE) | `applyStockPagePeriod` | `setPeriod` local | PASS |
| 5 | Filters AppBar + count badge | tune Badge | `data-action="filters"` + count | PASS |
| 6 | Filter toggles Reorder / Purchased / Missing barcode / code | SwitchListTile | draftOp checkboxes | PASS |
| 7 | Clear advanced + Apply | TextButton / Apply | same labels | PASS |
| 8 | Subcategory/supplier pickers | SearchPicker | **Deferred** `data-deferred` | N/A |
| 9 | `countWarehouseActiveFilters` | Flutter fn | same rules | PASS |
| 10 | Search toggle expand/collapse | `_searchExpanded` | `searchExpanded` | PASS |
| 11 | Search hidden until expanded (default false) | Flutter default | same | PASS |
| 12 | More → Scan → `/barcode/scan?return=stock` | push | `STAFF_STOCK_SCAN_PATH` | PASS |
| 13 | Staff: no PDF / Excel / movement / Add item | `isStaffMode` gates | omitted | PASS |
| 14 | Op filters applied client-side to local rows | filterStockListClient | `itemMatchesOpFilters` | PASS |
| 15 | listStock / delivery chips / row menus | Yes | **Deferred** WIRE | N/A |

**Smoke:** `npm run test:staff-stock-buttons` (+ scaffold/layout/fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS inert AppBar slots; remove period/filters modules + this compare + script; boards → ask before BUTTONS.

**Next (ask first):** WIRE → [`staff_stock_wire_compare.md`](staff_stock_wire_compare.md). Ask before STATES.
