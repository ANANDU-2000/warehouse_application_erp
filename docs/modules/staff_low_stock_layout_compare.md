# Staff low stock `/staff/low-stock` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `low_stock_dashboard_page.dart` Scaffold/AppBar/search/segmented; `low_stock_category_tree.dart`; `low_stock_compact_item_row.dart`; `HexaColors`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff purchase-history COMPARE · Staff low-stock SCAFFOLD → **FIELDS** |
| 🟡 Current | `/staff/low-stock` **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | Inform/PDF/CSV/row handlers · operations API · owner `/stock/low-stock` · purchase entry · barcode/print · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | `HexaColors.brandBackground` | `--sls-bg` | PASS |
| 2 | AppBar fg brandPrimary `#0E4F46` | `foregroundColor` | title/back | PASS |
| 3 | AppBar toolbar ~56 · title 20 | Material AppBar | `min-height: 56` · `font-size: 20` | PASS |
| 4 | Search gutter 12 · radius 10 · border `#E2E8E6` · white fill | padding + Outline | `--sls-gutter` + input | PASS |
| 5 | Search hint `#9CA3AF` | inputHint | `--sls-hint` | PASS |
| 6 | Search min height ~40 | dense TextField | `min-height: 40px` | PASS |
| 7 | Segment unselected `#F1F5F4` / fg `#334155` | `_Segment` | `--sls-tab` / `--sls-tab-fg` | PASS |
| 8 | Segment selected `#065F46` + white | `_Segment` | `--sls-tab-selected` | PASS |
| 9 | Segment font 13 w600 · gap 6 · radius 20 | exact | `.staff-ls-tab` | PASS |
| 10 | Attention label 10 muted `#64748B` | HexaDsType.label(10) | `.staff-ls-attention` | PASS |
| 11 | Empty muted 14 | HexaEmptyState | `.staff-ls-results__empty` | PASS |
| 12 | Category card border brandBorder · title 13 w800 | ExpansionTile chrome | `.staff-ls-category*` | PASS |
| 13 | Compact row white · bottom border · serial 13 w800 | `LowStockCompactItemRow` | `.staff-ls-row*` | PASS |
| 14 | Status bar OUT `#DC2626` · LOW/PENDING `#F59E0B` | row constants | `--sls-critical` / `--sls-warn` | PASS |
| 15 | Status chip 10 w800 · radius 4 | exact | `.staff-ls-status*` | PASS |
| 16 | Subcategory muted `#94A3B8` · 11 | row sub style | `--sls-sub` | PASS |
| 17 | Inform btn `#065F46` · 11 w700 | staff compact CTA | `.staff-ls-row__inform` | PASS |
| 18 | List bottom pad 88 | TabBarView / tree pad | `--sls-list-pad-bottom` | PASS |
| 19 | brandAccent `#159A8A` token | HexaColors | `--sls-accent` | PASS |
| 20 | Tabs/search/export `pointer-events: none` | N/A scaffold | LAYOUT inert | PASS |
| 21 | Typing / tab select / API / Inform | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |

**Smoke:** `npm run test:staff-low-stock-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS done — [`staff_low_stock_fields_compare.md`](staff_low_stock_fields_compare.md). Ask before BUTTONS.
