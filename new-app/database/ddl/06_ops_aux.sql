-- Phase 2.3 — Ops / notifications / reports views / checklists / activity
-- Source: notification.py, report_saved_view.py, user_session.py (StaffActivityLog),
--         operations.py
-- No FK REFERENCES (Phase 2.4)
-- Soft UUIDs on notifications: related_item_id, related_purchase_id, related_supplier_id
-- notifications ORM attr alert_metadata → DB column [metadata]

-- ============================================================================
-- notifications
-- ============================================================================
CREATE TABLE notifications (
    id                   UNIQUEIDENTIFIER NOT NULL,
    business_id          UNIQUEIDENTIFIER NOT NULL,
    user_id              UNIQUEIDENTIFIER NOT NULL,
    kind                 NVARCHAR(64)     NOT NULL,
    title                NVARCHAR(500)    NOT NULL,
    body                 NVARCHAR(MAX)    NULL,
    priority             NVARCHAR(16)     NOT NULL,
    category             NVARCHAR(32)     NOT NULL,
    action_route         NVARCHAR(256)    NULL,
    triggered_by_user_id UNIQUEIDENTIFIER NULL,
    related_item_id      UNIQUEIDENTIFIER NULL,
    related_purchase_id  UNIQUEIDENTIFIER NULL,
    related_supplier_id  UNIQUEIDENTIFIER NULL,
    payload              NVARCHAR(MAX)    NULL,
    [metadata]           NVARCHAR(MAX)    NULL,
    read_at              DATETIMEOFFSET   NULL,
    dedupe_key           NVARCHAR(220)    NULL,
    created_at           DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_notifications PRIMARY KEY (id)
);

-- ============================================================================
-- report_saved_views
-- ============================================================================
CREATE TABLE report_saved_views (
    id           UNIQUEIDENTIFIER NOT NULL,
    business_id  UNIQUEIDENTIFIER NOT NULL,
    user_id      UNIQUEIDENTIFIER NOT NULL,
    name         NVARCHAR(120)    NOT NULL,
    tab          NVARCHAR(32)     NOT NULL,
    filters_json NVARCHAR(MAX)    NOT NULL,
    is_default   BIT              NOT NULL,
    created_at   DATETIMEOFFSET   NOT NULL,
    updated_at   DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_report_saved_views PRIMARY KEY (id)
);

-- ============================================================================
-- staff_activity_log
-- ============================================================================
CREATE TABLE staff_activity_log (
    id          UNIQUEIDENTIFIER NOT NULL,
    business_id UNIQUEIDENTIFIER NOT NULL,
    user_id     UNIQUEIDENTIFIER NOT NULL,
    user_name   NVARCHAR(255)    NULL,
    action_type NVARCHAR(50)     NOT NULL,
    item_id     UNIQUEIDENTIFIER NULL,
    item_name   NVARCHAR(255)    NULL,
    details     NVARCHAR(MAX)    NULL,
    created_at  DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_staff_activity_log PRIMARY KEY (id)
);

-- ============================================================================
-- daily_usage_logs
-- ============================================================================
CREATE TABLE daily_usage_logs (
    id                UNIQUEIDENTIFIER NOT NULL,
    business_id       UNIQUEIDENTIFIER NOT NULL,
    item_id           UNIQUEIDENTIFIER NOT NULL,
    usage_date        DATE             NOT NULL,
    opening_qty       DECIMAL(12,3)    NOT NULL,
    purchased_qty     DECIMAL(12,3)    NOT NULL,
    used_qty          DECIMAL(12,3)    NOT NULL,
    closing_qty       DECIMAL(12,3)    NOT NULL,
    logged_by_user_id UNIQUEIDENTIFIER NULL,
    notes             NVARCHAR(MAX)    NULL,
    created_at        DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_daily_usage_logs PRIMARY KEY (id),
    CONSTRAINT uq_daily_usage_item_date UNIQUE (business_id, item_id, usage_date)
);

-- ============================================================================
-- staff_checklist_templates
-- ============================================================================
CREATE TABLE staff_checklist_templates (
    id          UNIQUEIDENTIFIER NOT NULL,
    business_id UNIQUEIDENTIFIER NULL,
    slot        NVARCHAR(16)     NOT NULL,
    task_key    NVARCHAR(64)     NOT NULL,
    label       NVARCHAR(255)    NOT NULL,
    sort_order  INT              NOT NULL,
    CONSTRAINT PK_staff_checklist_templates PRIMARY KEY (id),
    CONSTRAINT uq_checklist_template UNIQUE (business_id, slot, task_key)
);

-- ============================================================================
-- staff_checklist_completions
-- ============================================================================
CREATE TABLE staff_checklist_completions (
    id             UNIQUEIDENTIFIER NOT NULL,
    business_id    UNIQUEIDENTIFIER NOT NULL,
    user_id        UNIQUEIDENTIFIER NOT NULL,
    checklist_date DATE             NOT NULL,
    slot           NVARCHAR(16)     NOT NULL,
    task_key       NVARCHAR(64)     NOT NULL,
    completed_at   DATETIMEOFFSET   NOT NULL,
    notes          NVARCHAR(MAX)    NULL,
    CONSTRAINT PK_staff_checklist_completions PRIMARY KEY (id),
    CONSTRAINT uq_checklist_completion UNIQUE (business_id, user_id, checklist_date, slot, task_key)
);
