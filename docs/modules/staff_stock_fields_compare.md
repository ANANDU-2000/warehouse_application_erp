# Staff stock `/staff/stock` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `stock_page.dart` `_onSearchChanged` 180ms · `_instantSearch` · status chips · tab controller; `stock_period_utils.dart` `_stockNamePrefixRank`; HexaEmptyState titles

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff items COMPARE · Staff stock SCAFFOLD · LAYOUT · **FIELDS** |
| 🟡 Current | Staff stock **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | Staff stock BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; listStock (WIRE); AppBar period/filters/more (BUTTONS) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable | TextField | `query` + `--active` | PASS |
| 2 | Debounce 180ms → trimmed query | `Timer(180ms)` | `STAFF_STOCK_DEBOUNCE_MS` | PASS |
| 3 | Clear search control | suffix IconButton | `staff-stock-search__clear` | PASS |
| 4 | Status chip select local | `onSelected` → list query | `setStatus` local | PASS |
| 5 | Low chip → `shortage` | stock_status_quick_chips | `STAFF_STOCK_STATUS_ORDER` | PASS |
| 6 | Init status from `?status=` | `_mapRouteStatus` | `staffStockStatusFromQuery` | PASS |
| 7 | Chip/tab select does not rewrite URL | provider / TabController | local only | PASS |
| 8 | Tab Stock · Activity client switch | TabController | `setTab` | PASS |
| 9 | Init tab from `?tab=` aliases | `_tabIndex` | `staffStockTabFromQuery` | PASS |
| 10 | Empty catalog → `No stock items yet` | HexaEmptyState | `staffStockListEmptyTitle` | PASS |
| 11 | Filters/search → `No items match filters` | HexaEmptyState | `STAFF_STOCK_EMPTY_FILTERED` | PASS |
| 12 | Status match low∪critical / out | API status + client helpers | `itemMatchesStockStatus` | PASS |
| 13 | Search haystack name/code/barcode | sort prefix helpers | `itemMatchesStockSearch` | PASS |
| 14 | Prefix rank startsWith → contains | `_stockNamePrefixRank` | `stockNamePrefixRank` | PASS |
| 15 | AppBar period/filters/search-toggle/more | Yes | **Deferred** BUTTONS | N/A |
| 16 | listStock / delivery chips / row actions | Yes | **Deferred** BUTTONS/WIRE | N/A |
| 17 | "Stock list did not load" (chip count mismatch) | Yes | **Deferred** WIRE/STATES | N/A |

**Smoke:** `npm run test:staff-stock-fields` (+ scaffold/layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT inert search/chips/tabs; remove `staffStockLogic.ts` + this compare + fields script; boards → ask before FIELDS.

**Next (ask first):** `/staff/stock` BUTTONS — do not start until approved.
