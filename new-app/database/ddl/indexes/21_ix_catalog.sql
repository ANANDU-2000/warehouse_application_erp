-- Phase 2.5 — Indexes: Catalog
-- Sources: ORM index=True + Postgres CREATE INDEX
-- Skipped: master_units.unit_code (UNIQUE); public_token unique index from sql/033 (gap vs 2.3 — see docs/28)
-- Apply after tables (00-06) and constraints (10-16).

CREATE NONCLUSTERED INDEX IX_item_categories_business_id
    ON item_categories (business_id);

CREATE NONCLUSTERED INDEX IX_category_types_category_id
    ON category_types (category_id);

CREATE NONCLUSTERED INDEX IX_catalog_items_business_id
    ON catalog_items (business_id);

CREATE NONCLUSTERED INDEX IX_catalog_items_category_id
    ON catalog_items (category_id);

CREATE NONCLUSTERED INDEX IX_catalog_items_type_id
    ON catalog_items (type_id);

CREATE NONCLUSTERED INDEX IX_catalog_items_barcode
    ON catalog_items (barcode);

CREATE NONCLUSTERED INDEX IX_catalog_items_last_supplier_id
    ON catalog_items (last_supplier_id);

CREATE NONCLUSTERED INDEX IX_catalog_items_last_broker_id
    ON catalog_items (last_broker_id);

CREATE NONCLUSTERED INDEX IX_catalog_items_last_trade_purchase_id
    ON catalog_items (last_trade_purchase_id);

CREATE NONCLUSTERED INDEX IX_catalog_items_normalized_name
    ON catalog_items (normalized_name);

CREATE NONCLUSTERED INDEX IX_catalog_items_deleted_at
    ON catalog_items (deleted_at);

CREATE NONCLUSTERED INDEX IX_catalog_variants_business_id
    ON catalog_variants (business_id);

CREATE NONCLUSTERED INDEX IX_catalog_variants_catalog_item_id
    ON catalog_variants (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_catalog_item_default_suppliers_business_id
    ON catalog_item_default_suppliers (business_id);

CREATE NONCLUSTERED INDEX IX_catalog_item_default_suppliers_catalog_item_id
    ON catalog_item_default_suppliers (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_catalog_item_default_suppliers_supplier_id
    ON catalog_item_default_suppliers (supplier_id);

CREATE NONCLUSTERED INDEX IX_catalog_item_default_brokers_business_id
    ON catalog_item_default_brokers (business_id);

CREATE NONCLUSTERED INDEX IX_catalog_item_default_brokers_catalog_item_id
    ON catalog_item_default_brokers (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_catalog_item_default_brokers_broker_id
    ON catalog_item_default_brokers (broker_id);

CREATE NONCLUSTERED INDEX IX_supplier_item_defaults_business_id
    ON supplier_item_defaults (business_id);

CREATE NONCLUSTERED INDEX IX_supplier_item_defaults_supplier_id
    ON supplier_item_defaults (supplier_id);

CREATE NONCLUSTERED INDEX IX_supplier_item_defaults_catalog_item_id
    ON supplier_item_defaults (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_master_units_active
    ON master_units (active);

CREATE NONCLUSTERED INDEX IX_item_packaging_profiles_business_id
    ON item_packaging_profiles (business_id);

CREATE NONCLUSTERED INDEX IX_item_packaging_profiles_catalog_item_id
    ON item_packaging_profiles (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_ocr_item_aliases_business_id
    ON ocr_item_aliases (business_id);

CREATE NONCLUSTERED INDEX IX_ocr_item_aliases_normalized_alias
    ON ocr_item_aliases (normalized_alias);

CREATE NONCLUSTERED INDEX IX_ocr_item_aliases_catalog_item_id
    ON ocr_item_aliases (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_smart_unit_rules_business_id
    ON smart_unit_rules (business_id);

CREATE NONCLUSTERED INDEX IX_smart_unit_rules_category
    ON smart_unit_rules (category);

CREATE NONCLUSTERED INDEX IX_item_learning_history_business_id
    ON item_learning_history (business_id);

CREATE NONCLUSTERED INDEX IX_item_learning_history_catalog_item_id
    ON item_learning_history (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_item_learning_history_created_at
    ON item_learning_history (created_at);

CREATE NONCLUSTERED INDEX IX_unit_confidence_logs_business_id
    ON unit_confidence_logs (business_id);

CREATE NONCLUSTERED INDEX IX_unit_confidence_logs_catalog_item_id
    ON unit_confidence_logs (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_unit_confidence_logs_created_at
    ON unit_confidence_logs (created_at);

CREATE NONCLUSTERED INDEX IX_ai_item_profiles_business_id
    ON ai_item_profiles (business_id);

CREATE NONCLUSTERED INDEX IX_ai_item_profiles_catalog_item_id
    ON ai_item_profiles (catalog_item_id);

CREATE NONCLUSTERED INDEX IX_smart_package_rules_business_id
    ON smart_package_rules (business_id);
