-- Phase 2.5 — Indexes: Stock
-- Sources: ORM index=True + Postgres CREATE INDEX (full btree only)
-- Note: ix_stock_movements_item_created_desc uses item_id (ORM column; sql/064 said catalog_item_id)
-- Apply after tables (00-06) and constraints (10-16).

CREATE NONCLUSTERED INDEX IX_stock_movements_business_id
    ON stock_movements (business_id);

CREATE NONCLUSTERED INDEX IX_stock_movements_item_id
    ON stock_movements (item_id);

CREATE NONCLUSTERED INDEX IX_stock_movements_movement_kind
    ON stock_movements (movement_kind);

CREATE NONCLUSTERED INDEX IX_stock_movements_source_type
    ON stock_movements (source_type);

CREATE NONCLUSTERED INDEX IX_stock_movements_source_id
    ON stock_movements (source_id);

CREATE NONCLUSTERED INDEX IX_stock_movements_actor_id
    ON stock_movements (actor_id);

CREATE NONCLUSTERED INDEX IX_stock_movements_created_at
    ON stock_movements (created_at);

CREATE NONCLUSTERED INDEX ix_stock_movements_biz_item_created
    ON stock_movements (business_id, item_id, created_at);

CREATE NONCLUSTERED INDEX ix_stock_movements_business_kind_created
    ON stock_movements (business_id, movement_kind, created_at);

CREATE NONCLUSTERED INDEX ix_stock_movements_source
    ON stock_movements (business_id, source_type, source_id);

CREATE NONCLUSTERED INDEX ix_stock_movements_item_created_desc
    ON stock_movements (item_id, created_at);

CREATE NONCLUSTERED INDEX IX_stock_adjustment_log_business_id
    ON stock_adjustment_log (business_id);

CREATE NONCLUSTERED INDEX IX_stock_adjustment_log_item_id
    ON stock_adjustment_log (item_id);

CREATE NONCLUSTERED INDEX IX_stock_adjustment_log_updated_by
    ON stock_adjustment_log (updated_by);

CREATE NONCLUSTERED INDEX IX_stock_adjustment_log_updated_at
    ON stock_adjustment_log (updated_at);

CREATE NONCLUSTERED INDEX idx_stock_adj_business
    ON stock_adjustment_log (business_id, updated_at);

CREATE NONCLUSTERED INDEX IX_stock_physical_counts_business_id
    ON stock_physical_counts (business_id);

CREATE NONCLUSTERED INDEX IX_stock_physical_counts_item_id
    ON stock_physical_counts (item_id);

CREATE NONCLUSTERED INDEX IX_stock_physical_counts_counted_by
    ON stock_physical_counts (counted_by);

CREATE NONCLUSTERED INDEX IX_stock_physical_counts_counted_at
    ON stock_physical_counts (counted_at);

CREATE NONCLUSTERED INDEX ix_stock_physical_counts_business_item_counted
    ON stock_physical_counts (business_id, item_id, counted_at);

CREATE NONCLUSTERED INDEX IX_stock_audits_auditor_id
    ON stock_audits (auditor_id);

CREATE NONCLUSTERED INDEX IX_stock_audits_business_id
    ON stock_audits (business_id);

CREATE NONCLUSTERED INDEX ix_stock_audits_audit_date
    ON stock_audits (audit_date);

CREATE NONCLUSTERED INDEX ix_stock_audits_business_status
    ON stock_audits (business_id, status, audit_date);

CREATE NONCLUSTERED INDEX IX_stock_audit_items_audit_id
    ON stock_audit_items (audit_id);

CREATE NONCLUSTERED INDEX IX_stock_audit_items_item_id
    ON stock_audit_items (item_id);

CREATE NONCLUSTERED INDEX IX_stock_dispute_cases_business_id
    ON stock_dispute_cases (business_id);

CREATE NONCLUSTERED INDEX IX_stock_dispute_cases_item_id
    ON stock_dispute_cases (item_id);

CREATE NONCLUSTERED INDEX ix_stock_dispute_cases_business_status
    ON stock_dispute_cases (business_id, status);

CREATE NONCLUSTERED INDEX ix_stock_dispute_cases_item
    ON stock_dispute_cases (business_id, item_id);

CREATE NONCLUSTERED INDEX IX_reorder_list_business_id
    ON reorder_list (business_id);

CREATE NONCLUSTERED INDEX IX_reorder_list_item_id
    ON reorder_list (item_id);

CREATE NONCLUSTERED INDEX ix_reorder_list_business_status
    ON reorder_list (business_id, status, created_at);

CREATE NONCLUSTERED INDEX IX_staff_purchase_logs_business_id
    ON staff_purchase_logs (business_id);

CREATE NONCLUSTERED INDEX IX_staff_purchase_logs_item_id
    ON staff_purchase_logs (item_id);

CREATE NONCLUSTERED INDEX IX_staff_purchase_logs_supplier_id
    ON staff_purchase_logs (supplier_id);

CREATE NONCLUSTERED INDEX IX_staff_purchase_logs_broker_id
    ON staff_purchase_logs (broker_id);

CREATE NONCLUSTERED INDEX IX_staff_purchase_logs_idempotency_key
    ON staff_purchase_logs (idempotency_key);

CREATE NONCLUSTERED INDEX IX_staff_purchase_logs_stock_movement_id
    ON staff_purchase_logs (stock_movement_id);

CREATE NONCLUSTERED INDEX IX_staff_purchase_logs_created_by
    ON staff_purchase_logs (created_by);

CREATE NONCLUSTERED INDEX IX_staff_purchase_logs_created_at
    ON staff_purchase_logs (created_at);

CREATE NONCLUSTERED INDEX ix_staff_purchase_logs_business_created
    ON staff_purchase_logs (business_id, created_at);

CREATE NONCLUSTERED INDEX ix_staff_purchase_logs_item_created
    ON staff_purchase_logs (item_id, created_at);

CREATE NONCLUSTERED INDEX ix_staff_purchase_logs_biz_item_created
    ON staff_purchase_logs (business_id, item_id, created_at);
