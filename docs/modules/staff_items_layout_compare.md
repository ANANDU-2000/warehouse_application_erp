# Staff item gallery `/staff/items` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_item_gallery_page.dart` paddings/Card/ChoiceChip; `app_theme.dart` `chipTheme`; `HexaColors`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff search COMPARE · Staff items SCAFFOLD · LAYOUT · **FIELDS** |
| 🟡 Current | Staff items **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | Staff items BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; typing/chip select done; listStock (WIRE) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg brandBackground | `#F7F9F6` | `--sg-bg` | PASS |
| 2 | AppBar transparent + brandPrimary title | Yes | same | PASS |
| 3 | Search pad gutter 16 / bottom 4 | `HexaOp.pageGutter` | `0 16px 4px` | PASS |
| 4 | Search radius 10 + filled white + inputBorderGrey | OutlineInputBorder 10 | `border-radius: 10px` + `#E5E7EB` | PASS |
| 5 | Search hint `#9CA3AF` | HexaColors.inputHint | `--sg-hint` | PASS |
| 6 | Filter row height 44 / pad 12 / gap 6 | SizedBox + ListView | same | PASS |
| 7 | ChoiceChip selected `primaryContainer` | `#D8ECE8` + brandPrimary | `--sg-chip-selected` | PASS |
| 8 | ChoiceChip idle surface + outlineVariant | chipTheme radius 12 | white + `#D7E7E3` | PASS |
| 9 | Summary pad 16/4/16/8 · label 11 · textMuted | HexaDsType.label | `#64748B` | PASS |
| 10 | Results list pad 12 / bottom 88 | ListView.fromLTRB | `0 12px 88px` | PASS |
| 11 | Empty body 14 muted `No items match` | Center Text | `data-slot="empty"` | PASS |
| 12 | Category card CSS (radius 10, border `#E2E8E6`, title w800/13) | Card chrome | CSS ready (WIRE fills) | PASS |
| 13 | Item row stock colors low `#DC2626` / normal muted / sub `#94A3B8` | `_StaffGalleryItemRow` | CSS ready | PASS |
| 14 | Search/filters inert (`pointer-events: none`) | N/A scaffold | LAYOUT inert | PASS |
| 15 | Typing / chip select / expand / menus / API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |

**Smoke:** `npm run test:staff-items-layout` (+ scaffold PASS); `npm run build` PASS.

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS done — [`staff_items_fields_compare.md`](staff_items_fields_compare.md). Ask before BUTTONS.
