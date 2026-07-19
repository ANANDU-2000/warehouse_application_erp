# Staff purchase history `/staff/purchase-history` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_purchase_history_page.dart` `_onSearchChanged` 250ms · TabController · FilterChips · `_filterPurchases` / `_filterLowStock` · `_emptyMessage`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff stock COMPARE · Staff purchase-history SCAFFOLD · LAYOUT · **FIELDS** |
| 🟡 Current | `/staff/purchase-history` **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | Detail `:purchaseId` · trade-purchases API · Inform owner · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable | TextField | `query` + `--active` | PASS |
| 2 | Debounce 250ms → trim + lower | `Timer(250ms)` | `STAFF_PH_DEBOUNCE_MS` | PASS |
| 3 | Clear search control | suffix IconButton | `staff-ph-search__clear` | PASS |
| 4 | Status chip select local | `_statusFilter` | `setStatus` | PASS |
| 5 | Undelivered = !isDelivered · Delivered = isDelivered | `_filterPurchases` | `purchaseMatchesStatus` | PASS |
| 6 | Low chips All low · Critical | `_lowFilter` | `setLowFilter` | PASS |
| 7 | Critical = cur ≤ reorder×0.5 | `_filterLowStock` | `lowStockIsCritical` | PASS |
| 8 | Tab Today/Week/All/Low client switch | TabController | `setTab` | PASS |
| 9 | Init tab from `?tab=` | N/A Flutter | `staffPhTabFromQuery` | PASS* |
| 10 | Chip/tab select does not rewrite URL | local setState | local only | PASS |
| 11 | Hint switches on Low tab | two hintTexts | `STAFF_PH_SEARCH_HINT*` | PASS |
| 12 | Empty period / search / low / low-search | `_emptyMessage` | `staffPh*EmptyTitle` | PASS |
| 13 | Purchase haystack ID+supplier+lines | `_filterPurchases` | `purchaseSearchHaystack` | PASS |
| 14 | Low haystack name only | `_filterLowStock` | `lowStockMatchesSearch` | PASS |
| 15 | Row tap / Inform owner / refresh | Yes | **Deferred** BUTTONS | N/A |
| 16 | trade-purchases / low-stock API | Yes | **Deferred** WIRE | N/A |

\*SPA deep-link convenience; Flutter uses TabController only.

**Smoke:** `npm run test:staff-purchase-history-fields` (+ scaffold/layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT inert search/chips/tabs; remove `staffPurchaseHistoryLogic.ts` + this compare + fields script; boards → ask before FIELDS.

**Next (ask first):** BUTTONS — do not start until approved.
