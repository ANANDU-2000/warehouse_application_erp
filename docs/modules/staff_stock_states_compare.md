# Staff stock `/staff/stock` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `stock_page.dart` (`ListSkeleton` / `FriendlyLoadError` / `RefreshIndicator`); `friendly_load_error.dart`; `load_state_error.dart`; `kStockListCacheTtl` 3m (`surface_refresh_policy.dart`); `StockOperationalTopBar.isReloading`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff items COMPARE · Staff stock SCAFFOLD→**WIRE** · **STATES** · COMPARE |
| 🟡 Current | Staff stock **COMPARE PASS** — ask before next stub |
| ⬜ Pending | `/staff/purchase-history` · other Subagent 4 stubs |
| ⏸ Deferred | delivery-indicator-counts · Activity feed · period purchased · shell-bundle · subcategory/supplier pickers |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold load: ListSkeleton 12 rows (no chips/search/table) | `ListSkeleton(rowCount: 12)` | `showInitialSkeleton` + 12 rows | PASS |
| 2 | Error: FriendlyLoadError `Unable to load stock` | exact | `STAFF_STOCK_UNABLE` | PASS |
| 3 | Auth: `Sign in to load stock` + warehouse subtitle | exact | `STAFF_STOCK_SIGN_IN` / `_SUB` | PASS |
| 4 | Default subtitle `Tap to retry.` (+ HTTP map) | kFriendlyLoadNetworkSubtitle / load_state_error | `mapStaffStockLoadSubtitle` | PASS |
| 5 | Retry busts cache + refetches | clear etag + invalidate | delete cache key + `retryTick` | PASS |
| 6 | List chrome only when data (or empty success) | `data != null` body | `showListChrome` | PASS |
| 7 | AppBar stays during load/error | Scaffold appBar | same | PASS |
| 8 | isReloading thin bar when data + loading | `StockOperationalTopBar.isReloading` | `data-slot="reloading"` | PASS |
| 9 | Debounce progress while typing | LinearProgressIndicator | `data-slot="debounceProgress"` | PASS |
| 10 | 3m query-keyed cache | `kStockListCacheTtl` | `STAFF_STOCK_CACHE_TTL_MS` | PASS |
| 11 | No raw exception in UI | FriendlyLoadError | mapped title/subtitle only | PASS |
| 12 | Pull-to-refresh | RefreshIndicator | touch pull → retry | PASS |
| 13 | Delivery / Activity / period purchased | providers | **Deferred** | N/A |

**Smoke:** `npm run test:staff-stock-states` (+ scaffold→wire PASS); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE string error + inline results loading; remove `staffStockLoadSubtitle.ts` + this compare + `test:staff-stock-states`; boards → ask before STATES.

**Next (ask first):** COMPARE done — [`staff_stock_compare.md`](staff_stock_compare.md). Ask before next Subagent 4 stub.
