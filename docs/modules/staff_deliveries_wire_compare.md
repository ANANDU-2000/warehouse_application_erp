# Staff deliveries `/staff/deliveries` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:**
- `staff_pending_deliveries_page.dart` — sections + `_PendingDeliveryTile`
- `staff_home_providers.dart` — `staffTradePurchasesForAlertsProvider` → `tradePurchasesRecentSnapshotProvider` (`listTradePurchases(limit: 50)`, `include_lines` default false); `groupStaffDeliverySections`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff activity COMPARE · Staff deliveries SCAFFOLD → **WIRE** |
| 🟡 Current | `/staff/deliveries` **WIRE PASS** — ask before STATES |
| ⬜ Pending | STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | ListSkeleton(6) / FriendlyLoadError polish · receive **body** · barcode **body** · purchase entry · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | List API | `listTradePurchases(limit: 50)` | `fetchTradePurchasesRecent` (`want=50`, `include_lines=false`) | PASS |
| 2 | Group sections | `groupStaffDeliverySections` | same helper in `staffPendingDeliveries.ts` | PASS |
| 3 | Sort | purchaseDate ascending per section | `localeCompare` on `purchaseDate` | PASS |
| 4 | AppBar title | `Pending deliveries` / `(N)` | `staffDelAppBarTitle` | PASS |
| 5 | Arrived title hot | orange when count > 0 | `staffDelSectionTitleHot` + `--hot` | PASS |
| 6 | Row title | supplier or `Supplier` | `staffDelSupplierTitle` | PASS |
| 7 | Row subtitle | `humanId · d MMM · N d pending` | `staffDelRowSubtitle` | PASS |
| 8 | Bags line | `_bagsQtySummary` / em dash | `bagsLine` from lines (— when no lines) | PASS |
| 9 | Trailing | `i/n` + `qty` label | same | PASS |
| 10 | Nav (BUTTONS) | back / scan / receive | unchanged | PASS |
| 11 | Loading / error | ListSkeleton / FriendlyLoadError | basic Loading… + Retry — **STATES** for polish | N/A |
| 12 | Receive / barcode bodies | Full Flutter | stubs (backend blocked) | N/A |

**Smoke:** `npm run test:staff-deliveries-wire` (+ scaffold→buttons PASS); `npm run build` PASS.

**Rollback:** Revert WIRE commit; restore BUTTONS sample rows / remove `staffDeliveriesFormat.ts` + wire script + this compare; boards → ask before WIRE.

**Next (ask first):** STATES — ListSkeleton rowCount 6 + FriendlyLoadError / `loadStateErrorSubtitle`. Do not start until approved.
