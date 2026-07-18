-- Phase 2.5 — Indexes: Core
-- Sources: ORM index=True + Postgres CREATE INDEX (46 tables)
-- Non-unique only; PK/UNIQUE already in Phase 2.3
-- Apply after tables (00-06) and constraints (10-16).

CREATE NONCLUSTERED INDEX IX_admin_audit_logs_action
    ON admin_audit_logs (action);

CREATE NONCLUSTERED INDEX IX_admin_audit_logs_created_at
    ON admin_audit_logs (created_at);

CREATE NONCLUSTERED INDEX IX_api_usage_logs_business_id
    ON api_usage_logs (business_id);

CREATE NONCLUSTERED INDEX IX_api_usage_logs_provider
    ON api_usage_logs (provider);

CREATE NONCLUSTERED INDEX IX_api_usage_logs_created_at
    ON api_usage_logs (created_at);

CREATE NONCLUSTERED INDEX IX_business_goals_business_id
    ON business_goals (business_id);

CREATE NONCLUSTERED INDEX IX_business_goals_period
    ON business_goals (period);

CREATE NONCLUSTERED INDEX IX_memberships_user_id
    ON memberships (user_id);

CREATE NONCLUSTERED INDEX IX_memberships_business_id
    ON memberships (business_id);

CREATE NONCLUSTERED INDEX IX_password_reset_tokens_user_id
    ON password_reset_tokens (user_id);

CREATE NONCLUSTERED INDEX IX_user_sessions_user_id
    ON user_sessions (user_id);

CREATE NONCLUSTERED INDEX idx_sessions_user
    ON user_sessions (user_id, is_active);
