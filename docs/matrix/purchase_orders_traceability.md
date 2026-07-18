# Purchase Orders — Traceability Matrix

**Module:** Purchase Orders (trade purchases)  
**Queue:** 9  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/purchase-orders-analysis`

| Capability | Flutter | API | DB / service | Auth | Trace |
|---|---|---|---|---|---|
| Purchase history | `PurchaseHomePage` | `GET /trade-purchases` | `trade_purchases` | membership | Complete |
| New / edit wizard | `PurchaseEntryWizardV2` + steps | POST/PUT | lines + totals | create / edit | Complete |
| Party step | `purchase_party_step` | body supplier/broker | FKs | — | Complete |
| Terms | `purchase_terms_only_step` | payment/commission/discount | header cols | — | Complete |
| Line entry | `PurchaseItemEntrySheet` | lines[] + preview | `trade_purchase_lines` | — | Complete |
| Review / save | review step | validate + create/update | `compute_totals` | — | Complete |
| Local WIP draft | Hive + resume row | — | — | — | Complete |
| Server draft | — | GET/PUT/DELETE `/draft` | `trade_purchase_drafts` | membership | Complete |
| Preview lines | providers | `POST /preview-lines` | line_totals | membership | Complete |
| Validate | wizard | `POST /validate` | — | membership | Complete |
| Duplicate check | 409 UX | check-duplicate + create | 24h window | — | Complete |
| Next human id | invoice preview | `GET /next-human-id` | `PUR-YYYY-NNNN` | membership | Complete |
| Last defaults | item sheet | `GET /last-defaults` | — | membership | Complete |
| Detail | `PurchaseDetailPage` | `GET /{id}` | — | membership | Complete |
| Mark paid | action bar / swipe | PATCH payment / mark-paid | paid_amount | `purchase_edit` | Complete |
| Soft delete | list/detail | `DELETE /{id}` | status deleted | owner/manager/super_admin | Complete |
| Cancel API | rare in UI | `POST /{id}/cancel` | cancelled | `purchase_edit` | Documented |
| Delivery / commit | banner surface | dispatch…commit-stock | delivery_* cols | stock_edit / roles | → Goods Receipt |
| Staff list | blocked | — | — | → `/staff/deliveries` | Boundary |
| Purchase report | — | — | — | — | → Reports |

## Source anchors

- Router: `source-app/backend/app/routers/trade_purchases.py`
- Schemas: `source-app/backend/app/schemas/trade_purchases.py`
- Services: `trade_purchase_service.py`, `line_totals_service.py`, `purchase_status.py`, `trade_preview_service.py`
- Flutter: `features/purchase/presentation/*`
- Docs: `docs/18_API_Inventory.md` trade_purchases; `docs/20_Database_Analysis.md` trade_* tables
