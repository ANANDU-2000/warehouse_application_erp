# User profile Activity tab — WIRE compare

**Branch:** `ops/dashboard-module`  
**Sources:** `user_activity_tab.dart`; `user_profile_providers.dart`; `user_activity_timeline.dart`; `hexa_api.dart` listUser*; backend users + activity-log  
**UI:** [`UserActivityPanel.tsx`](../../new-app/frontend/src/features/users/UserActivityPanel.tsx) · [`UserActivityTimeline.tsx`](../../new-app/frontend/src/features/users/UserActivityTimeline.tsx)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Profile SCAFFOLD→COMPARE · **Activity WIRE** |
| 🟡 Current | Activity WIRE PASS — ask before Subagent 4 |
| ⬜ Pending | Subagent 4 satellites |
| ⏸ Deferred | Merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Feed `GET …/activity-log?user_id=&days=30&per_page=100` | Yes | `listUserActivity` | PASS |
| 2 | Stock `GET …/stock-adjustments` | Yes | `listUserStockAdjustments` | PASS |
| 3 | Purchases `GET …/purchases` | Yes | `listUserPurchases` | PASS |
| 4 | Items `GET …/created-items` | Yes | `listUserCreatedItems` | PASS |
| 5 | Ledger `GET …/ledger?grouped=true` | Yes | `listUserLedgerGrouped` | PASS |
| 6 | Map stock → `stock_updated` + qty line | Yes | same | PASS |
| 7 | Map purchases → `purchase_created` + human_id · status | Yes | same | PASS |
| 8 | Map items → `item_created` + name | Yes | same | PASS |
| 9 | Map ledger today/yesterday/this_week → rows | Yes | same | PASS |
| 10 | Timeline day groups Today/Yesterday/weekday/date | Yes | `groupActivityByDay` | PASS |
| 11 | Friendly action title (`_` → Title Case) | Yes | `friendlyActionType` | PASS |
| 12 | Empty copy per section | exact | `USER_PROFILE_ACTIVITY_EMPTY_*` | PASS |
| 13 | Feed error = userFacingError, subtitle null | Yes | `mapUserFacingError` | PASS |
| 14 | Other sections FriendlyLoadError default + Tap to retry | Yes | default message + subtitle | PASS |
| 15 | Loading = Center CircularProgressIndicator | Yes | tab spinner | PASS |
| 16 | Stock/items timeline time from API `updated_at` | Flutter reads `created_at` (absent on API) | bind `updated_at` → row `created_at` | PASS* |

\*Matches real API fields (`CreatedItemOut` / `StockAdjustmentOut` use `updated_at`); Flutter key mismatch would leave dates empty.

**Smoke:** `npm run test:user-profile-activity-wire` (+ prior profile smokes); `npm run build` PASS.

**Rollback:** Revert Activity WIRE commit; restore empty activity panel; remove panel/timeline/API activity helpers + this compare + script; boards → ask before activity WIRE.

**Next (ask first):** one **Subagent 4 satellite** from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md).
