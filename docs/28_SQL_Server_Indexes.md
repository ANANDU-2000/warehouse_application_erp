# 28 — SQL Server Indexes (Phase 2.5)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.5**  
**Sources:** `source-app/backend/app/models/*.py` (`index=True`, `Index(...)`), `source-app/backend/sql/*.sql` (`CREATE INDEX` full btree on the 46 tables)  
**Target:** SQL Server 2022 — `CREATE NONCLUSTERED INDEX` under `new-app/database/ddl/indexes/`  
**Prerequisite:** Phase 2.3 tables + 2.4 constraints

---

## 1. Rules applied

| Rule | Applied |
|---|---|
| Non-unique indexes only | Yes |
| PK / UNIQUE already in 2.3 — do not re-emit | Yes |
| ORM `index=True` / `Index(...)` included | Yes |
| Postgres full btree `CREATE INDEX` on 46 tables | Yes |
| Partial / GIN / pg_trgm skipped | Yes (documented) |
| Non-46 tables skipped | Yes |
| No invented indexes | Yes |

---

## 2. File inventory

| File | Domain | Count |
|---|---|---:|
| `indexes/20_ix_core.sql` | Core | 12 |
| `indexes/21_ix_catalog.sql` | Catalog | 39 |
| `indexes/22_ix_contacts.sql` | Contacts | 4 |
| `indexes/23_ix_trade.sql` | Trade | 24 |
| `indexes/24_ix_stock.sql` | Stock | 45 |
| `indexes/25_ix_ops_aux.sql` | Ops / Aux | 25 |
| `indexes/91_drop_indexes.sql` | Rollback | 149 |
| **Total CREATE** | | **149** |

---

## 3. Skipped (not emitted)

### Already UNIQUE in Phase 2.3 DDL

ORM `unique=True` / UniqueConstraint columns (e.g. `users.email`, `master_units.unit_code`, `memberships` composite, etc.) — covered by `UQ_*` / `uq_*` constraints.

### Postgres UNIQUE indexes not in 2.3 UNIQUE list

| Index | Source | Note |
|---|---|---|
| `ux_catalog_items_public_token` | `033_catalog_public_qr.sql` | UNIQUE on `public_token`; **not** in 2.3 UNIQUE constraints — gap for later unique-align (not invented as non-unique here) |
| Partial UNIQUE (barcode, notification dedupe, reorder pending, etc.) | various `sql/*.sql` | Partial UNIQUE → not mapped in 2.5 |

### Partial / filtered indexes

Postgres `WHERE …` indexes (low-stock, unread notifications, delivery filters, etc.) — **skipped** (no filtered-index port in 2.5).

### GIN / pg_trgm

`optional_pg_trgm_indexes.sql` — skipped (no SQL Server gin_trgm equivalent).

### Non-46 tables / wrong names

`delivery_discrepancies`, `ocr_correction_events`, `app_notifications`, `stock_adjustment_logs` (wrong plural) — skipped.

### Invalid vs ORM schema

`idx_tpl_biz_date_item` on `trade_purchase_lines` (uses columns not on ORM lines) — skipped.  
`064` column `catalog_item_id` on `stock_movements` → emitted as `item_id` (ORM name).

---

## 4. Apply order

1. `ddl/00`–`06` tables  
2. `ddl/constraints/10`–`16` FKs/CHECKs  
3. `ddl/indexes/20`–`25`  
4. Rollback indexes: `91_drop_indexes.sql`

---

## 5. Rollback notes

| Action | Rollback |
|---|---|
| Remove 2.5 indexes only | Run `91_drop_indexes.sql` |
| Full reset | Drop indexes → constraints (`90_drop_constraints.sql`) → tables (`docs/26`) |

---

## 6. Verification

| Check | Result |
|---|---|
| `CREATE NONCLUSTERED INDEX` count | **149** |
| Duplicate index names | None |
| PK/UNIQUE redefinition | None |
| Review | **PASS** |

---

## 7. Next

**Phase 2.6** — done: see `docs/29_RLS_Equivalent_Strategy.md` (app-layer primary).

---

*Phase 2.5 complete — non-unique indexes only; RLS not in this task.*
