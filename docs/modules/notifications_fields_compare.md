# Notifications `/notifications` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `notifications_page.dart` search / filter / showing / HexaEmptyState catalogs

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · **COMPARE** |
| 🟡 Current | COMPARE PASS — ask before next Subagent 4 stub |
| ⬜ Pending | Other Subagent 4 stubs |
| ⏸ Deferred | Purchase-due synthetics; Approve/Review; STATES polish |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable + clear suffix | TextField | `search` state + clear btn | PASS |
| 2 | Filter chip select local | `_filter` setState | `filter` / `setFilter` | PASS |
| 3 | Staff omit Purchases chip | `_visibleFilters` | `NOTIFICATIONS_FILTER_ORDER_STAFF` | PASS |
| 4 | Showing `N of M alerts` when filtered/search | exact pattern | `NOTIFICATIONS_SHOWING_*` | PASS |
| 5 | Empty titles per filter | `_emptyTitleForFilter` | `NOTIFICATIONS_EMPTY_TITLE` | PASS |
| 6 | Empty subtitles per filter | `_emptySubtitleForFilter` | `NOTIFICATIONS_EMPTY_SUBTITLE` | PASS |
| 7 | Search empty `No matches` + subtitle | exact | exact | PASS |
| 8 | Filter-hidden subtitle + Show all alerts | exact | exact + sets filter all | PASS |
| 9 | Empty CTA labels New purchase / Receive shipment | staff gate | exact; navigate **BUTTONS** | PASS* |
| 10 | List rows / API / back / mark-all / clear | Yes | **Deferred** | N/A |

\*CTA buttons rendered inert (`aria-disabled`) until BUTTONS wire `push`.

**Smoke:** `npm run test:notifications-fields` (+ scaffold/layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT inert search/chips + card shells; remove empty catalogs from copy/filters + this compare + script; boards → ask before FIELDS.

**Next (ask first):** `/notifications` BUTTONS — done → [`notifications_buttons_compare.md`](notifications_buttons_compare.md). WIRE — done → [`notifications_wire_compare.md`](notifications_wire_compare.md). Ask before next Subagent 4 stub.
