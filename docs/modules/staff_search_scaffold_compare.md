# Staff search `/staff/search` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Satellite:** Subagent 4 — next unlockable stub after Notifications COMPARE (Settings hub skipped — implement locked).  
**Sources:** `search_page.dart` — `SearchPage(staffShellEmbedded: true)`; `app_router.dart` `/staff/search`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications SCAFFOLD→COMPARE · Staff search SCAFFOLD · LAYOUT · FIELDS · **BUTTONS** |
| 🟡 Current | Staff search **BUTTONS PASS** — ask before WIRE |
| ⬜ Pending | Staff search WIRE → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings` (implement locked); owner `/search`; API `GET …/search` (WIRE) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/staff/search` | `SearchPage(staffShellEmbedded: true)` | `StaffSearchPage` | PASS |
| 2 | No AppBar when staff-embedded | Scaffold body Column only | no `data-slot="appBar"` | PASS |
| 3 | Slot order: search → filters → results | `_embeddedSearchTextField` → chips → Expanded | `data-slot` same | PASS |
| 4 | Hint `Item name, code, barcode, category…` | staff hint | `STAFF_SEARCH_HINT` (inert) | PASS |
| 5 | Chips Items · Subcategories · Purchases | `_embeddedCategoryChips` staff meta | `STAFF_SEARCH_SECTION_ORDER` | PASS |
| 6 | Default section `items` | `initState` staffShellEmbedded | `STAFF_SEARCH_DEFAULT_SECTION` | PASS |
| 7 | Keys `items` / `types` / `bills` | Flutter tuple keys | same | PASS |
| 8 | Typing / chip select / API / result rows | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |
| 9 | Owner `/search` AppBar + broader chips | Standalone SearchPage | **Deferred** (this slice = staff path) | N/A |
| 10 | Settings first in staff nest | Listed first | **Skipped** — implement locked | N/A |

**Smoke:** `npm run test:staff-search-scaffold`; `npm run build` PASS.

**Rollback:** Revert SCAFFOLD commit; restore route → `DashboardRouteStubPage` title “Staff search”; remove `features/staff/search/*` + this compare + script; boards → ask before staff search SCAFFOLD.

**Next (ask first):** `/staff/search` LAYOUT — done → [`staff_search_layout_compare.md`](staff_search_layout_compare.md). FIELDS — done → [`staff_search_fields_compare.md`](staff_search_fields_compare.md). BUTTONS — done → [`staff_search_buttons_compare.md`](staff_search_buttons_compare.md). Ask before WIRE.
