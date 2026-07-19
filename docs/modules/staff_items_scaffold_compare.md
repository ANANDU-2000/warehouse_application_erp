# Staff item gallery `/staff/items` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Satellite:** Subagent 4 — next unlockable stub after Staff search COMPARE (Settings hub skipped — implement locked).  
**Sources:** `staff_item_gallery_page.dart`; `app_router.dart` `/staff/items`; `staffGalleryStockProvider` (WIRE)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications COMPARE · Staff search SCAFFOLD→COMPARE · Staff items SCAFFOLD · LAYOUT · **FIELDS** |
| 🟡 Current | Staff items **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | Staff items BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings` (implement locked); owner `/stock` gallery; `listStock` API (WIRE) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/staff/items` | `StaffItemGalleryPage` | `StaffItemGalleryPage` | PASS |
| 2 | AppBar title `Item gallery` | Yes | `STAFF_GALLERY_TITLE` + `data-slot="appBar"` | PASS |
| 3 | Back → popOrGo `/staff/home` | AppBar leading | same fallback | PASS |
| 4 | Slot order: search → filters → summary → results | Column children | `data-slot` same | PASS |
| 5 | Hint `Name, item code, category, subcategory…` | TextField | `STAFF_GALLERY_HINT` (inert) | PASS |
| 6 | Filter chips All · No item code · No barcode · Low / out · Opening | enum order | `STAFF_GALLERY_FILTER_ORDER` | PASS |
| 7 | Default filter `all` | `_filterFromQuery` default | `STAFF_GALLERY_DEFAULT_FILTER` | PASS |
| 8 | `?filter=` aliases (`missing_code`, `barcode`, `low`, `opening`, …) | `_filterFromQuery` | `staffGalleryFilterFromQuery` | PASS |
| 9 | Empty chrome `No items match` + `0 items · 0 categories` | data empty | scaffold empty | PASS |
| 10 | Typing / chip select / listStock / category cards / row menus | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |
| 11 | FriendlyLoadError / loading | Yes | **Deferred** STATES | N/A |
| 12 | Settings first in staff nest | Listed first | **Skipped** — implement locked | N/A |

**Smoke:** `npm run test:staff-items-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore route → `DashboardRouteStubPage` title “Staff gallery”; remove `features/staff/items/*` + this compare + script; boards → ask before staff items SCAFFOLD.

**Next (ask first):** LAYOUT → [`staff_items_layout_compare.md`](staff_items_layout_compare.md). FIELDS → [`staff_items_fields_compare.md`](staff_items_fields_compare.md). Ask before BUTTONS.
