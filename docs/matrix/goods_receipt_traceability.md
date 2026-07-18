# Goods Receipt — Traceability Matrix

**Module:** Goods Receipt (delivery / receive / commit)  
**Queue:** 10  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/goods-receipt-analysis`

| Capability | Flutter | API | DB / stock | Auth | Trace |
|---|---|---|---|---|---|
| Pending deliveries | `StaffPendingDeliveriesPage` | list + `GET /delivery-pipeline` | delivery_status | staff shell | Complete |
| Receive shipment | `StaffReceiveShipmentPage` | arrive + verify | line received/damaged | stock_edit | Complete |
| Dispatch | detail banner | `POST …/dispatch` | dispatched_at | owner/manager/super_admin | Complete |
| Mark arrived | banner (staff) | `POST …/arrive` | arrived_at | stock_edit | Complete |
| Verify sheet | `staff_verification_sheet` | `POST …/verify` + damage create | staff_verified/partial | stock_edit | Complete |
| Commit stock | `purchase_stock_commit_flow` | `POST …/commit-stock` | stock_committed + movements | role + stock_edit | Complete |
| Auto-commit | after verify (server) | try_auto_commit | same | — | Complete |
| Unit setup block | preflight + sheet | `UNIT_SETUP_REQUIRED` | — | — | Complete |
| Revert | banner | `PATCH …/delivery` | revoke movements | stock_edit | Complete |
| Damage report | sheets/section | nested + `/damage-reports` | `purchase_damage_reports` | stock_edit / owner patch | Complete |
| Stock ledger UI | — | — | `delivery_receive` | — | → Stock Movement |
| PO create/wizard | — | — | — | — | → Purchase Orders |

## Source anchors

- Router: `trade_purchases.py` GR endpoints; `damage_reports.py` standalone
- Services: `trade_purchase_service.py` (transitions), `stock_inventory.apply_confirmed_purchase_stock`, `purchase_damage_service`
- Flutter: `staff_pending_deliveries_page.dart`, `staff_receive_shipment_page.dart`, `purchase_detail_delivery_banner.dart`, `staff_verification_sheet.dart`, `purchase_stock_commit_flow.dart`
- Models: `DeliveryStatus` in `trade_purchase_models.dart`
- Prior: `docs/modules/purchase-orders.md` §Boundary
