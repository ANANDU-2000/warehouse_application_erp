# Staff search `/staff/search` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `search.py` `unified_search`; `fuzzy_catalog.py`; `staff_view.py`; `search_page.dart` / `hexa_api.unifiedSearch`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications COMPARE · Staff search SCAFFOLD→**COMPARE** |
| 🟡 Current | Staff search **COMPARE PASS** — ask before next stub |
| ⬜ Pending | Other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · owner `/search`; desktop preview pane; TradeIntel fact-rich tile polish |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/search?q=` authz membership | Yes | `createSearchRoutes` | PASS |
| 2 | UnifiedSearchOut shape | catalog/suppliers/brokers/types/bills/fuzzy | same keys | PASS |
| 3 | Catalog substring + fuzzy fallback | rapidfuzz | `rankIdsByTokenSort` | PASS* |
| 4 | Staff financial redact | `should_redact_financials` | `staffView.ts` | PASS |
| 5 | Recent purchases q match + lines | `list_trade_purchases` | SQL + lines | PASS |
| 6 | Frontend fetch on debounce | `unifiedSearchProvider` | `fetchUnifiedSearch` | PASS |
| 7 | addRecent len≥2 on success | provider | `addRecentSearchQuery` | PASS |
| 8 | Item row → `/catalog/item/:id` | push | navigate | PASS |
| 9 | Bill row staff → `/staff/purchase-history/:id` | push | navigate | PASS |
| 10 | Fuzzy banner (staff copy) | Yes | `STAFF_SEARCH_FUZZY_CATALOG_STAFF` | PASS |
| 11 | Staff types result list | gated off | still gated | PASS |
| 12 | FriendlyLoadError / pull refresh | Yes | **Deferred** STATES | N/A |
| 13 | 12s TTL cache exact | Yes | in-memory Map (max 40) | PASS* |

\*Fuzzy uses Levenshtein-based `tokenSortRatio` (no rapidfuzz npm); scores may differ slightly vs Python — documented. Cache omits wall-clock TTL (STATES may add).

**Smoke:** `npm run test:staff-search-wire` (+ prior); backend `vitest` search tests; `npm run build` frontend + backend PASS.

**Rollback:** Revert WIRE commit; remove search repo/routes/controller + frontend api/wire UI; restore BUTTONS empty catalogs; boards → ask before WIRE.

**Next (ask first):** STATES → [`staff_search_states_compare.md`](staff_search_states_compare.md). COMPARE → [`staff_search_compare.md`](staff_search_compare.md). Ask before next stub.
