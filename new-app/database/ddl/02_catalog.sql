-- Phase 2.3 — Catalog / units / packaging intelligence
-- Source: catalog.py, supplier_item_default.py, unit_intelligence.py
-- No FK REFERENCES (Phase 2.4)

-- ============================================================================
-- item_categories
-- ============================================================================
CREATE TABLE item_categories (
    id            UNIQUEIDENTIFIER NOT NULL,
    business_id   UNIQUEIDENTIFIER NOT NULL,
    name          NVARCHAR(255)    NOT NULL,
    is_perishable BIT              NOT NULL,
    created_at    DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_item_categories PRIMARY KEY (id)
);

-- ============================================================================
-- category_types
-- ============================================================================
CREATE TABLE category_types (
    id          UNIQUEIDENTIFIER NOT NULL,
    category_id UNIQUEIDENTIFIER NOT NULL,
    name        NVARCHAR(255)    NOT NULL,
    created_at  DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_category_types PRIMARY KEY (id),
    CONSTRAINT uq_category_types_name UNIQUE (category_id, name)
);

-- ============================================================================
-- catalog_items  (many columns — mirror CatalogItem ORM exactly)
-- ============================================================================
CREATE TABLE catalog_items (
    id                     UNIQUEIDENTIFIER NOT NULL,
    business_id            UNIQUEIDENTIFIER NOT NULL,
    category_id            UNIQUEIDENTIFIER NOT NULL,
    type_id                UNIQUEIDENTIFIER NULL,
    name                   NVARCHAR(512)    NOT NULL,
    default_unit           NVARCHAR(32)     NULL,
    default_kg_per_bag     DECIMAL(12,3)    NULL,
    default_items_per_box  DECIMAL(12,3)    NULL,
    default_weight_per_tin DECIMAL(12,3)    NULL,
    hsn_code               NVARCHAR(32)     NULL,
    barcode                NVARCHAR(64)     NULL,
    public_token           NVARCHAR(64)     NOT NULL,
    item_code              NVARCHAR(64)     NULL,
    tax_percent            DECIMAL(5,2)     NULL,
    default_landing_cost   DECIMAL(12,2)    NULL,
    default_selling_cost   DECIMAL(12,2)    NULL,
    default_purchase_unit  NVARCHAR(32)     NULL,
    default_sale_unit      NVARCHAR(32)     NULL,
    last_purchase_price    DECIMAL(12,2)    NULL,
    last_selling_rate      DECIMAL(12,2)    NULL,
    last_supplier_id       UNIQUEIDENTIFIER NULL,
    last_broker_id         UNIQUEIDENTIFIER NULL,
    last_trade_purchase_id UNIQUEIDENTIFIER NULL,
    last_line_qty          DECIMAL(12,3)    NULL,
    last_line_unit         NVARCHAR(32)     NULL,
    last_line_weight_kg    DECIMAL(14,3)    NULL,
    created_at             DATETIMEOFFSET   NOT NULL,
    normalized_name        NVARCHAR(512)    NULL,
    selling_unit           NVARCHAR(32)     NULL,
    stock_unit             NVARCHAR(32)     NULL,
    display_unit           NVARCHAR(32)     NULL,
    package_type           NVARCHAR(32)     NULL,
    package_size           DECIMAL(14,4)    NULL,
    package_measurement    NVARCHAR(16)     NULL,
    package_volume         DECIMAL(14,4)    NULL,
    package_weight         DECIMAL(14,4)    NULL,
    conversion_factor      DECIMAL(14,6)    NULL,
    ai_detected_unit       NVARCHAR(32)     NULL,
    smart_classification   NVARCHAR(64)     NULL,
    unit_confidence        DECIMAL(5,2)     NULL,
    packaging_confidence   DECIMAL(5,2)     NULL,
    is_loose_item          BIT              NULL,
    is_packaged_item       BIT              NULL,
    auto_detect_enabled    BIT              NOT NULL,
    ml_profile             NVARCHAR(MAX)    NULL,
    validation_status      NVARCHAR(32)     NULL,
    current_stock          DECIMAL(12,3)    NULL,
    stock_version          INT              NOT NULL,
    reorder_level          DECIMAL(12,3)    NULL,
    opening_stock_qty      DECIMAL(12,3)    NULL,
    opening_stock_set_at   DATETIMEOFFSET   NULL,
    opening_stock_set_by   NVARCHAR(255)    NULL,
    opening_stock_locked   BIT              NOT NULL,
    rack_location          NVARCHAR(100)    NULL,
    last_stock_updated_at  DATETIMEOFFSET   NULL,
    last_stock_updated_by  NVARCHAR(255)    NULL,
    eviction_days          INT              NULL,
    last_purchase_at       DATETIMEOFFSET   NULL,
    created_by_user_id     UNIQUEIDENTIFIER NULL,
    updated_by_user_id     UNIQUEIDENTIFIER NULL,
    deleted_at             DATETIMEOFFSET   NULL,
    archived_at            DATETIMEOFFSET   NULL,
    CONSTRAINT PK_catalog_items PRIMARY KEY (id)
);

-- ============================================================================
-- catalog_variants
-- ============================================================================
CREATE TABLE catalog_variants (
    id                 UNIQUEIDENTIFIER NOT NULL,
    business_id        UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id    UNIQUEIDENTIFIER NOT NULL,
    name               NVARCHAR(512)    NOT NULL,
    default_kg_per_bag DECIMAL(12,3)    NULL,
    created_at         DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_catalog_variants PRIMARY KEY (id)
);

-- ============================================================================
-- catalog_item_default_suppliers
-- ============================================================================
CREATE TABLE catalog_item_default_suppliers (
    id              UNIQUEIDENTIFIER NOT NULL,
    business_id     UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id UNIQUEIDENTIFIER NOT NULL,
    supplier_id     UNIQUEIDENTIFIER NOT NULL,
    sort_order      INT              NOT NULL,
    CONSTRAINT PK_catalog_item_default_suppliers PRIMARY KEY (id),
    CONSTRAINT uq_citem_def_supplier UNIQUE (catalog_item_id, supplier_id)
);

-- ============================================================================
-- catalog_item_default_brokers
-- ============================================================================
CREATE TABLE catalog_item_default_brokers (
    id              UNIQUEIDENTIFIER NOT NULL,
    business_id     UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id UNIQUEIDENTIFIER NOT NULL,
    broker_id       UNIQUEIDENTIFIER NOT NULL,
    sort_order      INT              NOT NULL,
    CONSTRAINT PK_catalog_item_default_brokers PRIMARY KEY (id),
    CONSTRAINT uq_citem_def_broker UNIQUE (catalog_item_id, broker_id)
);

-- ============================================================================
-- supplier_item_defaults
-- ============================================================================
CREATE TABLE supplier_item_defaults (
    id               UNIQUEIDENTIFIER NOT NULL,
    business_id      UNIQUEIDENTIFIER NOT NULL,
    supplier_id      UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id  UNIQUEIDENTIFIER NOT NULL,
    last_price       DECIMAL(12,2)    NULL,
    last_discount    DECIMAL(5,2)     NULL,
    last_payment_days INT             NULL,
    purchase_count   INT              NOT NULL,
    updated_at       DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_supplier_item_defaults PRIMARY KEY (id),
    CONSTRAINT uq_supplier_item_default UNIQUE (business_id, supplier_id, catalog_item_id)
);

-- ============================================================================
-- master_units
-- ============================================================================
CREATE TABLE master_units (
    id                   UNIQUEIDENTIFIER NOT NULL,
    unit_code            NVARCHAR(32)     NOT NULL,
    display_name         NVARCHAR(128)    NULL,
    category             NVARCHAR(64)     NULL,
    conversion_supported BIT              NOT NULL,
    active               BIT              NOT NULL,
    created_at           DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_master_units PRIMARY KEY (id),
    CONSTRAINT uq_master_units_unit_code UNIQUE (unit_code)
);

-- ============================================================================
-- item_packaging_profiles
-- ============================================================================
CREATE TABLE item_packaging_profiles (
    id                   UNIQUEIDENTIFIER NOT NULL,
    business_id          UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id      UNIQUEIDENTIFIER NOT NULL,
    package_type         NVARCHAR(32)     NULL,
    package_size         DECIMAL(14,4)    NULL,
    package_measurement  NVARCHAR(16)     NULL,
    selling_unit         NVARCHAR(32)     NULL,
    stock_unit           NVARCHAR(32)     NULL,
    display_unit         NVARCHAR(32)     NULL,
    conversion_factor    DECIMAL(14,6)    NULL,
    confidence_score     DECIMAL(5,2)     NULL,
    ai_generated         BIT              NOT NULL,
    updated_by_learning  BIT              NOT NULL,
    created_at           DATETIMEOFFSET   NOT NULL,
    updated_at           DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_item_packaging_profiles PRIMARY KEY (id)
);

-- ============================================================================
-- ocr_item_aliases
-- ============================================================================
CREATE TABLE ocr_item_aliases (
    id               UNIQUEIDENTIFIER NOT NULL,
    business_id      UNIQUEIDENTIFIER NOT NULL,
    alias            NVARCHAR(512)    NOT NULL,
    normalized_alias NVARCHAR(512)    NOT NULL,
    catalog_item_id  UNIQUEIDENTIFIER NOT NULL,
    confidence       DECIMAL(5,2)     NULL,
    source           NVARCHAR(32)     NULL,
    usage_count      INT              NOT NULL,
    created_at       DATETIMEOFFSET   NOT NULL,
    updated_at       DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_ocr_item_aliases PRIMARY KEY (id),
    CONSTRAINT uq_ocr_alias_item_norm UNIQUE (business_id, normalized_alias, catalog_item_id)
);

-- ============================================================================
-- smart_unit_rules
-- ============================================================================
CREATE TABLE smart_unit_rules (
    id               UNIQUEIDENTIFIER NOT NULL,
    business_id      UNIQUEIDENTIFIER NULL,
    keyword_pattern  NVARCHAR(255)    NOT NULL,
    category         NVARCHAR(128)    NULL,
    resulting_unit   NVARCHAR(32)     NULL,
    package_type     NVARCHAR(32)     NULL,
    confidence       DECIMAL(5,2)     NULL,
    active           BIT              NOT NULL,
    created_at       DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_smart_unit_rules PRIMARY KEY (id)
);

-- ============================================================================
-- item_learning_history
-- ============================================================================
CREATE TABLE item_learning_history (
    id                UNIQUEIDENTIFIER NOT NULL,
    business_id       UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id   UNIQUEIDENTIFIER NOT NULL,
    detected_pattern  NVARCHAR(512)    NULL,
    selected_unit     NVARCHAR(32)     NULL,
    corrected_by_user BIT              NOT NULL,
    learning_score    DECIMAL(8,3)     NULL,
    created_at        DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_item_learning_history PRIMARY KEY (id)
);

-- ============================================================================
-- unit_confidence_logs
-- ============================================================================
CREATE TABLE unit_confidence_logs (
    id              UNIQUEIDENTIFIER NOT NULL,
    business_id     UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id UNIQUEIDENTIFIER NULL,
    source          NVARCHAR(64)     NULL,
    score           DECIMAL(5,2)     NULL,
    payload_json    NVARCHAR(MAX)    NULL,
    created_at      DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_unit_confidence_logs PRIMARY KEY (id)
);

-- ============================================================================
-- ai_item_profiles
-- ============================================================================
CREATE TABLE ai_item_profiles (
    id              UNIQUEIDENTIFIER NOT NULL,
    business_id     UNIQUEIDENTIFIER NOT NULL,
    catalog_item_id UNIQUEIDENTIFIER NOT NULL,
    profile_json    NVARCHAR(MAX)    NULL,
    updated_at      DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_ai_item_profiles PRIMARY KEY (id),
    CONSTRAINT uq_ai_item_profile_item UNIQUE (business_id, catalog_item_id)
);

-- ============================================================================
-- smart_package_rules
-- ============================================================================
CREATE TABLE smart_package_rules (
    id              UNIQUEIDENTIFIER NOT NULL,
    business_id     UNIQUEIDENTIFIER NULL,
    keyword_pattern NVARCHAR(255)    NOT NULL,
    package_type    NVARCHAR(32)     NOT NULL,
    priority        INT              NOT NULL,
    active          BIT              NOT NULL,
    created_at      DATETIMEOFFSET   NOT NULL,
    CONSTRAINT PK_smart_package_rules PRIMARY KEY (id)
);
