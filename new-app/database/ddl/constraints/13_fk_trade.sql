-- Phase 2.4 — FK constraints: Trade
-- Source: docs/23_Relationships.md (ORM ForeignKeys only)
-- Apply after 00-06 CREATE TABLE scripts.

ALTER TABLE trade_purchases
    ADD CONSTRAINT FK_trade_purchases_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE trade_purchases
    ADD CONSTRAINT FK_trade_purchases_user_id
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE trade_purchases
    ADD CONSTRAINT FK_trade_purchases_supplier_id
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

ALTER TABLE trade_purchases
    ADD CONSTRAINT FK_trade_purchases_broker_id
    FOREIGN KEY (broker_id) REFERENCES brokers(id);

ALTER TABLE trade_purchases
    ADD CONSTRAINT FK_trade_purchases_staff_verified_by
    FOREIGN KEY (staff_verified_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE trade_purchase_lines
    ADD CONSTRAINT FK_trade_purchase_lines_trade_purchase_id
    FOREIGN KEY (trade_purchase_id) REFERENCES trade_purchases(id) ON DELETE CASCADE;

ALTER TABLE trade_purchase_lines
    ADD CONSTRAINT FK_trade_purchase_lines_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id);

ALTER TABLE trade_purchase_drafts
    ADD CONSTRAINT FK_trade_purchase_drafts_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE trade_purchase_drafts
    ADD CONSTRAINT FK_trade_purchase_drafts_user_id
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE purchase_lifecycle_events
    ADD CONSTRAINT FK_purchase_lifecycle_events_purchase_id
    FOREIGN KEY (purchase_id) REFERENCES trade_purchases(id) ON DELETE CASCADE;

ALTER TABLE purchase_lifecycle_events
    ADD CONSTRAINT FK_purchase_lifecycle_events_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE purchase_lifecycle_events
    ADD CONSTRAINT FK_purchase_lifecycle_events_actor_id
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE purchase_damage_reports
    ADD CONSTRAINT FK_purchase_damage_reports_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE purchase_damage_reports
    ADD CONSTRAINT FK_purchase_damage_reports_purchase_id
    FOREIGN KEY (purchase_id) REFERENCES trade_purchases(id) ON DELETE CASCADE;

ALTER TABLE purchase_damage_reports
    ADD CONSTRAINT FK_purchase_damage_reports_catalog_item_id
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE SET NULL;

ALTER TABLE purchase_damage_reports
    ADD CONSTRAINT FK_purchase_damage_reports_reported_by_user_id
    FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
