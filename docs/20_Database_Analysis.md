# 20 — Database Analysis

> Source: direct parse of every SQLAlchemy model in `backend/app/models/*.py` (29 files → 46 tables, confirmed by direct `grep -c __tablename__`), regex-extracted for `__tablename__`, column name, Python/Mapped type, and `mapped_column(...)` args (primary key, unique, nullable, ForeignKey target). This is a **structural** extraction from the ORM layer — it reflects what SQLAlchemy declares, not a live `pg_dump`. Indexes beyond simple `index=True` flags, check constraints, triggers, and RLS policies live in the 60 raw SQL files under `backend/sql/` and are **not yet parsed** in this batch (see `26_Stored_Procedures.md`/`30_Indexes.md`, later batch — do not assume the ORM model is the complete schema; `backend/sql/054_enable_rls_business_policies.sql` alone proves there's DB-level logic the ORM doesn't express).

## Database engine

**PostgreSQL**, accessed async via SQLAlchemy 2.0 + `asyncpg` in production; `psycopg2-binary` for sync tooling (Alembic, seed scripts); `aiosqlite` present as a dependency, suggesting SQLite may be used as a lightweight local/test fallback (`app/sqlite_bootstrap.py` — confirms this, not yet opened in detail).

Two migration systems coexist:
1. **Alembic** (`backend/alembic/versions/`) — standard ORM-driven migrations
2. **60 raw, hand-numbered SQL scripts** (`backend/sql/021_stock_inventory.sql` through `067_user_token_version.sql`) — used for things Alembic likely doesn't auto-generate well: indexes, RLS policies, data backfills, archival. Numbering starts at 021 (there is no 001–020 in this upload — either pruned/archived, or the numbering continued from a source not included here; flagged, not assumed missing by design).

This dual-migration-path pattern is itself a migration risk for the SQL Server port: the *authoritative* current schema is whatever the union of Alembic + all 60 SQL scripts produces, not the ORM models alone. `backend/schema_expected.json` (12K, not yet opened) is likely a schema-drift fixture worth diffing against before finalizing the SQL Server DDL.

## Table count: 46 (from `__tablename__` declarations)

## Full table/column inventory


#### `admin_audit_logs`  (model: `AdminAuditLog`, file: `admin_audit_log.py`)
- `id` (uuid.UUID) PK NOT NULL
- `actor` (str) NOT NULL
- `action` (str) NOT NULL
- `resource_type` (str | None) NULL
- `resource_id` (str | None) NULL
- `details` (dict | None) NULL
- `note` (str | None) NULL
- `created_at` (datetime) NOT NULL

#### `api_usage_logs`  (model: `ApiUsageLog`, file: `api_usage_log.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID | None) NULL FK->businesses.id
- `user_id` (uuid.UUID | None) NULL FK->users.id
- `provider` (str) NOT NULL
- `action` (str) NOT NULL
- `units` (int) NOT NULL
- `cost_estimate_inr_paise` (int | None) NULL
- `meta` (dict | None) NULL
- `created_at` (datetime) NOT NULL

#### `businesses`  (model: `Business`, file: `business.py`)
- `id` (uuid.UUID) PK NOT NULL
- `name` (str) NOT NULL
- `branding_title` (str | None) NULL
- `branding_logo_url` (str | None) NULL
- `gst_number` (str | None) NULL
- `address` (str | None) NULL
- `phone` (str | None) NULL
- `contact_email` (str | None) NULL
- `default_currency` (str) NOT NULL
- `created_at` (datetime) NOT NULL

#### `business_goals`  (model: `BusinessGoal`, file: `business_goal.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `period` (str) NOT NULL
- `profit_goal` (float | None) NULL
- `volume_goal` (float | None) NULL
- `created_at` (datetime) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `item_categories`  (model: `ItemCategory`, file: `catalog.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `name` (str) NOT NULL
- `is_perishable` (bool) NOT NULL
- `created_at` (datetime) NOT NULL

#### `category_types`  (model: `CategoryType`, file: `catalog.py`)
- `id` (uuid.UUID) PK NOT NULL
- `category_id` (uuid.UUID) NOT NULL FK->item_categories.id
- `name` (str) NOT NULL
- `created_at` (datetime) NOT NULL

#### `catalog_items`  (model: `CatalogItem`, file: `catalog.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `category_id` (uuid.UUID) NOT NULL FK->item_categories.id
- `type_id` (uuid.UUID | None) NULL FK->category_types.id
- `name` (str) NOT NULL
- `default_unit` (str | None) NULL
- `default_kg_per_bag` (Decimal | None) NULL
- `default_items_per_box` (Decimal | None) NULL
- `default_weight_per_tin` (Decimal | None) NULL
- `hsn_code` (str | None) NULL
- `barcode` (str | None) NULL
- `public_token` (str) NOT NULL
- `item_code` (str | None) NULL
- `tax_percent` (Decimal | None) NULL
- `default_landing_cost` (Decimal | None) NULL
- `default_selling_cost` (Decimal | None) NULL
- `default_purchase_unit` (str | None) NULL
- `default_sale_unit` (str | None) NULL
- `last_purchase_price` (Decimal | None) NULL
- `last_selling_rate` (Decimal | None) NULL
- `last_supplier_id` (uuid.UUID | None) NULL FK->suppliers.id
- `last_broker_id` (uuid.UUID | None) NULL FK->brokers.id
- `last_trade_purchase_id` (uuid.UUID | None) NULL FK->trade_purchases.id
- `last_line_qty` (Decimal | None) NULL
- `last_line_unit` (str | None) NULL
- `last_line_weight_kg` (Decimal | None) NULL
- `created_at` (datetime) NOT NULL
- `normalized_name` (str | None) NULL
- `selling_unit` (str | None) NULL
- `stock_unit` (str | None) NULL
- `display_unit` (str | None) NULL
- `package_type` (str | None) NULL
- `package_size` (Decimal | None) NULL
- `package_measurement` (str | None) NULL
- `package_volume` (Decimal | None) NULL
- `package_weight` (Decimal | None) NULL
- `conversion_factor` (Decimal | None) NULL
- `ai_detected_unit` (str | None) NULL
- `smart_classification` (str | None) NULL
- `unit_confidence` (Decimal | None) NULL
- `packaging_confidence` (Decimal | None) NULL
- `is_loose_item` (bool | None) NULL
- `is_packaged_item` (bool | None) NULL
- `auto_detect_enabled` (bool) NOT NULL
- `ml_profile` (dict | None) NULL
- `validation_status` (str | None) NULL
- `current_stock` (Decimal | None) NULL
- `stock_version` (int) NOT NULL
- `reorder_level` (Decimal | None) NULL
- `opening_stock_qty` (Decimal | None) NULL
- `opening_stock_set_at` (datetime | None) NULL
- `opening_stock_set_by` (str | None) NULL
- `opening_stock_locked` (bool) NOT NULL
- `rack_location` (str | None) NULL
- `last_stock_updated_at` (datetime | None) NULL
- `last_stock_updated_by` (str | None) NULL
- `eviction_days` (int | None) NULL
- `last_purchase_at` (datetime | None) NULL
- `created_by_user_id` (uuid.UUID | None) NULL FK->users.id
- `updated_by_user_id` (uuid.UUID | None) NULL FK->users.id
- `deleted_at` (datetime | None) NULL
- `archived_at` (datetime | None) NULL

#### `catalog_item_default_suppliers`  (model: `CatalogItemDefaultSupplier`, file: `catalog.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `supplier_id` (uuid.UUID) NOT NULL FK->suppliers.id
- `sort_order` (int) NOT NULL

#### `catalog_item_default_brokers`  (model: `CatalogItemDefaultBroker`, file: `catalog.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `broker_id` (uuid.UUID) NOT NULL FK->brokers.id
- `sort_order` (int) NOT NULL

#### `catalog_variants`  (model: `CatalogVariant`, file: `catalog.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `name` (str) NOT NULL
- `default_kg_per_bag` (Decimal | None) NULL
- `created_at` (datetime) NOT NULL

#### `brokers`  (model: `Broker`, file: `contacts.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `name` (str) NOT NULL
- `phone` (str | None) NULL
- `location` (str | None) NULL
- `notes` (str | None) NULL
- `preferences_json` (str | None) NULL
- `commission_type` (str) NOT NULL
- `commission_value` (Decimal | None) NULL
- `default_payment_days` (int | None) NULL
- `default_discount` (Decimal | None) NULL
- `default_delivered_rate` (Decimal | None) NULL
- `default_billty_rate` (Decimal | None) NULL
- `freight_type` (str | None) NULL
- `image_url` (str | None) NULL
- `created_at` (datetime) NOT NULL

#### `suppliers`  (model: `Supplier`, file: `contacts.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `name` (str) NOT NULL
- `phone` (str | None) NULL
- `gst_number` (str | None) NULL
- `default_payment_days` (int | None) NULL
- `default_discount` (Decimal | None) NULL
- `default_delivered_rate` (Decimal | None) NULL
- `default_billty_rate` (Decimal | None) NULL
- `location` (str | None) NULL
- `address` (str | None) NULL
- `notes` (str | None) NULL
- `freight_type` (str | None) NULL
- `ai_memory_enabled` (bool) NOT NULL
- `preferences_json` (str | None) NULL
- `broker_id` (uuid.UUID | None) NULL FK->brokers.id
- `created_at` (datetime) NOT NULL

#### `memberships`  (model: `Membership`, file: `membership.py`)
- `id` (uuid.UUID) PK NOT NULL
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `role` (str) NOT NULL
- `permissions_json` (dict | None) NULL
- `created_at` (datetime) NOT NULL

#### `notifications`  (model: `AppNotification`, file: `notification.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `kind` (str) NOT NULL
- `title` (str) NOT NULL
- `body` (str | None) NULL
- `priority` (str) NOT NULL
- `category` (str) NOT NULL
- `action_route` (str | None) NULL
- `triggered_by_user_id` (uuid.UUID | None) NULL FK->users.id
- `related_item_id` (uuid.UUID | None) NULL
- `related_purchase_id` (uuid.UUID | None) NULL
- `related_supplier_id` (uuid.UUID | None) NULL
- `payload` (dict | None) NULL
- `alert_metadata` (dict | None) NULL
- `read_at` (datetime | None) NULL
- `dedupe_key` (str | None) NULL
- `created_at` (datetime) NOT NULL

#### `daily_usage_logs`  (model: `DailyUsageLog`, file: `operations.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `usage_date` (date) NOT NULL
- `opening_qty` (Decimal) NOT NULL
- `purchased_qty` (Decimal) NOT NULL
- `used_qty` (Decimal) NOT NULL
- `closing_qty` (Decimal) NOT NULL
- `logged_by_user_id` (uuid.UUID | None) NULL FK->users.id
- `notes` (str | None) NULL
- `created_at` (datetime) NOT NULL

#### `staff_checklist_templates`  (model: `StaffChecklistTemplate`, file: `operations.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID | None) NULL FK->businesses.id
- `slot` (str) NOT NULL
- `task_key` (str) NOT NULL
- `label` (str) NOT NULL
- `sort_order` (int) NOT NULL

#### `staff_checklist_completions`  (model: `StaffChecklistCompletion`, file: `operations.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `checklist_date` (date) NOT NULL
- `slot` (str) NOT NULL
- `task_key` (str) NOT NULL
- `completed_at` (datetime) NOT NULL
- `notes` (str | None) NULL

#### `password_reset_tokens`  (model: `PasswordResetToken`, file: `password_reset.py`)
- `id` (uuid.UUID) PK NOT NULL
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `token_hash` (str) UNIQUE NOT NULL
- `expires_at` (datetime) NOT NULL
- `used_at` (datetime | None) NULL
- `created_at` (datetime) NOT NULL

#### `purchase_damage_reports`  (model: `PurchaseDamageReport`, file: `purchase_damage_report.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `purchase_id` (uuid.UUID) NOT NULL FK->trade_purchases.id
- `catalog_item_id` (uuid.UUID | None) NULL FK->catalog_items.id
- `item_name` (str) NOT NULL
- `qty_damaged` (Decimal) NOT NULL
- `unit` (str | None) NULL
- `damage_type` (str) NOT NULL
- `reason` (str | None) NULL
- `status` (str) NOT NULL
- `photo_url` (str | None) NULL
- `notes` (str | None) NULL
- `reported_by_user_id` (uuid.UUID | None) NULL FK->users.id
- `created_at` (datetime) NOT NULL

#### `purchase_lifecycle_events`  (model: `PurchaseLifecycleEvent`, file: `purchase_lifecycle_event.py`)
- `id` (uuid.UUID) PK NOT NULL
- `purchase_id` (uuid.UUID) NOT NULL FK->trade_purchases.id
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `from_status` (str | None) NULL
- `to_status` (str) NOT NULL
- `actor_id` (uuid.UUID | None) NULL FK->users.id
- `actor_name` (str | None) NULL
- `notes` (str | None) NULL
- `event_metadata` (dict) NOT NULL
- `created_at` (datetime) NOT NULL

#### `reorder_list`  (model: `ReorderListEntry`, file: `reorder_list.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `added_by` (uuid.UUID) NULL FK->users.id
- `added_by_name` (str | None) NULL
- `status` (str) NOT NULL
- `created_at` (datetime) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `report_saved_views`  (model: `ReportSavedView`, file: `report_saved_view.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `name` (str) NOT NULL
- `tab` (str) NOT NULL
- `filters_json` (dict) NOT NULL
- `is_default` (bool) NOT NULL
- `created_at` (datetime) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `staff_purchase_logs`  (model: `StaffPurchaseLog`, file: `staff_purchase_log.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `item_name` (str) NOT NULL
- `qty` (Decimal) NOT NULL
- `unit` (str | None) NULL
- `amount` (Decimal | None) NULL
- `supplier_id` (uuid.UUID | None) NULL FK->suppliers.id
- `supplier_name` (str | None) NULL
- `broker_id` (uuid.UUID | None) NULL FK->brokers.id
- `broker_name` (str | None) NULL
- `notes` (str | None) NULL
- `idempotency_key` (str | None) NULL
- `stock_movement_id` (uuid.UUID | None) NULL FK->stock_movements.id
- `created_by` (uuid.UUID | None) NULL FK->users.id
- `created_by_name` (str | None) NULL
- `created_at` (datetime) NOT NULL

#### `stock_adjustment_log`  (model: `StockAdjustmentLog`, file: `stock_adjustment.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `old_qty` (Decimal) NOT NULL
- `new_qty` (Decimal) NOT NULL
- `adjustment_type` (str) NOT NULL
- `reason` (str | None) NULL
- `updated_by` (uuid.UUID | None) NULL FK->users.id
- `updated_by_name` (str | None) NULL
- `updated_at` (datetime) NOT NULL

#### `stock_audits`  (model: `StockAudit`, file: `stock_audit.py`)
- `id` (uuid.UUID) PK NOT NULL
- `audit_date` (date) NOT NULL
- `auditor_id` (uuid.UUID | None) NULL FK->users.id
- `business_id` (uuid.UUID | None) NULL FK->businesses.id
- `status` (str) NOT NULL
- `notes` (str | None) NULL
- `created_at` (datetime) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `stock_audit_items`  (model: `StockAuditItem`, file: `stock_audit.py`)
- `id` (uuid.UUID) PK NOT NULL
- `audit_id` (uuid.UUID) NOT NULL FK->stock_audits.id
- `item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `system_qty` (Decimal) NOT NULL
- `counted_qty` (Decimal) NOT NULL
- `difference_qty` (Decimal) NOT NULL
- `line_status` (str) NOT NULL
- `adjustment_type` (str | None) NULL
- `reason` (str | None) NULL
- `notes` (str | None) NULL

#### `stock_dispute_cases`  (model: `StockDisputeCase`, file: `stock_dispute_case.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `status` (str) NOT NULL
- `reason` (str | None) NULL
- `notes` (str | None) NULL
- `created_by` (uuid.UUID | None) NULL FK->users.id
- `created_at` (datetime) NOT NULL
- `resolved_at` (datetime | None) NULL
- `resolved_by` (uuid.UUID | None) NULL FK->users.id

#### `stock_movements`  (model: `StockMovement`, file: `stock_movement.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `movement_kind` (str) NOT NULL
- `delta_qty` (Decimal) NOT NULL
- `qty_before` (Decimal) NOT NULL
- `qty_after` (Decimal) NOT NULL
- `stock_unit` (str | None) NULL
- `reason` (str | None) NULL
- `notes` (str | None) NULL
- `source_type` (str | None) NULL
- `source_id` (uuid.UUID | None) NULL
- `idempotency_key` (str) NOT NULL
- `actor_id` (uuid.UUID | None) NULL FK->users.id
- `actor_name` (str | None) NULL
- `unit_mismatch_flag` (bool) NOT NULL
- `metadata_json` (dict | None) NULL
- `created_at` (datetime) NOT NULL

#### `stock_physical_counts`  (model: `StockPhysicalCount`, file: `stock_physical_count.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `system_qty` (Decimal) NOT NULL
- `counted_qty` (Decimal) NOT NULL
- `difference_qty` (Decimal) NOT NULL
- `purchased_qty` (Decimal | None) NULL
- `stock_unit` (str | None) NULL
- `period_start` (date | None) NULL
- `period_end` (date | None) NULL
- `notes` (str | None) NULL
- `counted_by` (uuid.UUID | None) NULL FK->users.id
- `counted_by_name` (str | None) NULL
- `counted_at` (datetime) NOT NULL
- `idempotency_key` (str | None) NULL

#### `supplier_item_defaults`  (model: `SupplierItemDefault`, file: `supplier_item_default.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `supplier_id` (uuid.UUID) NOT NULL FK->suppliers.id
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `last_price` (Decimal | None) NULL
- `last_discount` (Decimal | None) NULL
- `last_payment_days` (int | None) NULL
- `purchase_count` (int) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `broker_supplier_m2m`  (model: `BrokerSupplierLink`, file: `trade_purchase.py`)
- `id` (uuid.UUID) PK NOT NULL
- `broker_id` (uuid.UUID) NOT NULL FK->brokers.id
- `supplier_id` (uuid.UUID) NOT NULL FK->suppliers.id
- `created_at` (datetime) NOT NULL

#### `trade_purchases`  (model: `TradePurchase`, file: `trade_purchase.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `human_id` (str) NOT NULL
- `invoice_number` (str | None) NULL
- `purchase_date` (date) NOT NULL
- `supplier_id` (uuid.UUID) NOT NULL FK->suppliers.id
- `broker_id` (uuid.UUID | None) NULL FK->brokers.id
- `payment_days` (int | None) NULL
- `due_date` (date | None) NULL
- `paid_amount` (Decimal) NOT NULL
- `paid_at` (datetime | None) NULL
- `discount` (Decimal | None) NULL
- `commission_percent` (Decimal | None) NULL
- `commission_mode` (str | None) NULL
- `commission_money` (Decimal | None) NULL
- `delivered_rate` (Decimal | None) NULL
- `billty_rate` (Decimal | None) NULL
- `freight_amount` (Decimal | None) NULL
- `freight_type` (str | None) NULL
- `total_qty` (Decimal | None) NULL
- `total_amount` (Decimal) NOT NULL
- `total_landing_subtotal` (Decimal | None) NULL
- `total_selling_subtotal` (Decimal | None) NULL
- `total_line_profit` (Decimal | None) NULL
- `status` (str) NOT NULL
- `is_delivered` (bool) NOT NULL
- `delivery_status` (str) NOT NULL
- `delivered_at` (datetime | None) NULL
- `delivery_notes` (str | None) NULL
- `dispatched_at` (datetime | None) NULL
- `arrived_at` (datetime | None) NULL
- `staff_verified_at` (datetime | None) NULL
- `staff_verified_by` (uuid.UUID | None) NULL FK->users.id
- `staff_verified_by_name` (str | None) NULL
- `stock_committed_at` (datetime | None) NULL
- `staff_verified_qty` (Decimal | None) NULL
- `delivered_qty_committed` (Decimal | None) NULL
- `dispatch_note` (str | None) NULL
- `truck_number` (str | None) NULL
- `driver_contact` (str | None) NULL
- `created_at` (datetime) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `trade_purchase_lines`  (model: `TradePurchaseLine`, file: `trade_purchase.py`)
- `id` (uuid.UUID) PK NOT NULL
- `trade_purchase_id` (uuid.UUID) NOT NULL FK->trade_purchases.id
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `item_name` (str) NOT NULL
- `qty` (Decimal) NOT NULL
- `unit` (str) NOT NULL
- `qty_in_stock_unit` (Decimal | None) NULL
- `unit_type` (str | None) NULL
- `purchase_rate` (Decimal | None) NULL
- `selling_rate` (Decimal | None) NULL
- `freight_type` (str | None) NULL
- `freight_value` (Decimal | None) NULL
- `delivered_rate` (Decimal | None) NULL
- `billty_rate` (Decimal | None) NULL
- `weight_per_unit` (Decimal | None) NULL
- `total_weight` (Decimal | None) NULL
- `line_total` (Decimal | None) NULL
- `profit` (Decimal | None) NULL
- `box_mode` (str | None) NULL
- `items_per_box` (Decimal | None) NULL
- `weight_per_item` (Decimal | None) NULL
- `kg_per_box` (Decimal | None) NULL
- `weight_per_tin` (Decimal | None) NULL
- `landing_cost` (Decimal) NOT NULL
- `kg_per_unit` (Decimal | None) NULL
- `landing_cost_per_kg` (Decimal | None) NULL
- `selling_cost` (Decimal | None) NULL
- `discount` (Decimal | None) NULL
- `tax_percent` (Decimal | None) NULL
- `tax_mode` (str | None) NULL
- `payment_days` (int | None) NULL
- `hsn_code` (str | None) NULL
- `item_code` (str | None) NULL
- `description` (str | None) NULL
- `received_qty` (Decimal | None) NULL
- `damaged_qty` (Decimal | None) NULL
- `return_qty` (Decimal | None) NULL

#### `trade_purchase_drafts`  (model: `TradePurchaseDraft`, file: `trade_purchase.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `step` (int) NOT NULL
- `payload_json` (str) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `master_units`  (model: `MasterUnit`, file: `unit_intelligence.py`)
- `id` (uuid.UUID) PK NOT NULL
- `unit_code` (str) NOT NULL
- `display_name` (str | None) NULL
- `category` (str | None) NULL
- `conversion_supported` (bool) NOT NULL
- `active` (bool) NOT NULL
- `created_at` (datetime) NOT NULL

#### `item_packaging_profiles`  (model: `ItemPackagingProfile`, file: `unit_intelligence.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `package_type` (str | None) NULL
- `package_size` (Decimal | None) NULL
- `package_measurement` (str | None) NULL
- `selling_unit` (str | None) NULL
- `stock_unit` (str | None) NULL
- `display_unit` (str | None) NULL
- `conversion_factor` (Decimal | None) NULL
- `confidence_score` (Decimal | None) NULL
- `ai_generated` (bool) NOT NULL
- `updated_by_learning` (bool) NOT NULL
- `created_at` (datetime) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `ocr_item_aliases`  (model: `OcrItemAlias`, file: `unit_intelligence.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `alias` (str) NOT NULL
- `normalized_alias` (str) NOT NULL
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `confidence` (Decimal | None) NULL
- `source` (str | None) NULL
- `usage_count` (int) NOT NULL
- `created_at` (datetime) NOT NULL
- `updated_at` (datetime) NOT NULL

#### `smart_unit_rules`  (model: `SmartUnitRule`, file: `unit_intelligence.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID | None) NULL FK->businesses.id
- `keyword_pattern` (str) NOT NULL
- `category` (str | None) NULL
- `resulting_unit` (str | None) NULL
- `package_type` (str | None) NULL
- `confidence` (Decimal | None) NULL
- `active` (bool) NOT NULL
- `created_at` (datetime) NOT NULL

#### `item_learning_history`  (model: `ItemLearningHistory`, file: `unit_intelligence.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `detected_pattern` (str | None) NULL
- `selected_unit` (str | None) NULL
- `corrected_by_user` (bool) NOT NULL
- `learning_score` (Decimal | None) NULL
- `created_at` (datetime) NOT NULL

#### `unit_confidence_logs`  (model: `UnitConfidenceLog`, file: `unit_intelligence.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `catalog_item_id` (uuid.UUID | None) NULL FK->catalog_items.id
- `source` (str | None) NULL
- `score` (Decimal | None) NULL
- `payload_json` (dict | None) NULL
- `created_at` (datetime) NOT NULL

#### `ai_item_profiles`  (model: `AiItemProfile`, file: `unit_intelligence.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `catalog_item_id` (uuid.UUID) NOT NULL FK->catalog_items.id
- `profile_json` (dict | None) NULL
- `updated_at` (datetime) NOT NULL

#### `smart_package_rules`  (model: `SmartPackageRule`, file: `unit_intelligence.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID | None) NULL FK->businesses.id
- `keyword_pattern` (str) NOT NULL
- `package_type` (str) NOT NULL
- `priority` (int) NOT NULL
- `active` (bool) NOT NULL
- `created_at` (datetime) NOT NULL

#### `users`  (model: `User`, file: `user.py`)
- `id` (uuid.UUID) PK NOT NULL
- `email` (str) UNIQUE NOT NULL
- `username` (str) UNIQUE NOT NULL
- `password_hash` (str | None) NULL
- `google_sub` (str | None) UNIQUE NULL
- `phone` (str | None) UNIQUE NULL
- `name` (str | None) NULL
- `is_super_admin` (bool) NOT NULL
- `ai_monthly_token_budget` (int | None) NULL
- `ai_tokens_used_month` (int) NOT NULL
- `is_active` (bool) NOT NULL
- `is_blocked` (bool) NOT NULL
- `token_version` (int) NOT NULL
- `last_login_at` (datetime | None) NULL
- `last_active_at` (datetime | None) NULL
- `device_info` (dict | None) NULL
- `created_by` (uuid.UUID | None) NULL FK->users.id
- `created_at` (datetime) NOT NULL
- `deleted_at` (datetime | None) NULL
- `notes` (str | None) NULL

#### `user_sessions`  (model: `UserSession`, file: `user_session.py`)
- `id` (uuid.UUID) PK NOT NULL
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `business_id` (uuid.UUID | None) NULL FK->businesses.id
- `login_at` (datetime) NOT NULL
- `logout_at` (datetime | None) NULL
- `device_info` (dict | None) NULL
- `is_active` (bool) NOT NULL

#### `staff_activity_log`  (model: `StaffActivityLog`, file: `user_session.py`)
- `id` (uuid.UUID) PK NOT NULL
- `business_id` (uuid.UUID) NOT NULL FK->businesses.id
- `user_id` (uuid.UUID) NOT NULL FK->users.id
- `user_name` (str | None) NULL
- `action_type` (str) NOT NULL
- `item_id` (uuid.UUID | None) NULL FK->catalog_items.id
- `item_name` (str | None) NULL
- `details` (dict | None) NULL
- `created_at` (datetime) NOT NULL

#### `webhook_event_logs`  (model: `WebhookEventLog`, file: `webhook_event_log.py`)
- `id` (str) PK NOT NULL
- `provider` (str) NOT NULL
- `received_at` (datetime) NOT NULL
- `payload_preview` (str | None) NULL

## Cross-cutting observations (from the column data above, for SQL Server migration planning)

1. **Every business-scoped table carries `business_id` as a FK to `businesses.id`.** This is the multi-tenancy boundary. Confirmed by direct inspection across `business_goals`, `item_categories`, `catalog_items`, `trade_purchases`, and others. The SQL Server schema must preserve this FK on every equivalent table, and `054_enable_rls_business_policies.sql` (Postgres Row-Level Security) needs an equivalent enforcement strategy in SQL Server (native RLS via `CREATE SECURITY POLICY`, or enforced entirely at the Node/Express service layer — **architecture decision needed**, flagged for `Migration_Master_Plan`).
2. **UUID primary keys throughout** (`uuid.UUID`, Postgres native `Uuid` type) — SQL Server equivalent is `UNIQUEIDENTIFIER`. Straightforward 1:1 mapping.
3. **`Decimal` used extensively for money/quantity fields** (`trade_purchases`, `trade_purchase_lines` — paid_amount, discount, commission, freight, totals, etc.) — confirms `services/decimal_precision.py` is doing deliberate fixed-point math, not floats. SQL Server `DECIMAL(p,s)` — exact precision/scale per column needs to be pulled from the raw SQL migrations (Postgres `NUMERIC` doesn't declare precision at the ORM layer here), not guessed as a default.
4. **JSON/JSONB columns** appear on `User.device_info`, `Membership.permissions_json`, `AdminAuditLog.details`, `ApiUsageLog.meta`, and others (pattern: `JSON().with_variant(JSONB, "postgresql")`). SQL Server equivalent: `NVARCHAR(MAX)` with `JSON` functions, or native SQL Server 2022 JSON type support — needs explicit mapping decision per column, especially anywhere the app does JSON containment queries (Postgres `@>` / JSONB operators) — those queries do not have a syntactic equivalent in T-SQL and must be rewritten, not just schema-ported.
5. **Soft-delete pattern:** `deleted_at` nullable timestamp appears on `User` and likely others (needs full-table confirmation) — preserve in SQL Server schema and in every Node/Express repository's default query filter.
6. **Full table list for the migration checklist (46 tables, verified via `grep -c __tablename__ backend/app/models/*.py`):**
   `admin_audit_logs`, `ai_item_profiles`, `api_usage_logs`, `broker_supplier_m2m`, `brokers`, `business_goals`, `businesses`, `catalog_item_default_brokers`, `catalog_item_default_suppliers`, `catalog_items`, `catalog_variants`, `category_types`, `daily_usage_logs`, `item_categories`, `item_learning_history`, `item_packaging_profiles`, `master_units`, `memberships`, `notifications`, `ocr_item_aliases`, `password_reset_tokens`, `purchase_damage_reports`, `purchase_lifecycle_events`, `reorder_list`, `report_saved_views`, `smart_package_rules`, `smart_unit_rules`, `staff_activity_log`, `staff_checklist_completions`, `staff_checklist_templates`, `staff_purchase_logs`, `stock_adjustment_log`, `stock_audit_items`, `stock_audits`, `stock_dispute_cases`, `stock_movements`, `stock_physical_counts`, `supplier_item_defaults`, `suppliers`, `trade_purchase_drafts`, `trade_purchase_lines`, `trade_purchases`, `unit_confidence_logs`, `user_sessions`, `users`, `webhook_event_logs`.

   *(Earlier drafts of this document undercounted at 39 tables — a mistake carried over from `03_Module_Inventory.md`, which had counted the 29 model **files**, not the 46 table declarations within them, since several files define multiple tables — e.g. `catalog.py` defines 6, `unit_intelligence.py` defines 7, `trade_purchase.py` defines 3. All counts across `01`, `02`, `03`, and this file have been corrected to 46.)*

## Not yet covered (next batch)

- Relationships/cardinality diagram (`23_Relationships.md`, `24_ER_Diagram.md`) — needs `relationship(...)` lines parsed (excluded from this extraction, which focused on columns)
- Full constraint/index detail from the 60 raw SQL files (`25_SQL_Migration_Plan.md`, `30_Indexes.md`)
- Stored procedures / functions / triggers / views — Postgres doesn't typically use these as heavily as SQL Server; need to check `backend/sql/*.sql` for `CREATE FUNCTION`/`CREATE TRIGGER`/`CREATE VIEW` statements specifically (`26–29`)
- Exact `NUMERIC(p,s)` precision per money/quantity column (must come from raw SQL, not the ORM)
