# Module: Sales

**Queue:** 13 of 15  
**Status:** Review PASS (2026-07-18)  
**Scope:** Confirm whether a Sales / billing / outbound invoice module exists in legacy — **it does not** as a product module. `sale` exists only as a **stock adjustment / movement kind**.  
**Source of truth:** `source-app/`  

## Finding

**No dedicated Sales module** in Flutter features, FastAPI routers, or a sales invoice/customer-order schema. Do **not** invent Sales invoices, customers-on-sales, or a sales shell in `new-app/` unless product adds them after legacy.

Outbound stock reduction labeled “Sale” is handled by Inventory adjust UX + Stock Movement ledger (`movement_kind` / `adjustment_type` = `sale`).

---

## Boundary (feature routing for later modules)

| Topic | Source finding | Owns |
|---|---|---|
| Reports BI / dead-fast-slow | `/reports*` | Reports (#14) |
| `POST /reports/sales-comparison` | Catalog **name-match** helper (not a sales ledger) | Reports (#14) |
| Backup / export ZIP | `/settings/backup`, `exports.py` | Settings (#15) |
| Account / supplier WhatsApp numbers | **Dropped** — `066_drop_scan_and_whatsapp` | Settings (#15) — document removed |
| Auto WhatsApp send on PO save | **Absent** | — |
| Optional Share PDF after PO save | `purchase_saved_sheet.dart` / `sharePurchasePdf` | PO (#9) surface; Settings share cite |
| `sale` stock kind / ledger | Inventory + Stock Movement | #11 / #12 (cited here) |

---

## 1. Screen inventory — no Sales shell

| Check | Result | Evidence |
|---|---|---|
| GoRoute `sales*` / `SalesPage` | None as product module | `app_router.dart` — no sales feature routes |
| `features/sales/` | **None** | Feature dirs: admin, analytics, assistant, auth, barcode, broker, catalog, contacts, dashboard, entries, get_started, home, item, notifications, operations, purchase, reports, search, settings, shell, splash, staff, stock, supplier, voice |
| Stock “Sale” chip | Present (Inventory UX) | `quick_stock_action_sheet.dart` `('Sale', 'sale')` |
| Item ledger filter Sale | Present (Stock Movement UI) | `item_ledger_section.dart` |
| Intelligence filter “Sales” | Present (stock intelligence) | `stock_item_intelligence_page.dart` |

---

## 2. API inventory — no Sales router

| Check | Result | Evidence |
|---|---|---|
| Router `sales*.py` | None | `backend/app/routers/` — no sales module |
| Dedicated `/sales` CRUD | None | `docs/18_API_Inventory.md` |
| Stock writers accepting `sale` | Yes | `stock_detail.py` physical-update / PATCH maps `"sale": "sale"` |
| `POST /reports/sales-comparison` | Yes — **Reports** | `reports_trade.py` `compare_sales_lines` — matches external line names to `catalog_items` |

---

## 3. DB inventory — no sales tables

| Check | Result | Evidence |
|---|---|---|
| Table `sales` / `sale_orders` / invoices outbound | None | `docs/20_Database_Analysis.md` — no sales master |
| `stock_movements.movement_kind = 'sale'` | Yes (ledger rows) | Stock Movement (#12) |
| `stock_adjustment_log.adjustment_type = 'sale'` | Yes (projection) | `_adjustment_type_for`: `"sale": "sale"` |

---

## 4. Sale kind touchpoints (not a Sales module)

| Layer | Behavior | Source |
|---|---|---|
| Schema | `PhysicalStockUpdateIn.adjustment_type` includes `"sale"` | `schemas/stock.py` |
| Service | `movement_kind` `"sale"` → adjustment_type `"sale"`; activity type map includes `"sale"` | `stock_movement_service.py` |
| API | physical-update / PATCH map adj → kind `"sale"`; reason label “Sale adjustment” | `stock_detail.py` |
| Flutter adjust | Chip Sale → sends `sale` | `quick_stock_action_sheet.dart` |
| Flutter ledger | Filter Sale matches kind containing `sale` or `usage` | `item_ledger_section.dart` |
| Flutter intelligence | Type filter `Sales` ⇒ `type == 'sale'` | `stock_item_intelligence_page.dart` |
| Flutter verify card | Label `SALE` for type `sale` | `item_physical_verification_card.dart` |

---

## 5. Near-misses (do not reclassify as Sales module)

| Near-miss | What it is | Belongs to |
|---|---|---|
| `POST /reports/sales-comparison` | Fuzzy catalog name match for imported lines | Reports (#14) |
| Purchase PDF / Share after save | Trade purchase share sheet | PO (#9) / Settings share |
| `EntrySource.whatsapp` enum | Legacy enum value; WhatsApp columns dropped in 066 | Settings (#15) — removed feature |
| README “WhatsApp summary to accounts” | Stale vs schema drop — verify under Settings | Settings (#15) |
| Customers (#8) | Already absent — no buyer master for sales docs | Customers |

---

## 6. Capability flags

| Capability | UI | API | DB | Notes |
|---|---|---|---|---|
| Sales order / invoice CRUD | No | No | No | Absent |
| Sales list / shell | No | No | No | Absent |
| Customer on sales docs | No | No | No | No customer entity |
| Stock reduction labeled Sale | Yes (stock) | Yes (stock) | movements | Inventory + Movement |
| Sales-comparison report helper | Unknown Flutter page | Yes | catalog | → Reports |

---

## 7. Migration implication

- No Sales screens, dedicated APIs, or sales tables to port as a module.
- Preserve `sale` as a valid stock adjustment/movement kind when migrating Inventory + Stock Movement.
- Do not build a Sales ERP submodule in `new-app/` during Phase 1–4 unless product explicitly expands scope.
- Defer Reports / Settings / PO Share PDF deep extracts to #14–#15 (and PO gap if needed).

---

## 8. Unknowns

1. Whether historical `sale` movement rows must be migrated 1:1 (assume yes with Stock Movement — needs data cutover plan later).  
2. Whether any Flutter UI still calls `sales-comparison` beyond nav tests — Unknown; belongs to Reports.  
3. Stale README WhatsApp claims vs dropped columns — resolve under Settings (#15).

---

## 9. Review PASS/FAIL

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | No Flutter `features/sales` / SalesPage | PASS | features dir list; router |
| 2 | No sales API/router | PASS | routers list |
| 3 | No sales tables | PASS | DB analysis |
| 4 | Sale kind touchpoints listed | PASS | §4 |
| 5 | Near-misses / boundary | PASS | §Boundary, §5 |
| 6 | No invention of Sales module | PASS | capability flags |

**Verdict:** Review **PASS** (absence of Sales product module; sale kind documented). **Stop.** Next: Reports analysis only.

---

**Primary sources:** features dir listing, `app_router.dart`, `quick_stock_action_sheet.dart`, `stock_detail.py`, `stock_movement_service.py`, `schemas/stock.py`, `reports_trade.py` (`/sales-comparison`), `066_drop_scan_and_whatsapp.sql`, `docs/modules/customers.md` (pattern), `docs/modules/stock-movement.md` §Boundary.
