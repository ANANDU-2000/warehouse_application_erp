-- Phase 2.4 — FK constraints: Contacts
-- Source: docs/23_Relationships.md (ORM ForeignKeys only)
-- Apply after 00-06 CREATE TABLE scripts.

ALTER TABLE brokers
    ADD CONSTRAINT FK_brokers_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE suppliers
    ADD CONSTRAINT FK_suppliers_business_id
    FOREIGN KEY (business_id) REFERENCES businesses(id);

ALTER TABLE suppliers
    ADD CONSTRAINT FK_suppliers_broker_id
    FOREIGN KEY (broker_id) REFERENCES brokers(id);

ALTER TABLE broker_supplier_m2m
    ADD CONSTRAINT FK_broker_supplier_m2m_broker_id
    FOREIGN KEY (broker_id) REFERENCES brokers(id);

ALTER TABLE broker_supplier_m2m
    ADD CONSTRAINT FK_broker_supplier_m2m_supplier_id
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id);
