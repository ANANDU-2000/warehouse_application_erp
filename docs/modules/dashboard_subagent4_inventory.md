# Dashboard Subagent 4 — remaining inventory (analysis only)

**Branch:** `ops/dashboard-module`  
**Status:** Inventory only — **do not implement** until approved one satellite at a time.  
**Context:** Staff `/staff/home` WIRE-2a–2f **COMPLETE**. Owner `/home` + activity + breakdown-more COMPARE **PASS**.

## Done (Dashboard landing surfaces)

| Route | Status |
|---|---|
| `/splash` | COMPARE PASS |
| `/login` | COMPARE PASS |
| `/home` | COMPARE PASS |
| `/home/activity` | COMPARE PASS |
| `/home/breakdown-more` | COMPARE PASS |
| `/staff/home` | COMPARE + WIRE-2a–2f PASS |

## Still stub (`DashboardRouteStubPage`) — pick one to start Subagent 4

### Staff nest (from `/staff/home` CTAs)

| Path | Stub title |
|---|---|
| `/staff/settings` | Staff settings (**implement locked** — Settings backend) |
| `/staff/search` | **COMPARE PASS** — [`staff_search_compare.md`](staff_search_compare.md) |
| `/staff/items` | **COMPARE PASS** — [`staff_items_compare.md`](staff_items_compare.md) |
| `/staff/stock` | **COMPARE PASS** — [`staff_stock_compare.md`](staff_stock_compare.md); ask before next stub |
| `/staff/purchase-history` | **FIELDS PASS** — [`staff_purchase_history_fields_compare.md`](staff_purchase_history_fields_compare.md); ask before BUTTONS |
| `/staff/low-stock` | Staff low stock |
| `/staff/activity` | Staff activity (full log) |
| `/staff/deliveries` | Staff deliveries |
| `/staff/receive` · `/staff/receive/:purchaseId` | Receive shipment |
| `/staff/scan` | Staff scan |

### Shared from staff/owner chrome

| Path | Stub title |
|---|---|
| `/notifications` | **COMPARE PASS** — [`notifications_compare.md`](notifications_compare.md); ask next stub |
| `/barcode/scan` | Barcode scan |
| `/barcode/bulk-print` | Bulk print labels |
| `/catalog/item/:itemId` | Catalog item |
| `/catalog/taxonomy` | Categories |
| `/stock` · `/stock/low-stock` · `/stock/reorder` · `/stock/opening-setup` · `/stock/missing-barcodes` | Stock family |
| `/purchase` · `/purchase/new` | Purchases |
| `/reports` | Reports |
| `/settings` | Settings (implement locked) |

### Seq 3 — Users & Roles (partial backend)

| Path | Blocker |
|---|---|
| `/settings/users` · `/settings/users/:userId` | List + profile COMPARE · **Activity WIRE PASS** |

## Other known gaps (not full pages)

| Item | Note |
|---|---|
| Realtime invalidation | No websocket/SSE in new-app; WIRE-2f N/A |
| Profile sheet business title | Name/role only on staff home |
| Mark-arrived / verify write APIs | WIRE-2b deferred writes |
| `/staff/settings` · `/settings` | Settings **implement locked** until Settings backend |

## Next (ask first)

1. **`/staff/purchase-history` BUTTONS** (FIELDS done), **or**  
2. Another Subagent 4 stub from this inventory, **or**  
3. Hold / merge review of `ops/dashboard-module` → `main`.

*(Notifications COMPARE — [`notifications_compare.md`](notifications_compare.md). Staff search COMPARE — [`staff_search_compare.md`](staff_search_compare.md). Staff items COMPARE — [`staff_items_compare.md`](staff_items_compare.md). Staff stock COMPARE — [`staff_stock_compare.md`](staff_stock_compare.md). Staff purchase-history FIELDS — [`staff_purchase_history_fields_compare.md`](staff_purchase_history_fields_compare.md). `/staff/settings` skipped — Settings implement locked.)*
