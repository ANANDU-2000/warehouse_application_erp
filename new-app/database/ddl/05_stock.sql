-- Phase 2.3 — Stock ledger / audits / reorder / staff purchase logs
-- Source: stock_movement.py, stock_adjustment.py, stock_physical_count.py,
--         stock_audit.py, stock_dispute_case.py, reorder_list.py, staff_purchase_log.py
-- No FK REFERENCES (Phase 2.4)
-- Soft UUID: stock_movements.source_id → UNIQUEIDENTIFIER NULL (no FK)

-- ============================================================================
-- stock_movements
-- ============================================================================
CREATE TABLE stock_movements (
    id                  UNIQUEIDENTIFIER NOT NULL,
    business_id         UNIQUEIDENTIFIER NOT NULL,
    item_id             UNIQUEIDENTIFIER NOT NULL,
    movement_kind       NVARCHAR(50)     NOT NULL,
    delta_qty           DECIMAL(12,3)    NOT NULL,
    qty_before          DECIMAL(12,3)    NOT NULL,
    qty_after           DECIMAL(12,3)    NOT NULL,
    stock_unit          NVARCHAR(32)     NULL,
    reason              NVARCHAR(255)    NULL,
    notes               NVARCHAR(MAX)    NULL,
    source_type         NVARCHAR(50)     NULL,
    source_id           UNIQUEIDENTIFIER NULL,
    idempotency_key     NVARCHAR(120)    NOT NULL,
    actor_id            UNIQUEIDENTIFIER NULL,
    actor_name          NVARCHAR(255)    NULL,
    unit_mismatch_flag  BIT              NOT NULL,
    metadata_json       NVARCHAR(MAX)    NULL,
    created_at          DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_stock_movements PRIMARY KEY (id),
    CONSTRAINT uq_stock_movements_business_idempotency UNIQUE (business_id, idempotency_key)
);

-- ============================================================================
-- stock_adjustment_log
-- ============================================================================
CREATE TABLE stock_adjustment_log (
    id               UNIQUEIDENTIFIER NOT NULL,
    business_id      UNIQUEIDENTIFIER NOT NULL,
    item_id          UNIQUEIDENTIFIER NOT NULL,
    old_qty          DECIMAL(12,3)    NOT NULL,
    new_qty          DECIMAL(12,3)    NOT NULL,
    adjustment_type  NVARCHAR(50)     NOT NULL,
    reason           NVARCHAR(MAX)    NULL,
    updated_by       UNIQUEIDENTIFIER NULL,
    updated_by_name  NVARCHAR(255)    NULL,
    updated_at       DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_stock_adjustment_log PRIMARY KEY (id)
);

-- ============================================================================
-- stock_physical_counts
-- ============================================================================
CREATE TABLE stock_physical_counts (
    id              UNIQUEIDENTIFIER NOT NULL,
    business_id     UNIQUEIDENTIFIER NOT NULL,
    item_id         UNIQUEIDENTIFIER NOT NULL,
    system_qty      DECIMAL(12,3)    NOT NULL,
    counted_qty     DECIMAL(12,3)    NOT NULL,
    difference_qty  DECIMAL(12,3)    NOT NULL,
    purchased_qty   DECIMAL(12,3)    NULL,
    stock_unit      NVARCHAR(32)     NULL,
    period_start    DATE             NULL,
    period_end      DATE             NULL,
    notes           NVARCHAR(MAX)    NULL,
    counted_by      UNIQUEIDENTIFIER NULL,
    counted_by_name NVARCHAR(255)    NULL,
    counted_at      DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_stock_physical_counts PRIMARY KEY (id)
);

-- ============================================================================
-- stock_audits
-- ============================================================================
CREATE TABLE stock_audits (
    id          UNIQUEIDENTIFIER NOT NULL,
    audit_date  DATE             NOT NULL,
    auditor_id  UNIQUEIDENTIFIER NULL,
    business_id UNIQUEIDENTIFIER NULL,
    status      NVARCHAR(32)     NOT NULL,
    notes       NVARCHAR(MAX)    NULL,
    created_at  DATETIMEOFFSET   NOT NULL,
    updated_at  DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_stock_audits PRIMARY KEY (id)
);

-- ============================================================================
-- stock_audit_items
-- ============================================================================
CREATE TABLE stock_audit_items (
    id              UNIQUEIDENTIFIER NOT NULL,
    audit_id        UNIQUEIDENTIFIER NOT NULL,
    item_id         UNIQUEIDENTIFIER NOT NULL,
    system_qty      DECIMAL(10,2)    NOT NULL,
    counted_qty     DECIMAL(10,2)    NOT NULL,
    difference_qty  DECIMAL(10,2)    NOT NULL,
    line_status     NVARCHAR(32)     NOT NULL,
    adjustment_type NVARCHAR(32)     NULL,
    reason          NVARCHAR(MAX)    NULL,
    notes           NVARCHAR(MAX)    NULL,
    CONSTRAINT PK_stock_audit_items PRIMARY KEY (id)
);

-- ============================================================================
-- stock_dispute_cases
-- ============================================================================
CREATE TABLE stock_dispute_cases (
    id          UNIQUEIDENTIFIER NOT NULL,
    business_id UNIQUEIDENTIFIER NOT NULL,
    item_id     UNIQUEIDENTIFIER NOT NULL,
    status      NVARCHAR(32)     NOT NULL,
    reason      NVARCHAR(MAX)    NULL,
    notes       NVARCHAR(MAX)    NULL,
    created_by  UNIQUEIDENTIFIER NULL,
    created_at  DATETIMEOFFSET   NOT NULL,
    resolved_at DATETIMEOFFSET   NULL,
    resolved_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_stock_dispute_cases PRIMARY KEY (id)
);

-- ============================================================================
-- reorder_list
-- ============================================================================
CREATE TABLE reorder_list (
    id            UNIQUEIDENTIFIER NOT NULL,
    business_id   UNIQUEIDENTIFIER NOT NULL,
    item_id       UNIQUEIDENTIFIER NOT NULL,
    added_by      UNIQUEIDENTIFIER NULL,
    added_by_name NVARCHAR(255)    NULL,
    status        NVARCHAR(32)     NOT NULL,
    created_at    DATETIMEOFFSET   NOT NULL,
    updated_at    DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_reorder_list PRIMARY KEY (id)
);

-- ============================================================================
-- staff_purchase_logs
-- ============================================================================
CREATE TABLE staff_purchase_logs (
    id                UNIQUEIDENTIFIER NOT NULL,
    business_id       UNIQUEIDENTIFIER NOT NULL,
    item_id           UNIQUEIDENTIFIER NOT NULL,
    item_name         NVARCHAR(512)    NOT NULL,
    qty               DECIMAL(12,3)    NOT NULL,
    unit              NVARCHAR(32)     NULL,
    amount            DECIMAL(12,2)    NULL,
    supplier_id       UNIQUEIDENTIFIER NULL,
    supplier_name     NVARCHAR(255)    NULL,
    broker_id         UNIQUEIDENTIFIER NULL,
    broker_name       NVARCHAR(255)    NULL,
    notes             NVARCHAR(MAX)    NULL,
    idempotency_key   NVARCHAR(120)    NULL,
    stock_movement_id UNIQUEIDENTIFIER NULL,
    created_by        UNIQUEIDENTIFIER NULL,
    created_by_name   NVARCHAR(255)    NULL,
    created_at        DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_staff_purchase_logs PRIMARY KEY (id)
);
