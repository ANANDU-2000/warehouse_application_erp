-- Phase 2.5 — Indexes: Contacts
-- Sources: ORM index=True
-- Apply after tables (00-06) and constraints (10-16).

CREATE NONCLUSTERED INDEX IX_brokers_business_id
    ON brokers (business_id);

CREATE NONCLUSTERED INDEX IX_suppliers_business_id
    ON suppliers (business_id);

CREATE NONCLUSTERED INDEX IX_broker_supplier_m2m_broker_id
    ON broker_supplier_m2m (broker_id);

CREATE NONCLUSTERED INDEX IX_broker_supplier_m2m_supplier_id
    ON broker_supplier_m2m (supplier_id);
