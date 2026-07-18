# Staff `/staff/home` — WIRE-2b compare (Pending delivery cards)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_home_pending_delivery_cards.dart`; `staffPendingDeliveriesProvider` / `groupStaffDeliverySections`; `tradePurchasesRecentSnapshotProvider` (limit 50)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/trade-purchases?limit=50` | Snapshot | `fetchTradePurchasesRecent` | PASS |
| 2 | Client group + oldest-first pending | Yes | `staffPendingDeliveriesFromRows` | PASS |
| 3 | Hide section when empty | `if (pendingDeliveries > 0)` | Same | PASS |
| 4 | Max 3 cards + View all N | Yes | Same | PASS |
| 5 | Title itemsSummary / humanId | Yes | Same | PASS |
| 6 | Subtitle qty · status label | Exact labels | Exact | PASS |
| 7 | Mark arrived / Verify visibility | Status rules | Same | PASS |
| 8 | View all / CTAs → `/staff/receive` | Yes | navigate stub | PASS |
| 9 | Live mark-arrived / verify sheet APIs | Yes | **Deferred** (no write APIs) | N/A |
| 10 | Offline queue | Yes | Deferred | N/A |
| 11 | Not `home-overview` | Staff never | No call | PASS |

**Smoke:** `npm run test:staff-home-wire2b`  
**Rollback:** Revert WIRE-2b commit; restore empty pending slot; remove receive stubs if unused.  
**Next:** Staff WIRE-2c — Shift today strip (`activity-log` + `audit/feed`). Stop until approved.
