# Stock Movement — Traceability Matrix

**Module:** Stock Movement (Activity / ledger / audit feed)  
**Queue:** 12  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/stock-movement-analysis`

| Capability | Flutter | API | DB | Auth | Trace |
|---|---|---|---|---|---|
| Activity / Changes tab | `StockChangesTab` | `GET /stock/audit/recent` | `stock_adjustment_log` | membership | Complete |
| Route aliases | `/stock/movement\|changes\|today-feed` | same | — | — | Complete |
| Item ledger | `ItemLedgerSection` | `GET /stock/{id}/activity` | `stock_movements` (+ staff logs) | membership | Complete |
| Staff purchases list | `StaffPurchaseLogsPage` | `GET /staff-purchases` | `staff_purchase_logs` | membership | Complete |
| Staff purchase create | quick / other flows | `POST /staff-purchases`, quick-purchase | movements + purchase log | stock_edit | Complete |
| Variances today | Home cards | `GET /variances/today` | notifications | membership | Complete |
| Movement summary | reports providers | `GET /reports/movement-summary` | adjustment_log agg | membership | Complete (API only) |
| Ledger write engine | N/A (side effect) | `apply_stock_movement` | `stock_movements` + projection | callers | Complete |
| Physical-count observation | — | — | — | — | → #11 |
| GR commit-stock | — | — | `delivery_*` kinds only | — | → #10 |
| Reports BI chrome | — | — | — | — | → #14 |
| Sale domain UX | — | — | `sale` kind cite | — | → #13 |

## Source anchors

- Flutter: `stock_changes_tab.dart`, `stock_page.dart`, `item_ledger_section.dart`, `stock_providers.dart`, `api_read_snapshots.dart`
- Routers: `stock_audit.py`, `stock_detail.py` (activity + writers), `stock_ops.py` (quick-purchase), `reports_trade.py` (movement-summary)
- Service: `stock_movement_service.py`, `stock_change_guard.py`
- Model: `stock_movement.py`
- Prior: `docs/modules/inventory.md` §Boundary, `docs/modules/goods-receipt.md` ledger cite
