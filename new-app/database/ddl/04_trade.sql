-- Phase 2.3 — Trade purchases / drafts / lifecycle / damage
-- Source: trade_purchase.py, purchase_lifecycle_event.py, purchase_damage_report.py
-- No FK REFERENCES (Phase 2.4)
-- Note: purchase_lifecycle_events ORM attr event_metadata → DB column [metadata]

-- ============================================================================
-- trade_purchases  (many columns — mirror TradePurchase ORM exactly)
-- ============================================================================
CREATE TABLE trade_purchases (
    id                      UNIQUEIDENTIFIER NOT NULL,
    business_id             UNIQUEIDENTIFIER NOT NULL,
    user_id                 UNIQUEIDENTIFIER NOT NULL,
    human_id                NVARCHAR(32)     NOT NULL,
    invoice_number          NVARCHAR(64)     NULL,
    purchase_date           DATE             NOT NULL,
    supplier_id             UNIQUEIDENTIFIER NOT NULL,
    broker_id               UNIQUEIDENTIFIER NULL,
    payment_days            INT              NULL,
    due_date                DATE             NULL,
    paid_amount             DECIMAL(14,2)    NOT NULL,
    paid_at                 DATETIMEOFFSET   NULL,
    discount                DECIMAL(5,2)     NULL,
    commission_percent      DECIMAL(5,2)     NULL,
    commission_mode         NVARCHAR(24)     NULL,
    commission_money        DECIMAL(14,4)    NULL,
    delivered_rate          DECIMAL(12,2)    NULL,
    billty_rate             DECIMAL(12,2)    NULL,
    freight_amount          DECIMAL(12,2)    NULL,
    freight_type            NVARCHAR(16)     NULL,
    total_qty               DECIMAL(12,3)    NULL,
    total_amount            DECIMAL(14,2)    NOT NULL,
    total_landing_subtotal  DECIMAL(14,2)    NULL,
    total_selling_subtotal  DECIMAL(14,2)    NULL,
    total_line_profit       DECIMAL(14,2)    NULL,
    status                  NVARCHAR(24)     NOT NULL,
    is_delivered            BIT              NOT NULL,
    delivery_status         NVARCHAR(30)     NOT NULL,
    delivered_at            DATETIMEOFFSET   NULL,
    delivery_notes          NVARCHAR(MAX)    NULL,
    dispatched_at           DATETIMEOFFSET   NULL,
    arrived_at              DATETIMEOFFSET   NULL,
    staff_verified_at       DATETIMEOFFSET   NULL,
    staff_verified_by       UNIQUEIDENTIFIER NULL,
    staff_verified_by_name  NVARCHAR(255)    NULL,
    stock_committed_at      DATETIMEOFFSET   NULL,
    staff_verified_qty      DECIMAL(12,3)    NULL,
    delivered_qty_committed DECIMAL(12,3)    NULL,
    dispatch_note           NVARCHAR(MAX)    NULL,
    truck_number            NVARCHAR(100)    NULL,
    driver_contact          NVARCHAR(100)    NULL,
    created_at              DATETIMEOFFSET   NOT NULL,
    updated_at              DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_trade_purchases PRIMARY KEY (id),
    CONSTRAINT uq_trade_purchases_business_human UNIQUE (business_id, human_id)
);

-- ============================================================================
-- trade_purchase_lines
-- ============================================================================
CREATE TABLE trade_purchase_lines (
    id                 UNIQUEIDENTIFIER NOT NULL,
    trade_purchase_id  UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id    UNIQUEIDENTIFIER NOT NULL,
    item_name          NVARCHAR(512)    NOT NULL,
    qty                DECIMAL(12,3)    NOT NULL,
    unit               NVARCHAR(32)     NOT NULL,
    qty_in_stock_unit  DECIMAL(12,3)    NULL,
    unit_type          NVARCHAR(16)     NULL,
    purchase_rate      DECIMAL(12,2)    NULL,
    selling_rate       DECIMAL(12,2)    NULL,
    freight_type       NVARCHAR(16)     NULL,
    freight_value      DECIMAL(12,2)    NULL,
    delivered_rate     DECIMAL(12,2)    NULL,
    billty_rate        DECIMAL(12,2)    NULL,
    weight_per_unit    DECIMAL(12,3)    NULL,
    total_weight       DECIMAL(14,3)    NULL,
    line_total         DECIMAL(14,2)    NULL,
    profit             DECIMAL(14,2)    NULL,
    box_mode           NVARCHAR(24)     NULL,
    items_per_box      DECIMAL(12,3)    NULL,
    weight_per_item    DECIMAL(12,3)    NULL,
    kg_per_box         DECIMAL(12,3)    NULL,
    weight_per_tin     DECIMAL(12,3)    NULL,
    landing_cost       DECIMAL(12,2)    NOT NULL,
    kg_per_unit        DECIMAL(12,3)    NULL,
    landing_cost_per_kg DECIMAL(12,2)   NULL,
    selling_cost       DECIMAL(12,2)    NULL,
    discount           DECIMAL(5,2)     NULL,
    tax_percent        DECIMAL(5,2)     NULL,
    tax_mode           NVARCHAR(16)     NULL,
    payment_days       INT              NULL,
    hsn_code           NVARCHAR(32)     NULL,
    item_code          NVARCHAR(64)     NULL,
    description        NVARCHAR(512)    NULL,
    received_qty       DECIMAL(12,3)    NULL,
    damaged_qty        DECIMAL(12,3)    NULL,
    return_qty         DECIMAL(12,3)    NULL,
    CONSTRAINT PK_trade_purchase_lines PRIMARY KEY (id)
);

-- ============================================================================
-- trade_purchase_drafts
-- ============================================================================
CREATE TABLE trade_purchase_drafts (
    id           UNIQUEIDENTIFIER NOT NULL,
    business_id  UNIQUEIDENTIFIER NOT NULL,
    user_id      UNIQUEIDENTIFIER NOT NULL,
    step         INT              NOT NULL,
    payload_json NVARCHAR(MAX)    NOT NULL,
    updated_at   DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_trade_purchase_drafts PRIMARY KEY (id),
    CONSTRAINT uq_trade_purchase_drafts_biz_user UNIQUE (business_id, user_id)
);

-- ============================================================================
-- purchase_lifecycle_events
-- ============================================================================
CREATE TABLE purchase_lifecycle_events (
    id          UNIQUEIDENTIFIER NOT NULL,
    purchase_id UNIQUEIDENTIFIER NOT NULL,
    business_id UNIQUEIDENTIFIER NOT NULL,
    from_status NVARCHAR(50)     NULL,
    to_status   NVARCHAR(50)     NOT NULL,
    actor_id    UNIQUEIDENTIFIER NULL,
    actor_name  NVARCHAR(200)    NULL,
    notes       NVARCHAR(MAX)    NULL,
    [metadata]  NVARCHAR(MAX)    NOT NULL,
    created_at  DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_purchase_lifecycle_events PRIMARY KEY (id)
);

-- ============================================================================
-- purchase_damage_reports
-- ============================================================================
CREATE TABLE purchase_damage_reports (
    id                  UNIQUEIDENTIFIER NOT NULL,
    business_id         UNIQUEIDENTIFIER NOT NULL,
    purchase_id         UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id     UNIQUEIDENTIFIER NULL,
    item_name           NVARCHAR(500)    NOT NULL,
    qty_damaged         DECIMAL(18,4)    NOT NULL,
    unit                NVARCHAR(32)     NULL,
    damage_type         NVARCHAR(32)     NOT NULL,
    reason              NVARCHAR(64)     NULL,
    status              NVARCHAR(32)     NOT NULL,
    photo_url           NVARCHAR(MAX)    NULL,
    notes               NVARCHAR(MAX)    NULL,
    reported_by_user_id UNIQUEIDENTIFIER NULL,
    created_at          DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_purchase_damage_reports PRIMARY KEY (id)
);
