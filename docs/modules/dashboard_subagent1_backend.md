# Dashboard — Subagent 1 (Backend) report

**Branch:** `ops/dashboard-module`  
**Stage:** Subagent 1 only — **STOP** before Subagent 2  
**Spec:** [`dashboard.md`](dashboard.md)

## Endpoints

| Path | Matches API inventory? | Test written? |
|---|---|---|
| `GET /v1/businesses/{id}/dashboard?month=` | Yes (`dashboard.py`) | Yes |
| `GET /v1/businesses/{id}/reports/home-overview` | Yes (`reports_trade.py`) | Yes |
| `GET /v1/businesses/{id}/reports/trade-dashboard-snapshot` | Yes (shared builder) | Yes |

## Business logic

| Calculation | Source file:function | Ported? | Test? |
|---|---|---|---|
| Line amount (line_total / weight / unit) | `trade_query.py:trade_line_amount_expr` | Yes (T-SQL) | Indirect via mocks |
| Line profit | `trade_query.py:trade_line_profit_expr` | Yes | Indirect |
| Pending = max(0, purchase−paid) | `dashboard.py:_compute_month_dashboard_payload` | Yes | Yes |
| Category name heuristic | `dashboard.py` cat_map | Yes | Yes |
| Snapshot profit / profit_percent | `reports_trade.py:_compute_trade_dashboard_snapshot_payload` | Yes | Yes |
| Inventory summary value/units | `stock_inventory.py:compute_inventory_summary` | Yes (shell_bundle) | Yes |
| Unit kg/bags/boxes/tins | `trade_query.py:trade_line_*_expr` | Yes | Indirect |

## Partial / Unknown (needs your decision)

1. **`item_slices` / `suppliers` / `recommendations` / `subcategories` / portfolio consistency** — still `[]` / null. Full helpers live in `trade_mapping` + `_fetch_trade_*_breakdown_rows`. Port with Purchases module or extend Subagent 1.
2. **`home_operational` stock chips / warehouse_alerts / low_stock_top / notifications_unread** — stubbed (zeros/empty) except delivery pending/received counts from trade. Full port needs Stock + Notifications services.
3. **ETag / 10s read budget** — Cache-Control max-age 60 set; FastAPI ETag + `run_read_budget_bounded` not fully mirrored (month endpoint uses try/catch → degraded).
4. **Splash WIRE** — deferred by operator choice; entry still shows BUTTONS error chrome.

## Files changed (backend)

- `src/services/tradeLineSql.ts`, `dashboard.service.ts`, `homeOverview.service.ts`
- `src/repositories/dashboard.repository.ts`, `homeOverview.repository.ts`
- `src/controllers/dashboard.controller.ts`, `reports.controller.ts`
- `src/routes/dashboard.routes.ts`, `reports.routes.ts`
- `src/app.ts`, `src/index.ts`, `repositories/index.ts`
- `tests/dashboard/dashboard.test.ts`

## Rollback

Delete branch `ops/dashboard-module` or revert its commits; `main` untouched until merge approve.
