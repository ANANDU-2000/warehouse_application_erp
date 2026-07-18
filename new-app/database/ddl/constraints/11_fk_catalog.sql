-- Phase 2.4 — FK constraints: Catalog
-- Source: docs/23_Relationships.md (ORM ForeignKeys only)
-- Apply after 00-06 CREATE TABLE scripts.

ALTER TABLE item_categories
    ADD CONSTRAINT FK_item_categories_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE category_types
    ADD CONSTRAINT FK_category_types_category_id
    FOREIGN KEY (category_id) REFERENCES item_categories(id) ON DELETE CASCADE;

ALTER TABLE catalog_items
    ADD CONSTRAINT FK_catalog_items_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE catalog_items
    ADD CONSTRAINT FK_catalog_items_category_id
    FOREIGN KEY (category_id) REFERENCES item_categories(id);

ALTER TABLE catalog_items
    ADD CONSTRAINT FK_catalog_items_type_id
    FOREIGN KEY (type_id) REFERENCES category_types(id) ON DELETE SET NULL;

ALTER TABLE catalog_items
    ADD CONSTRAINT FK_catalog_items_last_supplier_id
    FOREIGN KEY (last_supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

ALTER TABLE catalog_items
    ADD CONSTRAINT FK_catalog_items_last_broker_id
    FOREIGN KEY (last_broker_id) REFERENCES brokers(id) ON DELETE SET NULL;

ALTER TABLE catalog_items
    ADD CONSTRAINT FK_catalog_items_last_trade_purchase_id
    FOREIGN KEY (last_trade_purchase_id) REFERENCES trade_purchases(id) ON DELETE SET NULL;

ALTER TABLE catalog_items
    ADD CONSTRAINT FK_catalog_items_created_by_user_id
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE catalog_items
    ADD CONSTRAINT FK_catalog_items_updated_by_user_id
    FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE catalog_item_default_suppliers
    ADD CONSTRAINT FK_catalog_item_default_suppliers_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE catalog_item_default_suppliers
    ADD CONSTRAINT FK_catalog_item_default_suppliers_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE catalog_item_default_suppliers
    ADD CONSTRAINT FK_catalog_item_default_suppliers_supplier_id
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;

ALTER TABLE catalog_item_default_brokers
    ADD CONSTRAINT FK_catalog_item_default_brokers_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE catalog_item_default_brokers
    ADD CONSTRAINT FK_catalog_item_default_brokers_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE catalog_item_default_brokers
    ADD CONSTRAINT FK_catalog_item_default_brokers_broker_id
    FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE;

ALTER TABLE catalog_variants
    ADD CONSTRAINT FK_catalog_variants_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE catalog_variants
    ADD CONSTRAINT FK_catalog_variants_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id);

ALTER TABLE supplier_item_defaults
    ADD CONSTRAINT FK_supplier_item_defaults_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE supplier_item_defaults
    ADD CONSTRAINT FK_supplier_item_defaults_supplier_id
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

ALTER TABLE supplier_item_defaults
    ADD CONSTRAINT FK_supplier_item_defaults_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id);

ALTER TABLE item_packaging_profiles
    ADD CONSTRAINT FK_item_packaging_profiles_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE item_packaging_profiles
    ADD CONSTRAINT FK_item_packaging_profiles_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE ocr_item_aliases
    ADD CONSTRAINT FK_ocr_item_aliases_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE ocr_item_aliases
    ADD CONSTRAINT FK_ocr_item_aliases_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE smart_unit_rules
    ADD CONSTRAINT FK_smart_unit_rules_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE item_learning_history
    ADD CONSTRAINT FK_item_learning_history_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE item_learning_history
    ADD CONSTRAINT FK_item_learning_history_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE unit_confidence_logs
    ADD CONSTRAINT FK_unit_confidence_logs_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE unit_confidence_logs
    ADD CONSTRAINT FK_unit_confidence_logs_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE SET NULL;

ALTER TABLE ai_item_profiles
    ADD CONSTRAINT FK_ai_item_profiles_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE ai_item_profiles
    ADD CONSTRAINT FK_ai_item_profiles_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE smart_package_rules
    ADD CONSTRAINT FK_smart_package_rules_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
