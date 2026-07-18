-- Phase 2.5 — Indexes: Trade
-- Sources: ORM index=True / Index() + Postgres CREATE INDEX (full btree only)
-- Apply after tables (00-06) and constraints (10-16).

CREATE NONCLUSTERED INDEX IX_trade_purchases_business_id
    ON trade_purchases (business_id);

CREATE NONCLUSTERED INDEX IX_trade_purchases_user_id
    ON trade_purchases (user_id);

CREATE NONCLUSTERED INDEX IX_trade_purchases_human_id
    ON trade_purchases (human_id);

CREATE NONCLUSTERED INDEX IX_trade_purchases_purchase_date
    ON trade_purchases (purchase_date);

CREATE NONCLUSTERED INDEX IX_trade_purchases_supplier_id
    ON trade_purchases (supplier_id);

CREATE NONCLUSTERED INDEX IX_trade_purchases_broker_id
    ON trade_purchases (broker_id);

CREATE NONCLUSTERED INDEX IX_trade_purchases_due_date
    ON trade_purchases (due_date);

CREATE NONCLUSTERED INDEX idx_trade_purchases_business_purchase_date
    ON trade_purchases (business_id, purchase_date);

CREATE NONCLUSTERED INDEX ix_trade_purchases_biz_date_status
    ON trade_purchases (business_id, purchase_date, status);

CREATE NONCLUSTERED INDEX ix_trade_purchases_biz_status_date
    ON trade_purchases (business_id, status, purchase_date);

CREATE NONCLUSTERED INDEX ix_trade_purchases_delivery_status
    ON trade_purchases (business_id, delivery_status, created_at);

CREATE NONCLUSTERED INDEX IX_trade_purchase_lines_trade_purchase_id
    ON trade_purchase_lines (trade_purchase_id);

CREATE NONCLUSTERED INDEX IX_trade_purchase_lines_catalog_item_id
    ON trade_purchase_lines (catalog_item_id);

CREATE NONCLUSTERED INDEX ix_trade_purchase_lines_tp_id_item_name
    ON trade_purchase_lines (trade_purchase_id, item_name);

CREATE NONCLUSTERED INDEX ix_trade_purchase_lines_purchase_catalog
    ON trade_purchase_lines (trade_purchase_id, catalog_item_id);

CREATE NONCLUSTERED INDEX IX_trade_purchase_drafts_business_id
    ON trade_purchase_drafts (business_id);

CREATE NONCLUSTERED INDEX IX_trade_purchase_drafts_user_id
    ON trade_purchase_drafts (user_id);

CREATE NONCLUSTERED INDEX IX_purchase_lifecycle_events_purchase_id
    ON purchase_lifecycle_events (purchase_id);

CREATE NONCLUSTERED INDEX IX_purchase_lifecycle_events_business_id
    ON purchase_lifecycle_events (business_id);

CREATE NONCLUSTERED INDEX idx_ple_purchase
    ON purchase_lifecycle_events (purchase_id, created_at);

CREATE NONCLUSTERED INDEX idx_ple_business
    ON purchase_lifecycle_events (business_id, created_at);

CREATE NONCLUSTERED INDEX IX_purchase_damage_reports_business_id
    ON purchase_damage_reports (business_id);

CREATE NONCLUSTERED INDEX IX_purchase_damage_reports_purchase_id
    ON purchase_damage_reports (purchase_id);

CREATE NONCLUSTERED INDEX ix_purchase_damage_reports_business_status
    ON purchase_damage_reports (business_id, status);
