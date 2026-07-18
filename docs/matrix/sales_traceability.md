# Sales — Traceability Matrix

**Module:** Sales  
**Queue:** 13  
**Status:** Review PASS (2026-07-18) — **product module absent**; `sale` = stock kind only  
**Branch:** `phase1/sales-analysis`

| Capability | Flutter | API | DB | Notes | Trace |
|---|---|---|---|---|---|
| Sales shell / invoices | none | none | none | No `features/sales` | Absent |
| Sale stock adjust chip | `quick_stock_action_sheet` | physical-update / PATCH | `stock_movements` | kind `sale` | → #11 / #12 |
| Sale ledger filter | `item_ledger_section` | `/{id}/activity` | movements | | → #12 |
| sales-comparison | nav test only? | `POST /reports/sales-comparison` | catalog match | Not a sales ledger | → #14 |
| Backup | — | — | — | | → #15 |
| WhatsApp numbers | — | — | columns dropped 066 | Removed | → #15 |
| PO Share PDF on save | `purchase_saved_sheet` | local PDF | — | Not auto WhatsApp | → #9 / #15 |

## Verify commands (re-run evidence)

- Glob `**/sales/**` under `source-app`: empty
- Features dir: no `sales`
- Routers: no `sales*.py`
- Grep `"sale"`: stock schemas/service/UI + reports sales-comparison

## Anchors

- Prior: `docs/modules/stock-movement.md` (sale kind deferred here)
- Prior: `docs/modules/customers.md` (absence pattern)
- Drop: `source-app/backend/sql/066_drop_scan_and_whatsapp.sql`
