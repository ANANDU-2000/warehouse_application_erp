# 23 — Relationships (ORM ForeignKeys)

> **Phase:** 1.9 Relationships / ER diagram  
> **Status:** Review PASS (2026-07-18)  
> **Source of truth:** `source-app/backend/app/models/*.py` (SQLAlchemy `ForeignKey(...)` only)  
> **Cross-check:** `docs/20_Database_Analysis.md` `FK->` lines  
> **Rule:** Never invent FKs. Soft UUID columns without `ForeignKey` are listed separately under [Logical links (no ORM FK)](#logical-links-no-orm-fk).

## Cardinality legend

| Label | Meaning |
|-------|---------|
| **1:N** | Default: one parent row → many child rows via this FK |
| **1:1** | UniqueConstraint / unique pair implies at most one child per parent key (or composite) |
| **N:M** | Association / junction table linking two entities |

`ondelete` is listed only when declared on the ORM `ForeignKey(...)`. Empty = not declared in the model (DB default / migration SQL may still apply — see Unknowns).

---

## Core

Tables: `businesses`, `users`, `memberships`, `user_sessions`, `password_reset_tokens`, `api_usage_logs`.  
(No ORM FKs on: `businesses`, `admin_audit_logs`, `webhook_event_logs`.)

| From table | FK column | To table | Cardinality | ondelete | Notes | Source |
|------------|-----------|----------|-------------|----------|-------|--------|
| `users` | `created_by` | `users` | 1:N | SET NULL | Self-FK; creator of a user account | `user.py` → `User` |
| `memberships` | `user_id` | `users` | N:M | — | Junction `users`↔`businesses`; `UniqueConstraint(user_id, business_id)` = `uq_membership_user_business` | `membership.py` → `Membership` |
| `memberships` | `business_id` | `businesses` | N:M | — | Same junction; one membership row per (user, business) | `membership.py` → `Membership` |
| `user_sessions` | `user_id` | `users` | 1:N | CASCADE | Login session rows | `user_session.py` → `UserSession` |
| `user_sessions` | `business_id` | `businesses` | 1:N | CASCADE | Nullable active-business context | `user_session.py` → `UserSession` |
| `password_reset_tokens` | `user_id` | `users` | 1:N | CASCADE | Token hash only stored | `password_reset.py` → `PasswordResetToken` |
| `api_usage_logs` | `business_id` | `businesses` | 1:N | — | Nullable tenant on usage event | `api_usage_log.py` → `ApiUsageLog` |
| `api_usage_logs` | `user_id` | `users` | 1:N | — | Nullable actor | `api_usage_log.py` → `ApiUsageLog` |

**Core N:M summary:** `users` **N:M** `businesses` via `memberships` (`uq_membership_user_business`).

---

## Catalog

Tables: `item_categories`, `category_types`, `catalog_items`, `catalog_variants`, `catalog_item_default_suppliers`, `catalog_item_default_brokers`, `supplier_item_defaults`, plus unit-intelligence: `item_packaging_profiles`, `ocr_item_aliases`, `smart_unit_rules`, `item_learning_history`, `unit_confidence_logs`, `ai_item_profiles`, `smart_package_rules`.  
(No ORM FKs on: `master_units`.)

| From table | FK column | To table | Cardinality | ondelete | Notes | Source |
|------------|-----------|----------|-------------|----------|-------|--------|
| `item_categories` | `business_id` | `businesses` | 1:N | — | Tenant-scoped categories | `catalog.py` → `ItemCategory` |
| `category_types` | `category_id` | `item_categories` | 1:N | CASCADE | Middle layer Category→Type; `uq_category_types_name` on `(category_id, name)` | `catalog.py` → `CategoryType` |
| `catalog_items` | `business_id` | `businesses` | 1:N | — | Tenant-scoped items | `catalog.py` → `CatalogItem` |
| `catalog_items` | `category_id` | `item_categories` | 1:N | — | Required category | `catalog.py` → `CatalogItem` |
| `catalog_items` | `type_id` | `category_types` | 1:N | SET NULL | Optional type | `catalog.py` → `CatalogItem` |
| `catalog_items` | `last_supplier_id` | `suppliers` | 1:N | SET NULL | Snapshot from last confirmed trade | `catalog.py` → `CatalogItem` |
| `catalog_items` | `last_broker_id` | `brokers` | 1:N | SET NULL | Snapshot from last confirmed trade | `catalog.py` → `CatalogItem` |
| `catalog_items` | `last_trade_purchase_id` | `trade_purchases` | 1:N | SET NULL | Snapshot pointer into Trade domain | `catalog.py` → `CatalogItem` |
| `catalog_items` | `created_by_user_id` | `users` | 1:N | SET NULL | Audit | `catalog.py` → `CatalogItem` |
| `catalog_items` | `updated_by_user_id` | `users` | 1:N | SET NULL | Audit | `catalog.py` → `CatalogItem` |
| `catalog_item_default_suppliers` | `business_id` | `businesses` | N:M | CASCADE | Junction item↔supplier defaults; `uq_citem_def_supplier` | `catalog.py` → `CatalogItemDefaultSupplier` |
| `catalog_item_default_suppliers` | `catalog_item_id` | `catalog_items` | N:M | CASCADE | Same junction | `catalog.py` → `CatalogItemDefaultSupplier` |
| `catalog_item_default_suppliers` | `supplier_id` | `suppliers` | N:M | CASCADE | Same junction | `catalog.py` → `CatalogItemDefaultSupplier` |
| `catalog_item_default_brokers` | `business_id` | `businesses` | N:M | CASCADE | Junction item↔broker defaults; `uq_citem_def_broker` | `catalog.py` → `CatalogItemDefaultBroker` |
| `catalog_item_default_brokers` | `catalog_item_id` | `catalog_items` | N:M | CASCADE | Same junction | `catalog.py` → `CatalogItemDefaultBroker` |
| `catalog_item_default_brokers` | `broker_id` | `brokers` | N:M | CASCADE | Same junction | `catalog.py` → `CatalogItemDefaultBroker` |
| `catalog_variants` | `business_id` | `businesses` | 1:N | — | Variants under item | `catalog.py` → `CatalogVariant` |
| `catalog_variants` | `catalog_item_id` | `catalog_items` | 1:N | — | Parent item | `catalog.py` → `CatalogVariant` |
| `supplier_item_defaults` | `business_id` | `businesses` | 1:N | — | Per-supplier purchase memory; `uq_supplier_item_default` on `(business_id, supplier_id, catalog_item_id)` | `supplier_item_default.py` → `SupplierItemDefault` |
| `supplier_item_defaults` | `supplier_id` | `suppliers` | 1:N | — | Same unique triple | `supplier_item_default.py` → `SupplierItemDefault` |
| `supplier_item_defaults` | `catalog_item_id` | `catalog_items` | 1:N | — | Same unique triple (1 row per supplier×item in business) | `supplier_item_default.py` → `SupplierItemDefault` |
| `item_packaging_profiles` | `business_id` | `businesses` | 1:N | — | Optional packaging rows | `unit_intelligence.py` → `ItemPackagingProfile` |
| `item_packaging_profiles` | `catalog_item_id` | `catalog_items` | 1:N | CASCADE | Parent item | `unit_intelligence.py` → `ItemPackagingProfile` |
| `ocr_item_aliases` | `business_id` | `businesses` | 1:N | — | OCR alias→item; `uq_ocr_alias_item_norm` | `unit_intelligence.py` → `OcrItemAlias` |
| `ocr_item_aliases` | `catalog_item_id` | `catalog_items` | 1:N | CASCADE | Target item | `unit_intelligence.py` → `OcrItemAlias` |
| `smart_unit_rules` | `business_id` | `businesses` | 1:N | CASCADE | Nullable = global rule | `unit_intelligence.py` → `SmartUnitRule` |
| `item_learning_history` | `business_id` | `businesses` | 1:N | — | Learning corrections | `unit_intelligence.py` → `ItemLearningHistory` |
| `item_learning_history` | `catalog_item_id` | `catalog_items` | 1:N | CASCADE | Target item | `unit_intelligence.py` → `ItemLearningHistory` |
| `unit_confidence_logs` | `business_id` | `businesses` | 1:N | — | Append-only scores | `unit_intelligence.py` → `UnitConfidenceLog` |
| `unit_confidence_logs` | `catalog_item_id` | `catalog_items` | 1:N | SET NULL | Nullable item | `unit_intelligence.py` → `UnitConfidenceLog` |
| `ai_item_profiles` | `business_id` | `businesses` | 1:N | — | Tenant scope | `unit_intelligence.py` → `AiItemProfile` |
| `ai_item_profiles` | `catalog_item_id` | `catalog_items` | 1:1 | CASCADE | `uq_ai_item_profile_item` on `(business_id, catalog_item_id)` → one profile per item in business | `unit_intelligence.py` → `AiItemProfile` |
| `smart_package_rules` | `business_id` | `businesses` | 1:N | CASCADE | Nullable = global rule | `unit_intelligence.py` → `SmartPackageRule` |

**Catalog N:M summaries:**

- `catalog_items` **N:M** `suppliers` via `catalog_item_default_suppliers`
- `catalog_items` **N:M** `brokers` via `catalog_item_default_brokers`

---

## Contacts

Tables: `brokers`, `suppliers`, `broker_supplier_m2m`.

| From table | FK column | To table | Cardinality | ondelete | Notes | Source |
|------------|-----------|----------|-------------|----------|-------|--------|
| `brokers` | `business_id` | `businesses` | 1:N | — | Tenant-scoped brokers | `contacts.py` → `Broker` |
| `suppliers` | `business_id` | `businesses` | 1:N | — | Tenant-scoped suppliers | `contacts.py` → `Supplier` |
| `suppliers` | `broker_id` | `brokers` | 1:N | — | Legacy single optional broker on supplier (`relationship` back_populates) | `contacts.py` → `Supplier` |
| `broker_supplier_m2m` | `broker_id` | `brokers` | N:M | — | Explicit M2M beyond legacy `suppliers.broker_id`; `uq_broker_supplier_m2m_pair` | `trade_purchase.py` → `BrokerSupplierLink` |
| `broker_supplier_m2m` | `supplier_id` | `suppliers` | N:M | — | Same junction | `trade_purchase.py` → `BrokerSupplierLink` |

**Contacts N:M summary:** `brokers` **N:M** `suppliers` via `broker_supplier_m2m` (in addition to optional 1:N `suppliers.broker_id`).

---

## Trade

Tables: `trade_purchases`, `trade_purchase_lines`, `trade_purchase_drafts`, `purchase_lifecycle_events`, `purchase_damage_reports`.

| From table | FK column | To table | Cardinality | ondelete | Notes | Source |
|------------|-----------|----------|-------------|----------|-------|--------|
| `trade_purchases` | `business_id` | `businesses` | 1:N | — | Header; `uq_trade_purchases_business_human` on `(business_id, human_id)` | `trade_purchase.py` → `TradePurchase` |
| `trade_purchases` | `user_id` | `users` | 1:N | — | Creator (`creator_user`) | `trade_purchase.py` → `TradePurchase` |
| `trade_purchases` | `supplier_id` | `suppliers` | 1:N | — | Required supplier | `trade_purchase.py` → `TradePurchase` |
| `trade_purchases` | `broker_id` | `brokers` | 1:N | — | Optional broker | `trade_purchase.py` → `TradePurchase` |
| `trade_purchases` | `staff_verified_by` | `users` | 1:N | SET NULL | Staff verifier (`staff_verifier_user`) | `trade_purchase.py` → `TradePurchase` |
| `trade_purchase_lines` | `trade_purchase_id` | `trade_purchases` | 1:N | CASCADE | Lines; ORM `cascade="all, delete-orphan"` | `trade_purchase.py` → `TradePurchaseLine` |
| `trade_purchase_lines` | `catalog_item_id` | `catalog_items` | 1:N | — | Line item | `trade_purchase.py` → `TradePurchaseLine` |
| `trade_purchase_drafts` | `business_id` | `businesses` | 1:1 | — | `uq_trade_purchase_drafts_biz_user` → one draft per (business, user) | `trade_purchase.py` → `TradePurchaseDraft` |
| `trade_purchase_drafts` | `user_id` | `users` | 1:1 | — | Same unique pair | `trade_purchase.py` → `TradePurchaseDraft` |
| `purchase_lifecycle_events` | `purchase_id` | `trade_purchases` | 1:N | CASCADE | Status transition log | `purchase_lifecycle_event.py` → `PurchaseLifecycleEvent` |
| `purchase_lifecycle_events` | `business_id` | `businesses` | 1:N | CASCADE | Tenant | `purchase_lifecycle_event.py` → `PurchaseLifecycleEvent` |
| `purchase_lifecycle_events` | `actor_id` | `users` | 1:N | SET NULL | Actor | `purchase_lifecycle_event.py` → `PurchaseLifecycleEvent` |
| `purchase_damage_reports` | `business_id` | `businesses` | 1:N | CASCADE | Damage reports | `purchase_damage_report.py` → `PurchaseDamageReport` |
| `purchase_damage_reports` | `purchase_id` | `trade_purchases` | 1:N | CASCADE | Parent purchase | `purchase_damage_report.py` → `PurchaseDamageReport` |
| `purchase_damage_reports` | `catalog_item_id` | `catalog_items` | 1:N | SET NULL | Optional item | `purchase_damage_report.py` → `PurchaseDamageReport` |
| `purchase_damage_reports` | `reported_by_user_id` | `users` | 1:N | SET NULL | Reporter | `purchase_damage_report.py` → `PurchaseDamageReport` |

---

## Stock

Tables: `stock_movements`, `stock_adjustment_log`, `stock_physical_counts`, `stock_audits`, `stock_audit_items`, `stock_dispute_cases`, `reorder_list`, `staff_purchase_logs`.

| From table | FK column | To table | Cardinality | ondelete | Notes | Source |
|------------|-----------|----------|-------------|----------|-------|--------|
| `stock_movements` | `business_id` | `businesses` | 1:N | CASCADE | Ledger; `uq_stock_movements_business_idempotency` | `stock_movement.py` → `StockMovement` |
| `stock_movements` | `item_id` | `catalog_items` | 1:N | CASCADE | Moved item | `stock_movement.py` → `StockMovement` |
| `stock_movements` | `actor_id` | `users` | 1:N | SET NULL | Actor | `stock_movement.py` → `StockMovement` |
| `stock_adjustment_log` | `business_id` | `businesses` | 1:N | CASCADE | Manual adjustment trail | `stock_adjustment.py` → `StockAdjustmentLog` |
| `stock_adjustment_log` | `item_id` | `catalog_items` | 1:N | CASCADE | Adjusted item | `stock_adjustment.py` → `StockAdjustmentLog` |
| `stock_adjustment_log` | `updated_by` | `users` | 1:N | SET NULL | Actor | `stock_adjustment.py` → `StockAdjustmentLog` |
| `stock_physical_counts` | `business_id` | `businesses` | 1:N | CASCADE | Physical count rows | `stock_physical_count.py` → `StockPhysicalCount` |
| `stock_physical_counts` | `item_id` | `catalog_items` | 1:N | CASCADE | Counted item | `stock_physical_count.py` → `StockPhysicalCount` |
| `stock_physical_counts` | `counted_by` | `users` | 1:N | SET NULL | Counter | `stock_physical_count.py` → `StockPhysicalCount` |
| `stock_audits` | `auditor_id` | `users` | 1:N | SET NULL | Header auditor | `stock_audit.py` → `StockAudit` |
| `stock_audits` | `business_id` | `businesses` | 1:N | CASCADE | Nullable tenant on header | `stock_audit.py` → `StockAudit` |
| `stock_audit_items` | `audit_id` | `stock_audits` | 1:N | CASCADE | Lines; `cascade="all, delete-orphan"` + `passive_deletes=True` | `stock_audit.py` → `StockAuditItem` |
| `stock_audit_items` | `item_id` | `catalog_items` | 1:N | CASCADE | Audited item | `stock_audit.py` → `StockAuditItem` |
| `stock_dispute_cases` | `business_id` | `businesses` | 1:N | CASCADE | Dispute cases | `stock_dispute_case.py` → `StockDisputeCase` |
| `stock_dispute_cases` | `item_id` | `catalog_items` | 1:N | CASCADE | Disputed item | `stock_dispute_case.py` → `StockDisputeCase` |
| `stock_dispute_cases` | `created_by` | `users` | 1:N | SET NULL | Opener | `stock_dispute_case.py` → `StockDisputeCase` |
| `stock_dispute_cases` | `resolved_by` | `users` | 1:N | SET NULL | Resolver | `stock_dispute_case.py` → `StockDisputeCase` |
| `reorder_list` | `business_id` | `businesses` | 1:N | CASCADE | Reorder queue | `reorder_list.py` → `ReorderListEntry` |
| `reorder_list` | `item_id` | `catalog_items` | 1:N | CASCADE | Queued item | `reorder_list.py` → `ReorderListEntry` |
| `reorder_list` | `added_by` | `users` | 1:N | SET NULL | Nullable adder | `reorder_list.py` → `ReorderListEntry` |
| `staff_purchase_logs` | `business_id` | `businesses` | 1:N | CASCADE | Staff purchase ops log | `staff_purchase_log.py` → `StaffPurchaseLog` |
| `staff_purchase_logs` | `item_id` | `catalog_items` | 1:N | CASCADE | Item | `staff_purchase_log.py` → `StaffPurchaseLog` |
| `staff_purchase_logs` | `supplier_id` | `suppliers` | 1:N | SET NULL | Optional supplier | `staff_purchase_log.py` → `StaffPurchaseLog` |
| `staff_purchase_logs` | `broker_id` | `brokers` | 1:N | SET NULL | Optional broker | `staff_purchase_log.py` → `StaffPurchaseLog` |
| `staff_purchase_logs` | `stock_movement_id` | `stock_movements` | 1:N | SET NULL | Linked movement if any | `staff_purchase_log.py` → `StaffPurchaseLog` |
| `staff_purchase_logs` | `created_by` | `users` | 1:N | SET NULL | Actor | `staff_purchase_log.py` → `StaffPurchaseLog` |

---

## Ops / Aux

Tables: `notifications`, `report_saved_views`, `staff_activity_log`, `daily_usage_logs`, `staff_checklist_templates`, `staff_checklist_completions`, `business_goals`.

| From table | FK column | To table | Cardinality | ondelete | Notes | Source |
|------------|-----------|----------|-------------|----------|-------|--------|
| `notifications` | `business_id` | `businesses` | 1:N | CASCADE | In-app notifications | `notification.py` → `AppNotification` |
| `notifications` | `user_id` | `users` | 1:N | CASCADE | Recipient | `notification.py` → `AppNotification` |
| `notifications` | `triggered_by_user_id` | `users` | 1:N | SET NULL | Trigger actor | `notification.py` → `AppNotification` |
| `report_saved_views` | `business_id` | `businesses` | 1:N | CASCADE | Persisted report filter views | `report_saved_view.py` → `ReportSavedView` |
| `report_saved_views` | `user_id` | `users` | 1:N | CASCADE | Owner | `report_saved_view.py` → `ReportSavedView` |
| `staff_activity_log` | `business_id` | `businesses` | 1:N | CASCADE | Staff activity trail | `user_session.py` → `StaffActivityLog` |
| `staff_activity_log` | `user_id` | `users` | 1:N | CASCADE | Actor | `user_session.py` → `StaffActivityLog` |
| `staff_activity_log` | `item_id` | `catalog_items` | 1:N | SET NULL | Optional related item | `user_session.py` → `StaffActivityLog` |
| `daily_usage_logs` | `business_id` | `businesses` | 1:N | CASCADE | Daily usage; `uq_daily_usage_item_date` on `(business_id, item_id, usage_date)` | `operations.py` → `DailyUsageLog` |
| `daily_usage_logs` | `item_id` | `catalog_items` | 1:N | CASCADE | Used item | `operations.py` → `DailyUsageLog` |
| `daily_usage_logs` | `logged_by_user_id` | `users` | 1:N | SET NULL | Logger | `operations.py` → `DailyUsageLog` |
| `staff_checklist_templates` | `business_id` | `businesses` | 1:N | CASCADE | Nullable business; `uq_checklist_template` on `(business_id, slot, task_key)` | `operations.py` → `StaffChecklistTemplate` |
| `staff_checklist_completions` | `business_id` | `businesses` | 1:N | CASCADE | Completions; `uq_checklist_completion` | `operations.py` → `StaffChecklistCompletion` |
| `staff_checklist_completions` | `user_id` | `users` | 1:N | CASCADE | Completing user | `operations.py` → `StaffChecklistCompletion` |
| `business_goals` | `business_id` | `businesses` | 1:N | — | Report goals; `uq_business_goals_biz_period` on `(business_id, period)` | `business_goal.py` → `BusinessGoal` |

---

## Logical links (no ORM FK)

UUID columns that look like references but have **no** `ForeignKey(...)` in the ORM. Do **not** treat these as declared FKs for SQL Server DDL unless separately verified in raw SQL.

| Table | Column | Likely target (application-level) | Evidence | Source |
|-------|--------|-----------------------------------|----------|--------|
| `notifications` | `related_item_id` | `catalog_items.id` (logical) | Docs `20` lists as UUID NULL **without** `FK->`; model has bare `Uuid` | `notification.py` → `AppNotification` |
| `notifications` | `related_purchase_id` | `trade_purchases.id` (logical) | Same | `notification.py` → `AppNotification` |
| `notifications` | `related_supplier_id` | `suppliers.id` (logical) | Same | `notification.py` → `AppNotification` |
| `stock_movements` | `source_id` | Polymorphic source row (paired with `source_type`) | Docs `20`: `source_id` UUID NULL **without** `FK->`; no `ForeignKey` in model | `stock_movement.py` → `StockMovement` |

### Non-UUID / non-FK resource pointers (not soft UUID FKs)

| Table | Column | Notes | Source |
|-------|--------|-------|--------|
| `admin_audit_logs` | `resource_id` (`str`) | Opaque string id + `resource_type`; **not** a UUID FK | `admin_audit_log.py` → `AdminAuditLog` |
| `webhook_event_logs` | — | No FK columns at all | `webhook_event_log.py` → `WebhookEventLog` |
| `businesses` | — | Root tenant table; no outbound FKs | `business.py` → `Business` |
| `master_units` | — | Global unit codes; no outbound FKs | `unit_intelligence.py` → `MasterUnit` |

---

## Inventory counts

| Metric | Count |
|--------|------:|
| ORM `ForeignKey` columns extracted | **103** |
| Soft UUID columns (no `ForeignKey`) | **4** |
| Association / N:M junction tables | **4** (`memberships`, `broker_supplier_m2m`, `catalog_item_default_suppliers`, `catalog_item_default_brokers`) |
| Explicit 1:1 via UniqueConstraint | **2** (`trade_purchase_drafts` per business+user; `ai_item_profiles` per business+item) |
| Tables with zero ORM FKs | `businesses`, `master_units`, `admin_audit_logs`, `webhook_event_logs` |

Cross-check: every `FK->` line in `docs/20_Database_Analysis.md` maps to a row above; the four soft UUID columns in `20` without `FK->` match the logical-links section.

---

## Unknowns — needs verification

1. **DB-level `ON DELETE` / extra FKs** in `source-app/backend/sql/*.sql` that are not expressed on the ORM `ForeignKey` (especially where ORM omits `ondelete`).
2. Whether `stock_movements.source_id` is constrained anywhere in raw SQL (ORM does not).
3. Whether notification `related_*_id` columns gain FKs in later migrations (ORM does not declare them).
4. `report_saved_views` exists as a model (`report_saved_view.py`) and in `docs/20`; it is not listed in `models/__init__.py` `__all__` — confirm Alembic/SQL still creates the table in all environments.

---

## Review PASS/FAIL

| Check | Result |
|-------|--------|
| Every ORM `ForeignKey` listed as a row | PASS (103) |
| Soft UUID without `ForeignKey` separated | PASS (4) |
| No invented FKs | PASS |
| Domain grouping (Core / Catalog / Contacts / Trade / Stock / Ops-Aux) | PASS |
| Source model citations | PASS |
| Cross-check vs `docs/20_Database_Analysis.md` `FK->` | PASS |
| Companion diagram | `docs/24_ER_Diagram.md` |

**Verdict:** Review **PASS** (analysis only — no schema changes).
)
