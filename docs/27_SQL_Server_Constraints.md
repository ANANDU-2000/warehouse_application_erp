# 27 — SQL Server Constraints (Phase 2.4)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.4**  
**Sources:** `docs/23_Relationships.md` (ORM FKs), `source-app/backend/sql/*.sql` (CHECK predicates)  
**Target:** SQL Server 2022 — `ALTER TABLE` scripts under `new-app/database/ddl/constraints/`  
**Prerequisite:** Phase 2.3 tables (`docs/26_SQL_Server_DDL.md`)

---

## 1. Rules applied

| Rule | Applied |
|---|---|
| FKs only from `docs/23` ORM `ForeignKey` rows | Yes — **103** |
| Soft UUID columns — no FK | Yes — 4 columns |
| `ON DELETE CASCADE` / `SET NULL` only when ORM declares | Yes |
| Empty ORM `ondelete` → SQL Server default (NO ACTION) | Yes |
| PK / UNIQUE not re-emitted (already in 2.3) | Yes |
| CHECK from latest Postgres SQL migrations on the 46 tables | Yes — **6** |
| RLS `WITH CHECK` excluded | Yes → Phase **2.6** |
| No invented FKs / column renames | Yes |

---

## 2. File inventory

| File | Contents | Count |
|---|---|---:|
| `constraints/10_fk_core.sql` | Core FKs | 8 |
| `constraints/11_fk_catalog.sql` | Catalog FKs | 33 |
| `constraints/12_fk_contacts.sql` | Contacts FKs | 5 |
| `constraints/13_fk_trade.sql` | Trade FKs | 16 |
| `constraints/14_fk_stock.sql` | Stock FKs | 26 |
| `constraints/15_fk_ops_aux.sql` | Ops/Aux FKs (+ `business_goals`) | 15 |
| `constraints/16_check.sql` | Column CHECK constraints | 6 |
| `constraints/90_drop_constraints.sql` | Rollback DROP CONSTRAINT | 6 + 103 |

**FK total:** 8 + 33 + 5 + 16 + 26 + 15 = **103**.

---

## 3. Soft UUID exclusion (no FK)

| Table | Column |
|---|---|
| `notifications` | `related_item_id`, `related_purchase_id`, `related_supplier_id` |
| `stock_movements` | `source_id` |

---

## 4. CHECK constraints emitted

| Constraint | Table / predicate | Postgres source |
|---|---|---|
| `ck_memberships_role` | `memberships.role IN ('owner','admin','manager','staff')` | `028_user_mgmt_v2.sql` |
| `ck_staff_activity_action_type` | `staff_activity_log.action_type` (v2 IN-list) | `059_staff_activity_action_types_v2.sql` |
| `ck_trade_purchases_delivery_status` | `trade_purchases.delivery_status` | `040_purchase_delivery_tracking.sql` |
| `ck_trade_purchases_status` | `trade_purchases.status` | `053_purchase_lifecycle_statuses.sql` |
| `chk_current_stock_non_negative` | `catalog_items.current_stock >= 0` | `044_catalog_current_stock_non_negative.sql` |
| `ck_stock_adjustment_type` | `stock_adjustment_log.adjustment_type` | `021_stock_inventory.sql` |

### Skipped CHECK (documented)

| Postgres CHECK | Reason |
|---|---|
| `discrepancy_type IN (...)` on `delivery_discrepancies` (`051_delivery_discrepancy_and_lifecycle.sql`) | Table **not** in the 46 ORM tables (`purchase_damage_reports` has `damage_type`, not `discrepancy_type`) |
| RLS `WITH CHECK` (`054_enable_rls_business_policies.sql`) | Phase **2.6** |

---

## 5. Apply order

1. `ddl/00_schema.sql` … `06_ops_aux.sql` (tables — Phase 2.3)  
2. `constraints/10_fk_core.sql` … `15_fk_ops_aux.sql`  
3. `constraints/16_check.sql`  
4. Rollback: `constraints/90_drop_constraints.sql` (then optional table drops from `docs/26`)

---

## 6. Rollback notes

| Action | Rollback |
|---|---|
| Remove 2.4 constraints only | Run `90_drop_constraints.sql` |
| Full schema reset | Drop constraints first, then drop 46 tables (`docs/26`) |
| Source of truth | `source-app/` unchanged; scripts additive for `new-app` only |

---

## 7. Unknowns (from docs/23 — not invented here)

1. DB-level `ON DELETE` / extra FKs in `source-app/backend/sql/*.sql` not on ORM — not added.  
2. Soft UUID FKs — not added.  
3. Indexes — Phase **2.5**.

---

## 8. Verification

| Check | Result |
|---|---|
| `FOREIGN KEY` count in `10`–`15` | **103** |
| Soft UUID FKs present | **0** |
| CHECK count in `16_check.sql` | **6** |
| PK/UNIQUE redefinition | None |
| Review | **PASS** |

---

## 9. Next

**Phase 2.5** — done: see `docs/28_SQL_Server_Indexes.md` and `new-app/database/ddl/indexes/`.

---

*Phase 2.4 complete — FK + CHECK ALTER scripts only; indexes and RLS not in this task.*
