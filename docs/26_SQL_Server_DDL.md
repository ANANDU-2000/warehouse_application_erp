# 26 — SQL Server DDL (Phase 2.3)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.3**  
**Sources:** `source-app/backend/app/models/*.py`, `docs/25_SQL_Server_Type_Mapping.md`, `docs/20_Database_Analysis.md`  
**Target:** SQL Server 2022 — plain `CREATE TABLE` scripts under `new-app/database/ddl/`  
**Scope:** 46 tables (no customers / sales product tables)

---

## 1. Rules applied

| Rule | Applied |
|---|---|
| Types from `docs/25_SQL_Server_Type_Mapping.md` | Yes |
| Exact ORM column names (no renames) | Yes |
| `[metadata]` for reserved column name | Yes — `notifications`, `purchase_lifecycle_events` |
| No `FOREIGN KEY … REFERENCES` | Yes — deferred to **2.4** |
| PK + `UniqueConstraint` / `unique=True` | Yes |
| No UUID `DEFAULT` (app generates) | Yes |
| INT `server_default` only | Yes — `users.token_version DEFAULT (0)` |
| Soft UUID columns still `UNIQUEIDENTIFIER NULL` | Yes — `notifications.related_*`, `stock_movements.source_id` |
| No customers / sales tables | Yes |

---

## 2. Table → file map (count = 46)

| # | Table | File |
|---|---|---|
| — | (bootstrap / USE dbo) | `new-app/database/ddl/00_schema.sql` |
| 1 | `businesses` | `01_core.sql` |
| 2 | `users` | `01_core.sql` |
| 3 | `memberships` | `01_core.sql` |
| 4 | `user_sessions` | `01_core.sql` |
| 5 | `password_reset_tokens` | `01_core.sql` |
| 6 | `api_usage_logs` | `01_core.sql` |
| 7 | `admin_audit_logs` | `01_core.sql` |
| 8 | `webhook_event_logs` | `01_core.sql` |
| 9 | `business_goals` | `01_core.sql` |
| 10 | `item_categories` | `02_catalog.sql` |
| 11 | `category_types` | `02_catalog.sql` |
| 12 | `catalog_items` | `02_catalog.sql` |
| 13 | `catalog_variants` | `02_catalog.sql` |
| 14 | `catalog_item_default_suppliers` | `02_catalog.sql` |
| 15 | `catalog_item_default_brokers` | `02_catalog.sql` |
| 16 | `supplier_item_defaults` | `02_catalog.sql` |
| 17 | `master_units` | `02_catalog.sql` |
| 18 | `item_packaging_profiles` | `02_catalog.sql` |
| 19 | `ocr_item_aliases` | `02_catalog.sql` |
| 20 | `smart_unit_rules` | `02_catalog.sql` |
| 21 | `item_learning_history` | `02_catalog.sql` |
| 22 | `unit_confidence_logs` | `02_catalog.sql` |
| 23 | `ai_item_profiles` | `02_catalog.sql` |
| 24 | `smart_package_rules` | `02_catalog.sql` |
| 25 | `brokers` | `03_contacts.sql` |
| 26 | `suppliers` | `03_contacts.sql` |
| 27 | `broker_supplier_m2m` | `03_contacts.sql` |
| 28 | `trade_purchases` | `04_trade.sql` |
| 29 | `trade_purchase_lines` | `04_trade.sql` |
| 30 | `trade_purchase_drafts` | `04_trade.sql` |
| 31 | `purchase_lifecycle_events` | `04_trade.sql` |
| 32 | `purchase_damage_reports` | `04_trade.sql` |
| 33 | `stock_movements` | `05_stock.sql` |
| 34 | `stock_adjustment_log` | `05_stock.sql` |
| 35 | `stock_physical_counts` | `05_stock.sql` |
| 36 | `stock_audits` | `05_stock.sql` |
| 37 | `stock_audit_items` | `05_stock.sql` |
| 38 | `stock_dispute_cases` | `05_stock.sql` |
| 39 | `reorder_list` | `05_stock.sql` |
| 40 | `staff_purchase_logs` | `05_stock.sql` |
| 41 | `notifications` | `06_ops_aux.sql` |
| 42 | `report_saved_views` | `06_ops_aux.sql` |
| 43 | `staff_activity_log` | `06_ops_aux.sql` |
| 44 | `daily_usage_logs` | `06_ops_aux.sql` |
| 45 | `staff_checklist_templates` | `06_ops_aux.sql` |
| 46 | `staff_checklist_completions` | `06_ops_aux.sql` |

**Counts by file:** core 9 · catalog 15 · contacts 3 · trade 5 · stock 8 · ops_aux 6 = **46**.

---

## 3. Unique constraints included (ORM names)

| Constraint | Table | Columns |
|---|---|---|
| `UQ_users_email` | `users` | `email` |
| `UQ_users_username` | `users` | `username` |
| `UQ_users_google_sub` | `users` | `google_sub` |
| `UQ_users_phone` | `users` | `phone` |
| `UQ_password_reset_tokens_token_hash` | `password_reset_tokens` | `token_hash` |
| `uq_membership_user_business` | `memberships` | `user_id`, `business_id` |
| `uq_business_goals_biz_period` | `business_goals` | `business_id`, `period` |
| `uq_category_types_name` | `category_types` | `category_id`, `name` |
| `uq_citem_def_supplier` | `catalog_item_default_suppliers` | `catalog_item_id`, `supplier_id` |
| `uq_citem_def_broker` | `catalog_item_default_brokers` | `catalog_item_id`, `broker_id` |
| `uq_supplier_item_default` | `supplier_item_defaults` | `business_id`, `supplier_id`, `catalog_item_id` |
| `uq_master_units_unit_code` | `master_units` | `unit_code` |
| `uq_ocr_alias_item_norm` | `ocr_item_aliases` | `business_id`, `normalized_alias`, `catalog_item_id` |
| `uq_ai_item_profile_item` | `ai_item_profiles` | `business_id`, `catalog_item_id` |
| `uq_broker_supplier_m2m_pair` | `broker_supplier_m2m` | `broker_id`, `supplier_id` |
| `uq_trade_purchases_business_human` | `trade_purchases` | `business_id`, `human_id` |
| `uq_trade_purchase_drafts_biz_user` | `trade_purchase_drafts` | `business_id`, `user_id` |
| `uq_stock_movements_business_idempotency` | `stock_movements` | `business_id`, `idempotency_key` |
| `uq_daily_usage_item_date` | `daily_usage_logs` | `business_id`, `item_id`, `usage_date` |
| `uq_checklist_template` | `staff_checklist_templates` | `business_id`, `slot`, `task_key` |
| `uq_checklist_completion` | `staff_checklist_completions` | `business_id`, `user_id`, `checklist_date`, `slot`, `task_key` |

Non-unique indexes (ORM `index=True` without unique) are **deferred to Phase 2.5**.

---

## 4. Deferred to Phase 2.4 (FK REFERENCES)

All ORM `ForeignKey(...)` relationships are stored as plain `UNIQUEIDENTIFIER` (or nullable) columns **without** `CONSTRAINT … FOREIGN KEY … REFERENCES`. Add ondelete behavior (`CASCADE` / `SET NULL`) in 2.4 from `docs/23_Relationships.md`.

Soft UUID links (never had ORM FK) remain columns only:

| Table | Column |
|---|---|
| `notifications` | `related_item_id`, `related_purchase_id`, `related_supplier_id` |
| `stock_movements` | `source_id` (with `source_type`) |

---

## 5. Apply order (suggested)

1. `00_schema.sql`  
2. `01_core.sql`  
3. `02_catalog.sql`  
4. `03_contacts.sql`  
5. `04_trade.sql`  
6. `05_stock.sql`  
7. `06_ops_aux.sql`  

(Order is organizational; without FKs, scripts are order-independent except for operational clarity.)

---

## 6. Rollback notes

| Action | Rollback |
|---|---|
| Drop all Phase 2.3 tables | Run `DROP TABLE` for each of the 46 tables (child-first optional until FKs exist), or restore from backup taken before apply |
| Partial apply | Drop only the tables that were created; re-run from a clean database preferred |
| After 2.4 FKs exist | Drop FKs first (or use cascade drop script from 2.4), then drop tables |
| Source of truth | Keep `source-app/` Postgres / ORM unchanged; DDL is additive for `new-app` only |

**Rollback script pattern (example):**

```sql
-- After 2.3 only (no FKs): drop in any order, e.g.
DROP TABLE IF EXISTS staff_checklist_completions;
-- … repeat for all 46 …
DROP TABLE IF EXISTS businesses;
```

Prefer full DB restore for production-like environments.

---

## 7. Verification

| Check | Result |
|---|---|
| `CREATE TABLE` count in `ddl/*.sql` | **46** |
| Customers / sales tables | None |
| FK REFERENCES present | None |
| Review | **PASS** |

---

## 8. Next

**Phase 2.4** — done: see `docs/27_SQL_Server_Constraints.md` and `new-app/database/ddl/constraints/`.

---

*Phase 2.3 complete — DDL files only; FKs and indexes not in this task.*
