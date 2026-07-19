# Staff purchase history `/staff/purchase-history` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_purchase_history_page.dart` row `onTap` · `_StaffLowStockRow` · `purchase_history_grouping.dart` · `StaffPurchaseHistoryRow` · `line_display.purchaseHistoryItemHeadline`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff stock COMPARE · Staff purchase-history SCAFFOLD → **WIRE** |
| 🟡 Current | `/staff/purchase-history` **WIRE PASS** — ask before STATES |
| ⬜ Pending | STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | FriendlyLoadError map · RefreshIndicator · full pack · delivery badge · staff amount redact · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Purchase row tap → `/staff/purchase-history/:id` | `context.push` | `openPurchase` + `staffPhDetailPath` | PASS |
| 2 | Low row tap → `/staff/low-stock` | `context.push` | `openLowStock` | PASS |
| 3 | Inform owner → `/staff/low-stock` | TextButton | `data-action="inform-owner"` | PASS |
| 4 | Date group Today / Yesterday / This week / MMM | `purchaseHistoryDateGroupLabel` | same | PASS |
| 5 | `buildGroupedPurchaseHistory` sort | Flutter | same | PASS |
| 6 | Supplier UPPER · headline · humanId · broker | StaffPurchaseHistoryRow | row chrome | PASS |
| 7 | Status chip labels (Pending/Paid/…) | `PurchaseStatus.label` | `purchaseStatusLabel` | PASS |
| 8 | Low meta `cur / reorder unit` | `formatStockQtyNumber` | `formatStaffPhQtyNumber` | PASS |
| 9 | Critical icon color `#DC2626` | `_StaffLowStockRow` | `--critical` | PASS |
| 10 | Full pack summary (bags/kg/box/tin) | `purchaseHistoryPackSummary` | **Deferred** `data-deferred` | N/A |
| 11 | PurchaseDeliveryBadge | Yes | **Deferred** `data-deferred` | N/A |
| 12 | RefreshIndicator pull | Yes | **Deferred** STATES | N/A |
| 13 | trade-purchases / low-stock API fill | Yes | **Deferred** WIRE | N/A |
| 14 | Detail page content | `StaffPurchaseOrderDetailPage` | route stub until detail slice | N/A |

**Smoke:** `npm run test:staff-purchase-history-buttons` (+ scaffold→fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS empty-only results; remove grouping module + this compare + script; boards → ask before BUTTONS.

**Next (ask first):** WIRE done — [`staff_purchase_history_wire_compare.md`](staff_purchase_history_wire_compare.md). Ask before STATES.
