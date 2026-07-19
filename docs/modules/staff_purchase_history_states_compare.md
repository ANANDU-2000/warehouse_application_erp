# Staff purchase history `/staff/purchase-history` — STATES compare (Step 6)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_purchase_history_page.dart` (`ListSkeleton` / `FriendlyLoadError` / `RefreshIndicator`); `friendly_load_error.dart` (`Tap to retry.`); `staffTradePurchasesHistoryProvider` / `staffLowStockAlertsProvider` keepAlive **2m**.

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff stock COMPARE · Staff purchase-history SCAFFOLD→**WIRE** · **STATES** |
| 🟡 Current | `/staff/purchase-history` **STATES PASS** — ask before COMPARE |
| ⬜ Pending | COMPARE · `/staff/low-stock` · other Subagent 4 stubs |
| ⏸ Deferred | full pack · delivery badge · detail body · staff ₹ redact · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Cold load purchases: ListSkeleton 10 rows × 88 | exact | `STAFF_PH_SKELETON_PURCHASE_*` | PASS |
| 2 | Cold load low: ListSkeleton 8 rows × 72 | exact | `STAFF_PH_SKELETON_LOW_*` | PASS |
| 3 | Purchases error title `_loadErrorMessage` / friendlyApiError | session / Dio map | `mapStaffPhLoadTitle` | PASS |
| 4 | Low error title `Could not load low stock items` | exact | `STAFF_PH_LOW_LOAD_FAILED` | PASS |
| 5 | Subtitle `Tap to retry.` | kFriendlyLoadNetworkSubtitle | `STAFF_PH_RETRY_SUBTITLE` | PASS |
| 6 | Retry busts cache + refetches | invalidate providers | delete cache keys + `retryTick` | PASS |
| 7 | AppBar + search + chips stay during load/error | Column outside Expanded | same | PASS |
| 8 | Skeleton/error only in results Expanded | AsyncValue.when | `showInitialSkeleton` / `showError` | PASS |
| 9 | 2m query-keyed cache | keepAlive 2m | `STAFF_PH_CACHE_TTL_MS` | PASS |
| 10 | No raw exception in UI | FriendlyLoadError | mapped title/subtitle only | PASS |
| 11 | Pull-to-refresh purchases only | RefreshIndicator | touch pull → retry | PASS |
| 12 | Low tab: no RefreshIndicator | none | pull gated `!isLow` | PASS |
| 13 | Pack / delivery / detail / ₹ redact | — | **Deferred** | N/A |

**Smoke:** `npm run test:staff-purchase-history-states` (+ scaffold→wire PASS); `npm run build` PASS.

**Rollback:** Revert STATES commit; restore WIRE string error + text loading; remove `staffPurchaseHistoryLoadSubtitle.ts` + this compare + `test:staff-purchase-history-states`; boards → ask before STATES.

**Next (ask first):** COMPARE — do not start until approved.
