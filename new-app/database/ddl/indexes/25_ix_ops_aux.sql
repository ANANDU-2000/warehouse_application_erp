-- Phase 2.5 — Indexes: Ops / Aux
-- Sources: ORM index=True + Postgres CREATE INDEX
-- Apply after tables (00-06) and constraints (10-16).

CREATE NONCLUSTERED INDEX IX_notifications_business_id
    ON notifications (business_id);

CREATE NONCLUSTERED INDEX IX_notifications_user_id
    ON notifications (user_id);

CREATE NONCLUSTERED INDEX idx_notifications_user_created
    ON notifications (user_id, created_at);

CREATE NONCLUSTERED INDEX idx_notifications_business_created
    ON notifications (business_id, created_at);

CREATE NONCLUSTERED INDEX ix_notifications_business_category
    ON notifications (business_id, user_id, category, created_at);

CREATE NONCLUSTERED INDEX IX_report_saved_views_business_id
    ON report_saved_views (business_id);

CREATE NONCLUSTERED INDEX IX_report_saved_views_user_id
    ON report_saved_views (user_id);

CREATE NONCLUSTERED INDEX ix_report_saved_views_business_user
    ON report_saved_views (business_id, user_id);

CREATE NONCLUSTERED INDEX ix_report_saved_views_created_at
    ON report_saved_views (created_at);

CREATE NONCLUSTERED INDEX IX_staff_activity_log_business_id
    ON staff_activity_log (business_id);

CREATE NONCLUSTERED INDEX IX_staff_activity_log_user_id
    ON staff_activity_log (user_id);

CREATE NONCLUSTERED INDEX IX_staff_activity_log_created_at
    ON staff_activity_log (created_at);

CREATE NONCLUSTERED INDEX idx_staff_activity_user
    ON staff_activity_log (user_id, created_at);

CREATE NONCLUSTERED INDEX idx_staff_activity_business_user
    ON staff_activity_log (business_id, user_id, created_at);

CREATE NONCLUSTERED INDEX idx_staff_activity_log_biz_date
    ON staff_activity_log (business_id, created_at);

CREATE NONCLUSTERED INDEX ix_staff_activity_user_biz_action_time
    ON staff_activity_log (business_id, user_id, action_type, created_at);

CREATE NONCLUSTERED INDEX IX_daily_usage_logs_business_id
    ON daily_usage_logs (business_id);

CREATE NONCLUSTERED INDEX IX_daily_usage_logs_item_id
    ON daily_usage_logs (item_id);

CREATE NONCLUSTERED INDEX IX_daily_usage_logs_usage_date
    ON daily_usage_logs (usage_date);

CREATE NONCLUSTERED INDEX ix_daily_usage_logs_business_date
    ON daily_usage_logs (business_id, usage_date);

CREATE NONCLUSTERED INDEX IX_staff_checklist_templates_business_id
    ON staff_checklist_templates (business_id);

CREATE NONCLUSTERED INDEX IX_staff_checklist_completions_business_id
    ON staff_checklist_completions (business_id);

CREATE NONCLUSTERED INDEX IX_staff_checklist_completions_user_id
    ON staff_checklist_completions (user_id);

CREATE NONCLUSTERED INDEX IX_staff_checklist_completions_checklist_date
    ON staff_checklist_completions (checklist_date);

CREATE NONCLUSTERED INDEX ix_staff_checklist_completions_biz_date
    ON staff_checklist_completions (business_id, checklist_date);
