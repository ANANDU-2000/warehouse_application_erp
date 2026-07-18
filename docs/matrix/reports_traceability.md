# Reports — Traceability Matrix

**Module:** Reports (BI shell / trade analytics / stock intel)  
**Queue:** 14  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/reports-analysis`  
**Also:** Checklist **1.10 Reports inventory** ✅

| Capability | Flutter | API | DB / source | Auth | Trace |
|---|---|---|---|---|---|
| Shell 4 tabs | `ReportsShellPage` | purchases + breakdowns | trade_* | membership / role on summary | Complete |
| Period / filters | period bar + filter sheet | query dates | — | — | Complete |
| Overview KPIs/charts | overview tab | trade-summary, daily-profit, ops | trade + ops | mixed | Complete |
| Items list | items tab | client agg + trade-items | trade lines | membership | Complete |
| Purchases ranking | purchases tab | period-comparison | trade | membership | Complete |
| Stock dead/fast/slow | stock tab + redirects | `GET …/operations/reports/summary` | catalog + usage + adj log | membership | Complete |
| Item drill | `ReportsItemReportPage` | `GET …/reports/item/{id}` | catalog + lines | membership | Complete |
| Purchase drill | `ReportsPurchaseReportPage` | trade purchase | trade | membership | Complete |
| In-shell CSV/PDF | shell export | local | — | no export_access check | Complete |
| movement-summary | orphan provider | GET | adjustment_log | membership | Orphan UI |
| activity-feed | none | GET | adj + purchases | membership | Orphan |
| sales-comparison | none | POST | catalog match | membership | Orphan |
| Saved views | none | report-views CRUD | `report_saved_views` | own user | Orphan UI |
| home-overview | Home | GET | snapshot | membership | → #2 |
| Backup / exports hub | — | — | — | — | → #15 |

## Source anchors

- Flutter: `features/reports/**`, reports/ops/analytics providers, `app_router.dart`
- Backend: `reports_trade.py`, `report_views.py`, `operations.py`
- Prior deferrals: `docs/modules/inventory.md`, `stock-movement.md`, `sales.md`, `purchase-orders.md`
- API inventory: `docs/18_API_Inventory.md` reports sections
