-- Phase 2.4 — FK constraints: Core
-- Source: docs/23_Relationships.md (ORM ForeignKeys only)
-- Apply after 00-06 CREATE TABLE scripts.

ALTER TABLE users
    ADD CONSTRAINT FK_users_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE memberships
    ADD CONSTRAINT FK_memberships_user_id
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE memberships
    ADD CONSTRAINT FK_memberships_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE user_sessions
    ADD CONSTRAINT FK_user_sessions_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_sessions
    ADD CONSTRAINT FK_user_sessions_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE password_reset_tokens
    ADD CONSTRAINT FK_password_reset_tokens_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE api_usage_logs
    ADD CONSTRAINT FK_api_usage_logs_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE api_usage_logs
    ADD CONSTRAINT FK_api_usage_logs_user_id
    FOREIGN KEY (user_id) REFERENCES users(id);
