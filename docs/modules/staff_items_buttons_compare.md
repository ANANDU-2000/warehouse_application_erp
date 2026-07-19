# Staff item gallery `/staff/items` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_item_gallery_page.dart` category expand · sub ChoiceChips · `_StaffGalleryItemRow` tap/menu

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff search COMPARE · Staff items SCAFFOLD · LAYOUT · FIELDS · BUTTONS · **WIRE** |
| 🟡 Current | Staff items **WIRE PASS** — ask before STATES |
| ⬜ Pending | Staff items STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; QuickStockActionSheet (STATES/later) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Category card expand/collapse | `_expandedCats` toggle | `expandedCats` / `toggleCat` | PASS |
| 2 | Chevron expand_more / expand_less | Icons | SVG paths | PASS |
| 3 | Sub tabs when `subs.length > 1` | ChoiceChip All + subs | `data-slot="subTabs"` | PASS |
| 4 | Sub `—` omitted from tabs; hideSub when tab or dash | Flutter | `STAFF_GALLERY_SUB_DASH` | PASS |
| 5 | Item tap → `/catalog/item/:id` | `context.push` | `openItemProfile` | PASS |
| 6 | Menu Item profile → same path | PopupMenu `item` | `data-action="item"` | PASS |
| 7 | Menu Reorder / opening → `/catalog/item/:id/edit` | push edit | `openItemEdit` + stub route | PASS |
| 8 | Menu Update stock label present | `Update stock` | `STAFF_GALLERY_MENU_STOCK` | PASS |
| 9 | QuickStockActionSheet | `showQuickStockActionSheet` | **Deferred** WIRE (`data-deferred`) | N/A |
| 10 | Stock line `Stock: qty unit · code|No code · No barcode?` | formatStockQtyNumber | `formatGalleryStockLine` | PASS |
| 11 | Low stock red `#DC2626` / normal muted | TextStyle | `--low` class | PASS |
| 12 | Default name `Item` / unit `bag` | Flutter defaults | copy consts | PASS |
| 13 | Empty catalog still shows `No items match` | until API | same (listStock WIRE) | PASS |
| 14 | listStock pagination API | Yes | **Deferred** WIRE | N/A |

**Smoke:** `npm run test:staff-items-buttons` (+ scaffold/layout/fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS list empty-only; remove edit route stub + menu/expand UI + this compare + script; boards → ask before BUTTONS.

**Next (ask first):** WIRE done — [`staff_items_wire_compare.md`](staff_items_wire_compare.md). Ask before STATES.
