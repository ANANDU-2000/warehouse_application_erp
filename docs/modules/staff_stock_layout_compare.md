# Staff stock `/staff/stock` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `stock_page.dart` Scaffold `0xFFF5F3EE`; `stock_operational_top_bar.dart`; `stock_status_quick_chips.dart`; `stock_table_layout.dart`; `stock_inline_search_bar.dart`; `HexaColors.brandPrimary`; `HexaOp.pageGutter`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff items COMPARE · Staff stock SCAFFOLD · **LAYOUT** · FIELDS · BUTTONS |
| 🟡 Current | Staff stock **BUTTONS PASS** — ask before WIRE |
| ⬜ Pending | Staff stock WIRE → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; owner `/stock`; listStock (WIRE) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page / AppBar bg `#F5F3EE` | Scaffold + top bar | `--ss-bg` | PASS |
| 2 | AppBar fg `#1A1A1A` · title 17 w800 | StockOperationalTopBar | same | PASS |
| 3 | Toolbar height 48 · tab bar 40 | `_height` / `_tabBarHeight` | `min-height` 48 / 40 | PASS |
| 4 | Tab labels 12 · selected w800 / idle w600 | TabBar styles | `.staff-stock-tab` | PASS |
| 5 | Status chip pad 12/4/12/2 · gap 6 | Padding + Wrap | same | PASS |
| 6 | Chip All color brandPrimary `#0E4F46` | FilterChip | `--ss-chip-all` | PASS |
| 7 | Chip Low `#E65100` · Out `#DC2626` | FilterChip | `--ss-chip-low` / `--ss-chip-out` | PASS |
| 8 | Selected chip solid color + white label | selectedColor | `--active` modifiers | PASS |
| 9 | Search gutter 16 · height 40 · radius 8 · border `#D8D5D0` | StockInlineSearchBar | `--ss-gutter` + input | PASS |
| 10 | Table header fill `#E8E6E1` · border `#D8D5D0` · top radius 2 | StockTableLayout | same | PASS |
| 11 | Header label 9 w800 `#475569` · metric col 52 | hdr + metricColWidth | same | PASS |
| 12 | Empty muted 14 `No stock items yet` | HexaEmptyState | `data-slot="empty"` | PASS |
| 13 | Row chrome min-height 72 · white · border (WIRE-ready) | StockTableLayout | `.staff-stock-row` | PASS |
| 14 | Search/chips/tabs inert (`pointer-events: none`) | N/A scaffold | LAYOUT inert | PASS |
| 15 | Typing / chip select / tab click / API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |

**Smoke:** `npm run test:staff-stock-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS → [`staff_stock_fields_compare.md`](staff_stock_fields_compare.md). BUTTONS → [`staff_stock_buttons_compare.md`](staff_stock_buttons_compare.md). Ask before WIRE.
