# Staff search `/staff/search` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Staff-embedded search `/staff/search` only — not owner `/search`, not Settings hub  
**Sources:** `search_page.dart` (`staffShellEmbedded: true`) · `search.py` · `fuzzy_catalog.py` · `staff_view.py` · slice compares below

**Verdict:** **PASS** for in-scope staff search page loop (SCAFFOLD→STATES + unified GET/wire). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · **COMPARE** |
| 🟡 Current | Staff search COMPARE PASS — ask before next Subagent 4 stub |
| ⬜ Pending (ask first) | Next unlockable stub — [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) |
| ⏸ Deferred | Owner `/search`; `/staff/settings` · `/settings` (implement locked); desktop preview pane; TradeIntel fact-rich tile polish; merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + no AppBar | `SearchPage(staffShellEmbedded: true)` | `StaffSearchPage` slots | PASS | [`staff_search_scaffold_compare.md`](staff_search_scaffold_compare.md) |
| 2 | LAYOUT ChoiceChip + Quick filters chrome | `primaryContainer` / ActionChip row | tokens + empty QF chrome | PASS | [`staff_search_layout_compare.md`](staff_search_layout_compare.md) |
| 3 | FIELDS query/section/recents | debounce 350ms + prefs key | same + empty catalogs | PASS | [`staff_search_fields_compare.md`](staff_search_fields_compare.md) |
| 4 | BUTTONS Quick-filter push/go | Scan = `context.go` | `replace: true` | PASS | [`staff_search_buttons_compare.md`](staff_search_buttons_compare.md) |
| 5 | WIRE GET unified search | `unified_search` + staff redact | `search.repository` + `staffView` | PASS | [`staff_search_wire_compare.md`](staff_search_wire_compare.md) |
| 6 | WIRE rows + nav + addRecent | item/bill taps + len≥2 | navigate + prefs | PASS | wire compare |
| 7 | WIRE staff types list gated | `!staffShellEmbedded` | not rendered | PASS | fields/wire |
| 8 | STATES reload / cold / error | progress + FriendlyLoadError | same gates + map | PASS | [`staff_search_states_compare.md`](staff_search_states_compare.md) |
| 9 | STATES 12s TTL (max 40) | `_unifiedSearchTtl` | `STAFF_SEARCH_CACHE_TTL_MS` | PASS | states compare |
| 10 | STATES pull-to-refresh retry | N/A shell / invalidate | touch pull → retry | PASS* | states compare |

\*Flutter search has no RefreshIndicator; pull is SPA affordance matching notifications STATES (documented PASS*).

**Overall (in-scope `/staff/search`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Owner `/search` (AppBar + broader chips / suppliers / brokers) | Slice = staff-embedded path only |
| Staff Catalog types **result** block | Source-gated off when `staffShellEmbedded` — correctly omitted |
| TradeIntel full fact-rich catalog tile polish | Partial tile parity; fact-rich polish deferred |
| Desktop search preview pane | Flutter desktop width branch; mobile/staff parity shipped |
| `/staff/settings` · `/settings` | Settings module **implement locked** |
| rapidfuzz bit-identical scores | TS Levenshtein `tokenSortRatio` — may differ slightly vs Python (WIRE PASS*) |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:staff-search-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc)
npm run build
```

Backend (WIRE regression, optional on COMPARE):

```bash
cd new-app/backend
npx vitest run tests/search/unifiedSearch.test.ts
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Ask before: **next Subagent 4 satellite** from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) (not Settings hub; not owner `/search` unless approved), **or**  
2. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**
