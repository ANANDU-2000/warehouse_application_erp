# Traceability matrix — Dashboard

Status: `Missing` | `Complete` (spec documented) | `Needs Review`

Future React paths are placeholders only.

| Legacy Feature | Future React (placeholder) | Future API | DB Tables | Validation / Rules | Status |
|---|---|---|---|---|---|
| Owner home shell `/home` | `new-app/frontend/src/features/home/HomePage` | `GET …/reports/home-overview` | trade_*, catalog_items, notifications | shell_bundle+compact; period from/to | Complete |
| Period filter chips | `…/home/PeriodFilter` | drives overview query | — | default month rolling; sync reports | Complete |
| Alert chips low/pending/opening/out | `…/home/AlertChips` | operational bundle / stock counts | catalog_items, trade_purchases | hide when 0 | Complete |
| KPI grid 4 tiles | `…/home/KpiGrid` | overview + pipeline + inventory | same | desktop 4 / mobile 2 cols | Complete |
| Delivery pipeline card | `…/home/DeliveryPipelineCard` | delivery-pipeline / bundle | trade_purchases | deep link filters | Complete |
| Purchase control center | `…/home/PurchaseControlCenter` | overview summary | trade_* | profit if owner dashboard | Complete |
| Owner tools 9 actions | `…/home/OwnerQuickActions` | navigation only | — | badge low stock | Complete |
| Activity feed 3 rows + `/home/activity` | `…/home/ActivityFeed` | trade-purchases + audit + staff-purchases | trade_*, stock logs | period filter | Complete |
| Breakdown more page | `…/home/BreakdownListPage` | snapshot slices | trade_*, categories | tab query | Complete |
| Analytics ring / ranked / comparison | `…/home/Analytics*` | overview/snapshot | trade_* | widgets present | Complete |
| Non-owner quick actions on `/home` | `…/home/QuickActionsGrid` | — | — | !sessionHasOwnerDashboard | Complete |
| Staff home `/staff/home` | `…/staff/StaffHomePage` | me/profile + stock/activity/pipeline | various | focus prefs | Complete |
| Staff focus filter | `…/staff/FocusPrefs` | local SharedPreferences | — | gates tools/attention | Complete |
| Staff pending deliveries | `…/staff/PendingDeliveryCards` | delivery-pipeline | trade_purchases | show if count>0 | Complete |
| Month `GET /dashboard` API | (no Flutter home caller) | `GET …/dashboard?month=` | trade_purchases, lines | calendar month; TTL 22s | Complete |
| Dead `features/dashboard` re-export | do not create | `/dashboard` redirect | — | keep redirect only | Complete |
| Home-overview degraded mode | error/empty UX | degraded flags | — | read budget | Complete |
| Refresh 60s + pull + ETag | refresh hooks | Cache-Control / ETag | — | root `/home` only for poll | Complete |

## Spec evidence

- [`docs/modules/dashboard.md`](../modules/dashboard.md)
