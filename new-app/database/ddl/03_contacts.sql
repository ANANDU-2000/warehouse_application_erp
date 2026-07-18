-- Phase 2.3 — Contacts (brokers / suppliers / M2M)
-- Source: contacts.py, trade_purchase.py (BrokerSupplierLink)
-- No FK REFERENCES (Phase 2.4)

-- ============================================================================
-- brokers
-- ============================================================================
CREATE TABLE brokers (
    id                    UNIQUEIDENTIFIER NOT NULL,
    business_id           UNIQUEIDENTIFIER NOT NULL,
    name                  NVARCHAR(255)    NOT NULL,
    phone                 NVARCHAR(15)     NULL,
    location              NVARCHAR(MAX)    NULL,
    notes                 NVARCHAR(MAX)    NULL,
    preferences_json      NVARCHAR(MAX)    NULL,
    commission_type       NVARCHAR(32)     NOT NULL,
    commission_value      DECIMAL(12,2)    NULL,
    default_payment_days  INT              NULL,
    default_discount      DECIMAL(5,2)     NULL,
    default_delivered_rate DECIMAL(12,2)   NULL,
    default_billty_rate   DECIMAL(12,2)    NULL,
    freight_type          NVARCHAR(16)     NULL,
    image_url             NVARCHAR(1024)   NULL,
    created_at            DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_brokers PRIMARY KEY (id)
);

-- ============================================================================
-- suppliers
-- ============================================================================
CREATE TABLE suppliers (
    id                     UNIQUEIDENTIFIER NOT NULL,
    business_id            UNIQUEIDENTIFIER NOT NULL,
    name                   NVARCHAR(255)    NOT NULL,
    phone                  NVARCHAR(32)     NULL,
    gst_number             NVARCHAR(20)     NULL,
    default_payment_days   INT              NULL,
    default_discount       DECIMAL(5,2)     NULL,
    default_delivered_rate DECIMAL(12,2)    NULL,
    default_billty_rate    DECIMAL(12,2)    NULL,
    location               NVARCHAR(MAX)    NULL,
    address                NVARCHAR(MAX)    NULL,
    notes                  NVARCHAR(MAX)    NULL,
    freight_type           NVARCHAR(16)     NULL,
    ai_memory_enabled      BIT              NOT NULL,
    preferences_json       NVARCHAR(MAX)    NULL,
    broker_id              UNIQUEIDENTIFIER NULL,
    created_at             DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_suppliers PRIMARY KEY (id)
);

-- ============================================================================
-- broker_supplier_m2m
-- ============================================================================
CREATE TABLE broker_supplier_m2m (
    id          UNIQUEIDENTIFIER NOT NULL,
    broker_id   UNIQUEIDENTIFIER NOT NULL,
    supplier_id UNIQUEIDENTIFIER NOT NULL,
    created_at  DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_broker_supplier_m2m PRIMARY KEY (id),
    CONSTRAINT uq_broker_supplier_m2m_pair UNIQUE (broker_id, supplier_id)
);
