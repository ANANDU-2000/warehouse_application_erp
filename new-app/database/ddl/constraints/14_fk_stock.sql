-- Phase 2.4 — FK constraints: Stock
-- Source: docs/23_Relationships.md (ORM ForeignKeys only)
-- Soft UUID stock_movements.source_id: no FK
-- Apply after 00-06 CREATE TABLE scripts.

ALTER TABLE stock_movements
    ADD CONSTRAINT FK_stock_movements_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE stock_movements
    ADD CONSTRAINT FK_stock_movements_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE stock_movements
    ADD CONSTRAINT FK_stock_movements_actor_id
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE stock_adjustment_log
    ADD CONSTRAINT FK_stock_adjustment_log_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE stock_adjustment_log
    ADD CONSTRAINT FK_stock_adjustment_log_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE stock_adjustment_log
    ADD CONSTRAINT FK_stock_adjustment_log_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE stock_physical_counts
    ADD CONSTRAINT FK_stock_physical_counts_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE stock_physical_counts
    ADD CONSTRAINT FK_stock_physical_counts_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE stock_physical_counts
    ADD CONSTRAINT FK_stock_physical_counts_counted_by
    FOREIGN KEY (counted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE stock_audits
    ADD CONSTRAINT FK_stock_audits_auditor_id
    FOREIGN KEY (auditor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE stock_audits
    ADD CONSTRAINT FK_stock_audits_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE stock_audit_items
    ADD CONSTRAINT FK_stock_audit_items_audit_id
    FOREIGN KEY (audit_id) REFERENCES stock_audits(id) ON DELETE CASCADE;

ALTER TABLE stock_audit_items
    ADD CONSTRAINT FK_stock_audit_items_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE stock_dispute_cases
    ADD CONSTRAINT FK_stock_dispute_cases_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE stock_dispute_cases
    ADD CONSTRAINT FK_stock_dispute_cases_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE stock_dispute_cases
    ADD CONSTRAINT FK_stock_dispute_cases_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE stock_dispute_cases
    ADD CONSTRAINT FK_stock_dispute_cases_resolved_by
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE reorder_list
    ADD CONSTRAINT FK_reorder_list_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE reorder_list
    ADD CONSTRAINT FK_reorder_list_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE reorder_list
    ADD CONSTRAINT FK_reorder_list_added_by
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE staff_purchase_logs
    ADD CONSTRAINT FK_staff_purchase_logs_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE staff_purchase_logs
    ADD CONSTRAINT FK_staff_purchase_logs_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE staff_purchase_logs
    ADD CONSTRAINT FK_staff_purchase_logs_supplier_id
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

ALTER TABLE staff_purchase_logs
    ADD CONSTRAINT FK_staff_purchase_logs_broker_id
    FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE SET NULL;

ALTER TABLE staff_purchase_logs
    ADD CONSTRAINT FK_staff_purchase_logs_stock_movement_id
    FOREIGN KEY (stock_movement_id) REFERENCES stock_movements(id) ON DELETE SET NULL;

ALTER TABLE staff_purchase_logs
    ADD CONSTRAINT FK_staff_purchase_logs_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
