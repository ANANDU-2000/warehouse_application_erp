# Customers — Traceability Matrix

**Module:** Customers  
**Queue:** 8  
**Status:** Review PASS (2026-07-18) — **module absent in source**  
**Branch:** `phase1/customers-analysis`

| Capability | Flutter | API | DB | Notes | Trace |
|---|---|---|---|---|---|
| Customer master | none | none | none | No feature/router/table | Absent |
| Customer routes | none | — | — | No `customer*` in `app_router.dart` | Absent |
| Customer CSV seed | — | `seed_suppliers_from_csv.py` | `suppliers` | File named Customer List → **suppliers** | Near-miss |
| Purchase party | `purchase_party_step.dart` | trade purchases | suppliers/brokers | Not a customer entity | → PO / Suppliers |
| sales-comparison | reports UI may call | `POST /reports/sales-comparison` | — | Name match helper | → Reports |
| retail_packet | unit engine | stock profile | — | Packaging mode | → Units |

## Verify commands (re-run evidence)

- Grep `source-app` `*.py`/`*.dart`: only hits in `seed_suppliers_from_csv.py`
- Glob `**/customer*`: only `data/supplers/Customer List.csv`
- Features dir: no `customer*`
- Routers: no `customer*.py`
- `docs/18_API_Inventory.md` / `docs/20_Database_Analysis.md`: no customer

## Anchors

- Prior note: `docs/modules/suppliers.md` (Customers absent)
- Seed: `source-app/backend/scripts/seed_suppliers_from_csv.py`
- CSV: `source-app/data/supplers/Customer List.csv`
