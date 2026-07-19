# Staff search `/staff/search` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `search_page.dart` `_scheduleSearch` / `_applyQuery` / section chips / empty catalogs; `recent_unified_search_provider.dart`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications COMPARE · Staff search SCAFFOLD · LAYOUT · **FIELDS** |
| 🟡 Current | Staff search **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | BUTTONS → WIRE → STATES → COMPARE · other stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; owner `/search`; API; addRecent on success (WIRE); QF navigation (BUTTONS) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable + clear suffix | TextField + clear IconButton | `query` + clear btn | PASS |
| 2 | Debounce 350ms → trimmed query | `_scheduleSearch` | `STAFF_SEARCH_DEBOUNCE_MS` | PASS |
| 3 | Section chip select local | `_section` setState | `section` / `setSection` | PASS |
| 4 | Default section `items` + `?section=` | initState | same | PASS |
| 5 | Empty q: Quick filters + helper | unchanged | unchanged | PASS |
| 6 | Empty q: Recent + Clear when nonempty | SharedPreferences list | `loadRecentSearchQueries` / clear | PASS |
| 7 | Recent chip applies query | `_applyQuery` | `applyQuery` | PASS |
| 8 | Prefs key prefix `pref_recent_unified_search_v1_` | provider | same | PASS |
| 9 | Nonempty + no data: global no-match copy | `hasAny == false` | `STAFF_SEARCH_NO_MATCH_GLOBAL` | PASS |
| 10 | Section items empty catalog | title + empty string | exact | PASS |
| 11 | Section bills empty catalog | title + empty string | exact | PASS |
| 12 | Staff types result list block | gated `!staffShellEmbedded` | **not rendered** (match) | PASS |
| 13 | addQuery on successful search len≥2 | Yes | **Deferred** WIRE | N/A |
| 14 | Quick-filter / result-row navigation | Yes | **Deferred** BUTTONS | N/A |
| 15 | GET unified search API | Yes | **Deferred** WIRE | N/A |

**Smoke:** `npm run test:staff-search-fields` (+ scaffold/layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT inert search/chips; remove recents module + empty catalogs from copy + this compare + script; boards → ask before FIELDS.

**Next (ask first):** `/staff/search` BUTTONS — do not start until approved.
