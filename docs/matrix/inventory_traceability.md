# Inventory — Traceability Matrix

**Module:** Inventory (stock list / adjust / audit)  
**Queue:** 11  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/inventory-analysis`

| Capability | Flutter | API | DB | Auth | Trace |
|---|---|---|---|---|---|
| Stock list | `StockPage` list tab | `GET /stock/list*` | catalog stock cols | membership | Complete |
| Low stock | `LowStockDashboardPage` | low-stock summary/ops | — | membership | Complete |
| Reorder queue | `ReorderListPage` | `/stock/reorder*` | `reorder_list` | membership | Complete |
| Opening setup | `OpeningStockSetupPage` | opening-stock / setup | opening_* locked | owner POST | Complete |
| Physical count | quick sheet Physical | `POST …/physical-count` | `stock_physical_counts` | stock_edit | Complete |
| System adjust | quick sheet System | PATCH / physical-update | current_stock + movements | stock_edit | Complete |
| Stock audits | audit-session/summary | `/stock-audits*` | stock_audits | stock_edit | Complete |
| Missing labels | `StockMissingLabelsPage` | list filters + barcode | — | stock_edit / print | Complete |
| Activity/changes | `StockChangesTab` | audit feed | stock_movements | — | → #12 |
| Commit stock | — | — | — | — | → #10 |

## Source anchors

- Routers: `stock_list.py`, `stock_detail.py`, `stock_ops.py`, `stock_audits.py`; boundary `stock_audit.py`
- Services: `stock_inventory.py` (`stock_status`), `stock_movement_service.py`, `stock_audit_service.py`
- Flutter: `features/stock/presentation/*`, barcode audit pages
- Prior: `docs/modules/goods-receipt.md` §Boundary
