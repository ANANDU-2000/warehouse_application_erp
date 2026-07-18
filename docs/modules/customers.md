# Module: Customers

**Queue:** 8 of 15  
**Status:** Review PASS (2026-07-18)  
**Scope:** Confirm whether a customer master exists in legacy — **it does not**  
**Source of truth:** `source-app/`  

## Finding

**No Customers module** in Flutter, FastAPI, or PostgreSQL schema. Do **not** invent Customers UI/API/tables in `new-app/` unless product adds them after legacy.

Suppliers analysis already noted absence (`docs/modules/suppliers.md`); this doc is the formal queue #8 gate with re-verified evidence.

---

## 1. Screen inventory — empty

| Check | Result | Evidence |
|---|---|---|
| GoRoute `customer*` | None | `app_router.dart` — no customer path (contacts/supplier/broker only) |
| `features/customer*` | None | Feature dirs: admin, analytics, assistant, auth, barcode, broker, catalog, contacts, dashboard, entries, get_started, home, item, notifications, operations, purchase, reports, search, settings, shell, splash, staff, stock, supplier, voice |

---

## 2. API inventory — empty

| Check | Result | Evidence |
|---|---|---|
| Router `customer*.py` | None | `backend/app/routers/` — auth, catalog, contacts, dashboard, damage_reports, exports, health, media, me, notifications, operations, public_items, realtime, report_views, reports_trade, search, stock_audits, trade_purchases, users |
| `/customers` endpoints | None | `docs/18_API_Inventory.md` — no customer rows; contacts = `/suppliers`, `/brokers`, `/contacts/*` |
| Grep `customer` in `*.py` / `*.dart` (app code) | Only seed script comments | `seed_suppliers_from_csv.py` (imports **suppliers**) |

---

## 3. DB inventory — empty

| Check | Result | Evidence |
|---|---|---|
| Table `customers` | None | `docs/20_Database_Analysis.md` — no `customer` match |
| ORM `__tablename__ = "customers"` | None | Models under `contacts.py` = `suppliers`, `brokers` only |

---

## 4. Near-misses (do not reclassify as Customers)

| Near-miss | What it is | Belongs to |
|---|---|---|
| Purchase “party” (`purchase_party_step.dart`, party suggest fields) | Supplier + broker on purchase wizard | Purchase Orders (#9) / Suppliers (#7) |
| `data/supplers/Customer List.csv` | Misnamed CSV; seeded as **suppliers** | Suppliers — `seed_suppliers_from_csv.py` |
| `POST /reports/sales-comparison` | Catalog name-match report helper | Reports (#14) |
| `retail_packet` stock mode | Packaging / unit profile | Units (#6) |

---

## 5. Capability flags

| Capability | UI | API | DB | Notes |
|---|---|---|---|---|
| Customer master CRUD | No | No | No | Absent |
| Customer list / search | No | No | No | Absent |
| Customer on sales docs | No | No | No | No sales customer entity found |

---

## 6. Boundary

| Module | Owns |
|---|---|
| Suppliers (#7) | Contacts: suppliers + brokers |
| Purchase Orders (#9) | Trade purchase party = supplier/broker |
| Sales (#13) | Only if outbound buyer masters appear later in source — **not present now** |
| Customers (#8) | **Nothing to port** |

---

## 7. Migration implication

- No Customers screens, APIs, or tables to migrate from legacy.
- Do not create placeholder Customers in `new-app/` during Phase 1–4 unless product explicitly adds scope.
- Seed file name “Customer List” must not drive a Customers feature — it maps to suppliers.

---

## 8. Unknowns

None material after grep. Any future “buyer” string in Sales should be analyzed under Sales (#13), not backfilled into this module without source evidence.

---

## 9. Review PASS/FAIL

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | No Flutter customer routes/features | PASS | `app_router.dart`; features dir list |
| 2 | No customer API/router | PASS | routers list; API inventory |
| 3 | No customers table/model | PASS | DB analysis; contacts models |
| 4 | Near-misses documented | PASS | §4 |
| 5 | No invention of module | PASS | capability flags all No |
| 6 | Boundary to Suppliers/PO/Sales | PASS | §6 |

**Verdict:** Review **PASS** (absence confirmed). **Stop.** Next: Purchase Orders analysis only.
