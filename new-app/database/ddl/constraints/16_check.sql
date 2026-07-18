-- Phase 2.4 — CHECK constraints from latest Postgres SQL migrations
-- Sources: source-app/backend/sql/028, 040, 044, 053, 021, 059
-- Skipped: discrepancy_type CHECK on delivery_discrepancies (table not in 46 ORM tables)
-- Skipped: RLS WITH CHECK (Phase 2.6)
-- Apply after 10-15 FK scripts (order independent vs FKs)

-- ============================================================================
-- memberships.role  (028_user_mgmt_v2.sql → memberships_role_check)
-- ============================================================================
ALTER TABLE memberships
    ADD CONSTRAINT ck_memberships_role
    CHECK (role IN (N'owner', N'admin', N'manager', N'staff'));

-- ============================================================================
-- staff_activity_log.action_type  (059_staff_activity_action_types_v2.sql)
-- ============================================================================
ALTER TABLE staff_activity_log
    ADD CONSTRAINT ck_staff_activity_action_type
    CHECK (action_type IN (
        N'SCAN',
        N'STOCK_UPDATE',
        N'STOCK_PHYSICAL_UPDATE',
        N'STOCK_CORRECTION_RECORDED',
        N'STOCK_DAMAGE_RECORDED',
        N'STOCK_SALE_ADJUSTMENT',
        N'STOCK_QUICK_PURCHASE',
        N'OPENING_STOCK_SET',
        N'PHYSICAL_STOCK_COUNT',
        N'ITEM_CREATE',
        N'ITEM_UPDATE',
        N'PURCHASE_SAVE',
        N'PURCHASE_EDIT',
        N'PURCHASE_CREATE',
        N'PURCHASE_DISPATCHED',
        N'PURCHASE_ARRIVED',
        N'PURCHASE_VERIFIED',
        N'PURCHASE_STOCK_COMMITTED',
        N'PURCHASE_WHATSAPP_SENT',
        N'PURCHASE_WHATSAPP_FAILED',
        N'VERIFICATION',
        N'LOGIN',
        N'LOGOUT',
        N'PASSWORD_RESET',
        N'USER_CREATE',
        N'USER_BLOCK',
        N'USER_DELETE',
        N'BARCODE_PRINT',
        N'BARCODE_COUNT_VERIFY',
        N'REPORT_EXPORT',
        N'DELETE_ACTION',
        N'CHECKLIST_COMPLETE',
        N'USAGE_LOG',
        N'STOCK_AUDIT_LINE',
        N'STOCK_AUDIT_COMPLETE'
    ));

-- ============================================================================
-- trade_purchases.delivery_status  (040_purchase_delivery_tracking.sql)
-- ============================================================================
ALTER TABLE trade_purchases
    ADD CONSTRAINT ck_trade_purchases_delivery_status
    CHECK (delivery_status IN (
        N'pending',
        N'dispatched',
        N'in_transit',
        N'arrived',
        N'staff_verifying',
        N'staff_verified',
        N'stock_committed',
        N'partial',
        N'cancelled'
    ));

-- ============================================================================
-- trade_purchases.status  (053_purchase_lifecycle_statuses.sql)
-- ============================================================================
ALTER TABLE trade_purchases
    ADD CONSTRAINT ck_trade_purchases_status
    CHECK (status IN (
        N'draft',
        N'saved',
        N'confirmed',
        N'active',
        N'approved',
        N'ordered',
        N'supplier_confirmed',
        N'in_transit',
        N'arrived',
        N'verification_pending',
        N'verified',
        N'added_to_stock',
        N'completed',
        N'delivered',
        N'cancelled',
        N'deleted',
        N'paid',
        N'due_soon',
        N'overdue',
        N'partially_paid'
    ));

-- ============================================================================
-- catalog_items.current_stock  (044_catalog_current_stock_non_negative.sql)
-- ============================================================================
ALTER TABLE catalog_items
    ADD CONSTRAINT chk_current_stock_non_negative
    CHECK (current_stock >= 0);

-- ============================================================================
-- stock_adjustment_log.adjustment_type  (021_stock_inventory.sql)
-- ============================================================================
ALTER TABLE stock_adjustment_log
    ADD CONSTRAINT ck_stock_adjustment_type
    CHECK (adjustment_type IN (
        N'purchase',
        N'manual',
        N'damaged',
        N'expired',
        N'correction',
        N'verification'
    ));
