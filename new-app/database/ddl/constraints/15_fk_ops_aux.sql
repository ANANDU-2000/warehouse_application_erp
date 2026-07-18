-- Phase 2.4 — FK constraints: Ops / Aux
-- Source: docs/23_Relationships.md (ORM ForeignKeys only)
-- Soft UUID notifications.related_*: no FK
-- Note: business_goals listed under Ops/Aux in docs/23
-- Apply after 00-06 CREATE TABLE scripts.

ALTER TABLE notifications
    ADD CONSTRAINT FK_notifications_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE notifications
    ADD CONSTRAINT FK_notifications_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications
    ADD CONSTRAINT FK_notifications_triggered_by_user_id
    FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE report_saved_views
    ADD CONSTRAINT FK_report_saved_views_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE report_saved_views
    ADD CONSTRAINT FK_report_saved_views_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE staff_activity_log
    ADD CONSTRAINT FK_staff_activity_log_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE staff_activity_log
    ADD CONSTRAINT FK_staff_activity_log_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE staff_activity_log
    ADD CONSTRAINT FK_staff_activity_log_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE SET NULL;

ALTER TABLE daily_usage_logs
    ADD CONSTRAINT FK_daily_usage_logs_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE daily_usage_logs
    ADD CONSTRAINT FK_daily_usage_logs_item_id
    FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;

ALTER TABLE daily_usage_logs
    ADD CONSTRAINT FK_daily_usage_logs_logged_by_user_id
    FOREIGN KEY (logged_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE staff_checklist_templates
    ADD CONSTRAINT FK_staff_checklist_templates_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE staff_checklist_completions
    ADD CONSTRAINT FK_staff_checklist_completions_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE staff_checklist_completions
    ADD CONSTRAINT FK_staff_checklist_completions_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE business_goals
    ADD CONSTRAINT FK_business_goals_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);
