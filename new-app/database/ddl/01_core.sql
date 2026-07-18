-- Phase 2.3 — Core identity / tenancy / admin tables
-- Source: business.py, user.py, membership.py, user_session.py (UserSession),
--         password_reset.py, api_usage_log.py, admin_audit_log.py,
--         webhook_event_log.py, business_goal.py
-- No FK REFERENCES (Phase 2.4)

-- ============================================================================
-- businesses
-- ============================================================================
CREATE TABLE businesses (
    id                UNIQUEIDENTIFIER NOT NULL,
    name              NVARCHAR(255)    NOT NULL,
    branding_title    NVARCHAR(128)    NULL,
    branding_logo_url NVARCHAR(512)    NULL,
    gst_number        NVARCHAR(20)     NULL,
    address           NVARCHAR(MAX)    NULL,
    phone             NVARCHAR(32)     NULL,
    contact_email     NVARCHAR(255)    NULL,
    default_currency  NVARCHAR(3)      NOT NULL,
    created_at        DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_businesses PRIMARY KEY (id)
);

-- ============================================================================
-- users
-- ============================================================================
CREATE TABLE users (
    id                      UNIQUEIDENTIFIER NOT NULL,
    email                   NVARCHAR(320)    NOT NULL,
    username                NVARCHAR(64)     NOT NULL,
    password_hash           NVARCHAR(255)    NULL,
    google_sub              NVARCHAR(128)    NULL,
    phone                   NVARCHAR(32)     NULL,
    name                    NVARCHAR(255)    NULL,
    is_super_admin          BIT              NOT NULL,
    ai_monthly_token_budget INT              NULL,
    ai_tokens_used_month    INT              NOT NULL,
    is_active               BIT              NOT NULL,
    is_blocked              BIT              NOT NULL,
    token_version           INT              NOT NULL CONSTRAINT DF_users_token_version DEFAULT (0),
    last_login_at           DATETIMEOFFSET   NULL,
    last_active_at          DATETIMEOFFSET   NULL,
    device_info             NVARCHAR(MAX)    NULL,
    created_by              UNIQUEIDENTIFIER NULL,
    created_at              DATETIMEOFFSET   NOT NULL,
    deleted_at              DATETIMEOFFSET   NULL,
    notes                   NVARCHAR(2000)   NULL,
    CONSTRAINT PK_users PRIMARY KEY (id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT UQ_users_username UNIQUE (username),
    CONSTRAINT UQ_users_google_sub UNIQUE (google_sub),
    CONSTRAINT UQ_users_phone UNIQUE (phone)
);

-- ============================================================================
-- memberships
-- ============================================================================
CREATE TABLE memberships (
    id               UNIQUEIDENTIFIER NOT NULL,
    user_id          UNIQUEIDENTIFIER NOT NULL,
    business_id      UNIQUEIDENTIFIER NOT NULL,
    role             NVARCHAR(32)     NOT NULL,
    permissions_json NVARCHAR(MAX)    NULL,
    created_at       DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_memberships PRIMARY KEY (id),
    CONSTRAINT uq_membership_user_business UNIQUE (user_id, business_id)
);

-- ============================================================================
-- user_sessions
-- ============================================================================
CREATE TABLE user_sessions (
    id          UNIQUEIDENTIFIER NOT NULL,
    user_id     UNIQUEIDENTIFIER NOT NULL,
    business_id UNIQUEIDENTIFIER NULL,
    login_at    DATETIMEOFFSET   NOT NULL,
    logout_at   DATETIMEOFFSET   NULL,
    device_info NVARCHAR(MAX)    NULL,
    is_active   BIT              NOT NULL,
    CONSTRAINT PK_user_sessions PRIMARY KEY (id)
);

-- ============================================================================
-- password_reset_tokens
-- ============================================================================
CREATE TABLE password_reset_tokens (
    id         UNIQUEIDENTIFIER NOT NULL,
    user_id    UNIQUEIDENTIFIER NOT NULL,
    token_hash NVARCHAR(64)     NOT NULL,
    expires_at DATETIMEOFFSET   NOT NULL,
    used_at    DATETIMEOFFSET   NULL,
    created_at DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT UQ_password_reset_tokens_token_hash UNIQUE (token_hash)
);

-- ============================================================================
-- api_usage_logs
-- ============================================================================
CREATE TABLE api_usage_logs (
    id                      UNIQUEIDENTIFIER NOT NULL,
    business_id             UNIQUEIDENTIFIER NULL,
    user_id                 UNIQUEIDENTIFIER NULL,
    provider                NVARCHAR(64)     NOT NULL,
    action                  NVARCHAR(128)    NOT NULL,
    units                   INT              NOT NULL,
    cost_estimate_inr_paise INT              NULL,
    meta                    NVARCHAR(MAX)    NULL,
    created_at              DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_api_usage_logs PRIMARY KEY (id)
);

-- ============================================================================
-- admin_audit_logs
-- ============================================================================
CREATE TABLE admin_audit_logs (
    id            UNIQUEIDENTIFIER NOT NULL,
    actor         NVARCHAR(320)    NOT NULL,
    action        NVARCHAR(128)    NOT NULL,
    resource_type NVARCHAR(64)     NULL,
    resource_id   NVARCHAR(128)    NULL,
    details       NVARCHAR(MAX)    NULL,
    note          NVARCHAR(MAX)    NULL,
    created_at    DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_admin_audit_logs PRIMARY KEY (id)
);

-- ============================================================================
-- webhook_event_logs
-- ============================================================================
CREATE TABLE webhook_event_logs (
    id              NVARCHAR(128)  NOT NULL,
    provider        NVARCHAR(32)   NOT NULL,
    received_at     DATETIMEOFFSET NOT NULL,
    payload_preview NVARCHAR(MAX)  NULL,
    CONSTRAINT PK_webhook_event_logs PRIMARY KEY (id)
);

-- ============================================================================
-- business_goals
-- ============================================================================
CREATE TABLE business_goals (
    id          UNIQUEIDENTIFIER NOT NULL,
    business_id UNIQUEIDENTIFIER NOT NULL,
    period      NVARCHAR(16)     NOT NULL,
    profit_goal DECIMAL(18,4)    NULL,
    volume_goal DECIMAL(18,4)    NULL,
    created_at  DATETIMEOFFSET   NOT NULL,
    updated_at  DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_business_goals PRIMARY KEY (id),
    CONSTRAINT uq_business_goals_biz_period UNIQUE (business_id, period)
);
