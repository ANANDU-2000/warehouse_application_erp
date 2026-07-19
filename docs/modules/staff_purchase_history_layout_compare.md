# Staff purchase history `/staff/purchase-history` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_purchase_history_page.dart` Scaffold/`AppBar`/`FilterChip`/`InputDecoration`; `_DateHeader`; `staff_purchase_history_row.dart`; `HexaColors`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff stock COMPARE · Staff purchase-history SCAFFOLD · LAYOUT · **FIELDS** |
| 🟡 Current | `/staff/purchase-history` **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | Detail `:purchaseId` · trade-purchases API · Inform owner · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | `HexaColors.brandBackground` | `--sph-bg` | PASS |
| 2 | AppBar fg brandPrimary `#0E4F46` | `foregroundColor` | title/back | PASS |
| 3 | AppBar toolbar ~56 · title 20 | Material AppBar | `min-height: 56` · `font-size: 20` | PASS |
| 4 | Tab bar scrollable · selected brand underline | `TabBar isScrollable` | `.staff-ph-tab--selected` | PASS |
| 5 | Search gutter 12 · radius 10 · border `#E2E8E6` · white fill | `fromLTRB(12,8,12,0)` + Outline | `--sph-gutter` + input | PASS |
| 6 | Search hint `#9CA3AF` | `HexaColors.inputHint` | `--sph-hint` | PASS |
| 7 | Chip font 11 · Wrap gap 6 | FilterChip + Wrap | same | PASS |
| 8 | Selected chip solid brandPrimary + white | Material FilterChip | `.staff-ph-chip--selected` | PASS |
| 9 | Empty muted 14 `#64748B` | `_emptyMessage` HexaDs | `.staff-ph-results__empty` | PASS |
| 10 | Date header 12 w900 `#64748B` | `_DateHeader` | `.staff-ph-date-header` | PASS |
| 11 | Row white · bottom border brandBorder · pad 12/8 · min 72 | `StaffPurchaseHistoryRow` | `.staff-ph-row` | PASS |
| 12 | Pack teal `#0D9488` · supplier 13 w900 | row styles | tokens | PASS |
| 13 | Status chip radius 6 · semantic colors | `_StatusChip` + `PurchaseStatus.color` | `.staff-ph-status-chip--*` | PASS |
| 14 | Low row warning `#F0A500` · critical `#DC2626` | `_StaffLowStockRow` | `.staff-ph-low-row__icon*` | PASS |
| 15 | List bottom pad 88 | `EdgeInsets … 88` | `--sph-list-pad-bottom` | PASS |
| 16 | Tabs/search/chips `pointer-events: none` | N/A scaffold | LAYOUT inert | PASS |
| 17 | Typing / chip select / tab / API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |

**Smoke:** `npm run test:staff-purchase-history-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS done — [`staff_purchase_history_fields_compare.md`](staff_purchase_history_fields_compare.md). Ask before BUTTONS.
