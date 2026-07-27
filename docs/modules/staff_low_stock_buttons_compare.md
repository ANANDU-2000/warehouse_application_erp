# Staff low stock `/staff/low-stock` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `low_stock_compact_item_row.dart` · `low_stock_item_detail_sheet.dart` · `low_stock_dashboard_page.dart` `_notifyOwner` / `_receive` / `_exportPdf`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff purchase-history COMPARE · Staff low-stock SCAFFOLD → **BUTTONS** |
| 🟡 Current | `/staff/low-stock` **BUTTONS PASS** — ask before WIRE |
| ⬜ Pending | WIRE → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | notifyOwnerStockItem API · PDF/CSV bytes · + Stock / reorder sheets · ops list API · owner `/stock/low-stock` · purchase entry · barcode/print · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Row tap / ⋮ → detail sheet | `openDetails` | `openDetails` + `data-slot="detailSheet"` | PASS |
| 2 | Staff Inform → local mark + snack | `_notifyOwner` + SnackBar | `onNotifyOwner` + `staffLsOwnerNotified` | PASS* |
| 3 | Inform label Sent / Owner informed | compact + sheet | `STAFF_LS_SENT` / `STAFF_LS_OWNER_INFORMED` | PASS |
| 4 | Receive → `/staff/receive` or `/:hid` | `_receive(staffMode)` | `staffLsReceivePath` | PASS |
| 5 | Item profile → `/catalog/item/:id` | detail sheet | `staffLsItemPath` | PASS |
| 6 | PDF/CSV empty → `No items in this view to export` | SnackBar | `STAFF_LS_EXPORT_EMPTY` toast | PASS |
| 7 | Category expand/collapse | ExpansionTile | `toggleCat` / `collapsedCats` | PASS |
| 8 | Status OUT/PENDING/LOW/ATTN | compact row | `staffLsStatusKind` / Label | PASS |
| 9 | Qty `formatStockQtyDisplay` | unit_utils | `formatStaffLsQtyDisplay` | PASS |
| 10 | notifyOwnerStockItem HTTP | Yes | **Deferred** `data-deferred="notify-owner-api"` | N/A |
| 11 | PDF/CSV byte export | Yes | **Deferred** `pdf-bytes` / `csv-bytes` | N/A |
| 12 | + Stock / Set reorder sheets | Yes | **Deferred** | N/A |
| 13 | low-stock operations API fill | Yes | **Deferred** WIRE | N/A |

\*API call deferred to WIRE; UI parity for informed state + success snack copy.

**Smoke:** `npm run test:staff-low-stock-buttons` (+ scaffold→fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS page without detail/export handlers; remove `staffLowStockRow.ts` + this compare + script; boards → ask before BUTTONS.

**Next (ask first):** WIRE — do not start until approved.
