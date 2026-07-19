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
| `/staff/settings` | Staff settings |
| `/staff/search` | Staff search |
| `/staff/items` | Staff gallery |
| `/staff/stock` | Staff stock |
| `/staff/purchase-history` | Purchase history |
| `/staff/low-stock` | Staff low stock |
| `/staff/activity` | Staff activity (full log) |
| `/staff/deliveries` | Staff deliveries |
| `/staff/receive` · `/staff/receive/:purchaseId` | Receive shipment |
| `/staff/scan` | Staff scan |

### Shared from staff/owner chrome

| Path | Stub title |
|---|---|
| `/notifications` | Notifications (full page; bell badge already WIRE-2e) |
| `/barcode/scan` | Barcode scan |
| `/barcode/bulk-print` | Bulk print labels |
| `/catalog/item/:itemId` | Catalog item |
| `/catalog/taxonomy` | Categories |
| `/stock` · `/stock/low-stock` · `/stock/reorder` · `/stock/opening-setup` · `/stock/missing-barcodes` | Stock family |
| `/purchase` · `/purchase/new` | Purchases |
| `/reports` | Reports |
| `/settings` | Settings |

### Seq 3 — Users & Roles (partial backend)

| Path | Blocker |
|---|---|
| `/settings/users` · `/settings/users/:userId` | List COMPARE PASS; profile **WIRE PASS** — STATES next |

## Other known gaps (not full pages)

| Item | Note |
|---|---|
| Realtime invalidation | No websocket/SSE in new-app; WIRE-2f N/A |
| Profile sheet business title | Name/role only on staff home |
| Mark-arrived / verify write APIs | WIRE-2b deferred writes |

## Next (ask first)

1. **User profile STATES** (`/settings/users/:userId` page loop step 6), or  
2. One **satellite** from the stub tables above (start page loop), or  
3. Hold / merge review of `ops/dashboard-module` → `main`.

*(Profile WIRE done — see [`user_profile_wire_compare.md`](user_profile_wire_compare.md).)*
