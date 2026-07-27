# Staff item gallery `/staff/items` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_item_gallery_page.dart` Autocomplete/`_search` debounce · filter chips · `_itemMatches*` / `_groupGalleryItems` / `_gallerySuggestions`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff search COMPARE · Staff items SCAFFOLD · LAYOUT · FIELDS · **BUTTONS** |
| 🟡 Current | Staff items **BUTTONS PASS** — ask before WIRE |
| ⬜ Pending | Staff items WIRE → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; listStock (WIRE); QuickStockActionSheet (WIRE) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable | Autocomplete TextField | `query` + `--active` | PASS |
| 2 | Debounce 200ms → trimmed `_search` | `Timer(200ms)` | `STAFF_GALLERY_DEBOUNCE_MS` | PASS |
| 3 | Filter chip select local | `_filter` setState | `filter` / `setFilter` | PASS |
| 4 | Init filter from `?filter=` aliases | `_filterFromQuery` | `staffGalleryFilterFromQuery` | PASS |
| 5 | Chip select does not rewrite URL | local only | local only | PASS |
| 6 | Autocomplete suggestions max 12 | `optionsBuilder.take(12)` | `STAFF_GALLERY_SUGGESTIONS_MAX` | PASS |
| 7 | Suggestion apply sets search | `onSelected` | `applySuggestion` | PASS |
| 8 | Filter match: missing code / barcode / low / opening | `_itemMatchesGalleryFilter` | `itemMatchesGalleryFilter` | PASS |
| 9 | Low/out: stock≤0 · status · reorder | `_itemLowOrOut` | `itemLowOrOut` | PASS |
| 10 | Search haystack name/code/cat/sub/type | `_itemMatchesSearch` | `itemMatchesSearch` | PASS |
| 11 | Group Uncategorized / `—` + name sort | `_groupGalleryItems` | `groupGalleryItems` | PASS |
| 12 | Summary `N items · M categories` | string interp | `formatGallerySummary` | PASS |
| 13 | Empty catalog → `No items match` + `0 items · 0 categories` | until API | same (no listStock yet) | PASS |
| 14 | listStock / category expand / row menus | Yes | **Deferred** BUTTONS/WIRE | N/A |
| 15 | FriendlyLoadError / loading | Yes | **Deferred** STATES | N/A |

**Smoke:** `npm run test:staff-items-fields` (+ scaffold/layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT inert search/chips; remove `staffItemGalleryLogic.ts` + this compare + fields script; boards → ask before FIELDS.

**Next (ask first):** BUTTONS done — [`staff_items_buttons_compare.md`](staff_items_buttons_compare.md). Ask before WIRE.
