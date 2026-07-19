# Staff low stock `/staff/low-stock` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `low_stock_dashboard_page.dart` debounce 200ms · TabController · `_showFiltersSheet` · `filterLowStockGrouped` / `lowStockMatchesTab`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff purchase-history COMPARE · Staff low-stock SCAFFOLD → **BUTTONS** |
| 🟡 Current | `/staff/low-stock` **BUTTONS PASS** — ask before WIRE |
| ⬜ Pending | WIRE → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | notifyOwnerStockItem API · PDF/CSV bytes · + Stock / reorder · ops list API · owner `/stock/low-stock` · purchase entry · barcode/print · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable | TextField | `query` + `--active` | PASS |
| 2 | Debounce 200ms → trim | `Timer(200ms)` | `STAFF_LS_DEBOUNCE_MS` | PASS |
| 3 | Clear search control | Autocomplete clear | `staff-ls-search__clear` | PASS |
| 4 | Tab All/Out/Bought/Pending/Delivery select | TabController | `setTab` | PASS |
| 5 | Init tab from `?filter=` | `_tabIndexFromFilter` | `staffLsTabFromFilter` | PASS |
| 6 | Chip/tab select does not rewrite URL | local setState | local only | PASS |
| 7 | Filter sheet scopes All fields…Supplier | ChoiceChips | `STAFF_LS_SCOPE_ORDER` | PASS |
| 8 | Apply / Clear filters | FilledButton / TextButton | `applyFilters` / `clearFilters` | PASS |
| 9 | Subcategory chip when filter set | InputChip onDeleted | `staff-ls-subchip` | PASS |
| 10 | Filter btn active tint when filters on | `_filtersActive` | `--active` class | PASS |
| 11 | `filterLowStockGrouped` tab+scope+sub | exact | `staffLowStockLogic` | PASS |
| 12 | Tab match out/pending/bought/delivery/all | `lowStockMatchesTab` | same | PASS |
| 13 | Empty / search / subcategory empty titles | HexaEmptyState / sub copy | `staffLsEmptyTitle` | PASS |
| 14 | Inform / PDF / CSV / row open | Yes | **Deferred** BUTTONS | N/A |
| 15 | low-stock operations API | Yes | **Deferred** WIRE | N/A |

**Smoke:** `npm run test:staff-low-stock-fields` (+ scaffold/layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT inert search/tabs; remove `staffLowStockLogic.ts` / `staffLowStockFilters.ts` + this compare + fields script; boards → ask before FIELDS.

**Next (ask first):** BUTTONS done — [`staff_low_stock_buttons_compare.md`](staff_low_stock_buttons_compare.md). Ask before WIRE.
