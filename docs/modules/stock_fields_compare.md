# Owner stock `/stock` — FIELDS compare (Step 3)

**Branch:** `ops/inventory-stock-module`  
**Sources:** `stock_page.dart` `_onSearchChanged` 180ms · `_instantSearch` · status chips · tab controller; `stock_period_utils.dart` `_stockNamePrefixRank`; `stock_status_quick_chips.dart`; `stock_inline_search_bar.dart`; `stock_delivery_filter_chips.dart`; `operational_stock_filter_sheet.dart`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Owner stock SCAFFOLD · LAYOUT · FIELDS |
| 🟡 Current | Owner stock **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | Owner stock BUTTONS → WIRE → COMPARE |
| ⏸ Deferred | API wire, skeleton/error/empty states, detail pane |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable | TextField | `query` + `--active` | PASS |
| 2 | Debounce 180ms → trimmed query | `Timer(180ms)` | `STOCK_DEBOUNCE_MS` | PASS |
| 3 | Clear search control | suffix IconButton | `owner-stock-search__clear` | PASS |
| 4 | Status chip select local | `onSelected` → list query | `setStatus` local | PASS |
| 5 | Low chip → `shortage` | stock_status_quick_chips | `StockStatus` type | PASS |
| 6 | Init status from `?status=` | `_mapRouteStatus` | `stockStatusFromQuery` | PASS |
| 7 | Chip/tab select does not rewrite URL | provider / TabController | local only | PASS |
| 8 | Tab Stock · Activity client switch | TabController | `setTab` | PASS |
| 9 | Init tab from `?tab=` aliases | `_tabIndex` | `stockTabFromQuery` | PASS |
| 10 | Delivery chips All/Pending/Delivered | `StockDeliveryFilterChips` | `STOCK_DELIVERY_FILTER_ORDER` | PASS |
| 11 | Period sheet Today/Week/Month/Year/AllTime | `_StockPeriodSheet` | `STOCK_PERIOD_SHEET_ORDER` | PASS |
| 12 | Period badge short label | `_periodLabel` | `STOCK_PERIOD_BADGE` | PASS |
| 13 | Advanced filter sheet opens | `showOperationalStockFilter` | `openFilters` + sheet | PASS |
| 14 | Filter: reorder only toggle | `SwitchListTile` | `draftOp.reorderOnly` | PASS |
| 15 | Filter: purchased in period toggle | `SwitchListTile` | `draftOp.purchasedInPeriodOnly` | PASS |
| 16 | Filter: missing barcode toggle | `SwitchListTile` | `draftOp.missingBarcodeOnly` | PASS |
| 17 | Filter: missing item code toggle | `SwitchListTile` | `draftOp.missingItemCodeOnly` | PASS |
| 18 | Filter: subcategory picker | `SearchPickerSheet` | `draftSubcategory` text input | PASS |
| 19 | Filter: supplier picker | `SearchPickerSheet` | `draftSupplier` text input | PASS |
| 20 | Filter: unit chips BAG/KG/BOX/TIN/PIECE | `FilterChip` row | `draftUnit` chip toggle | PASS |
| 21 | Filter: sort dropdown Name/Stock↑/Stock↓/Recent | `DropdownButtonFormField` | `draftSort` select | PASS |
| 22 | Filter: apply/clear buttons | `FilledButton` + `TextButton` | `applyFilters` / `clearAdvancedFilters` | PASS |
| 23 | Table header ITEM/SYS/PHYS/DIFF | `StockWarehouseTableHeader` | `owner-stock-table-header` | PASS |
| 24 | Filter count badge on icon | `filterCount` | `countWarehouseActiveFilters` | PASS |
| 25 | Debounce progress bar | `LinearProgressIndicator` | `owner-stock-debounce-progress` | PASS |
| 26 | Client filter matching | `itemMatchesOpFilters` | `itemMatchesOpFilters` | PASS |
| 27 | Chip count >999 → "999+" | `count > 999 ? '999+'` | `count > 999 ? "999+" : count` | PASS |
| 28 | Owner-only actions (PDF/Excel/Add) | `_isStaffMode ? null : ...` | **Deferred** BUTTONS | N/A |
| 29 | List rows / infinite scroll | `SliverList` + `StockWarehouseRow` | **Deferred** WIRE | N/A |
| 30 | Empty catalog → `No stock items yet` | `HexaEmptyState` | **Deferred** STATES | N/A |
| 31 | "Stock list did not load" (chip mismatch) | `HexaEmptyState` | **Deferred** STATES | N/A |

**Smoke:** `npx tsc --noEmit` PASS; `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT inert search/chips/tabs; remove `stockFilters.ts` + `stockPeriod.ts` + `stockDeliveryFilter.ts` + this compare; boards → ask before FIELDS.

**Next (ask first):** BUTTONS → period/filter/search-toggle handlers, PDF/Excel export stubs, Add Item stub. Ask before WIRE.
