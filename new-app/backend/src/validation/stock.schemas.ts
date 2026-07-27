import { z } from "zod";

export const StockDetailOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  item_code: z.string().nullable(),
  barcode: z.string().nullable(),
  current_stock: z.number(),
  reorder_level: z.number().nullable(),
  stock_unit: z.string().nullable(),
  default_unit: z.string().nullable(),
  category_name: z.string().nullable(),
  subcategory_name: z.string().nullable(),
  stock_status: z.string(),
  opening_stock_set_at: z.string().nullable(),
  opening_stock_qty: z.number().nullable(),
  opening_stock_locked: z.boolean().optional(),
  stock_version: z.number(),
  last_stock_updated_at: z.string().nullable(),
  physical_stock_qty: z.number().nullable(),
  physical_stock_difference_qty: z.number().nullable(),
  has_pending_order: z.boolean().optional(),
  pending_delivery_qty: z.number().nullable().optional(),
  supplier_name: z.string().nullable().optional(),
  last_purchase_human_id: z.string().nullable().optional(),
});

export type StockDetailOut = z.infer<typeof StockDetailOutSchema>;

export const StockMovementOutSchema = z.object({
  id: z.string(),
  movement_kind: z.string(),
  delta_qty: z.number(),
  qty_before: z.number(),
  qty_after: z.number(),
  stock_unit: z.string().nullable(),
  reason: z.string().nullable(),
  notes: z.string().nullable(),
  source_type: z.string().nullable(),
  actor_name: z.string().nullable(),
  created_at: z.string(),
});

export type StockMovementOut = z.infer<typeof StockMovementOutSchema>;

export const StockPatchInSchema = z.object({
  new_qty: z.number(),
  adjustment_type: z.string().optional(),
  reason: z.string().optional(),
  idempotency_key: z.string().optional(),
  last_seen_stock_version: z.number().optional(),
});

export type StockPatchIn = z.infer<typeof StockPatchInSchema>;

export const StockAdjLogOutSchema = z.object({
  id: z.string(),
  old_qty: z.number(),
  new_qty: z.number(),
  adjustment_type: z.string(),
  reason: z.string().nullable(),
  updated_by_name: z.string().nullable(),
  updated_at: z.string(),
});

export type StockAdjLogOut = z.infer<typeof StockAdjLogOutSchema>;

export const BarcodeLookupOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  item_code: z.string().nullable(),
  barcode: z.string().nullable(),
  current_stock: z.number(),
  stock_unit: z.string().nullable(),
  category_name: z.string().nullable(),
  supplier_name: z.string().nullable(),
});

export type BarcodeLookupOut = z.infer<typeof BarcodeLookupOutSchema>;

export const QuickPurchaseInSchema = z.object({
  qty: z.number().positive(),
  supplier_id: z.string().optional(),
  broker_id: z.string().optional(),
  notes: z.string().optional(),
  idempotency_key: z.string().optional(),
});

export type QuickPurchaseIn = z.infer<typeof QuickPurchaseInSchema>;

export const QuickPurchaseOutSchema = z.object({
  id: z.string(),
  item_id: z.string(),
  qty: z.number(),
  unit: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  movement: StockMovementOutSchema.nullable(),
});

export type QuickPurchaseOut = z.infer<typeof QuickPurchaseOutSchema>;

export const InventorySummaryOutSchema = z.object({
  total_value_inr: z.number(),
  bags: z.number(),
  boxes: z.number(),
  tins: z.number(),
  kg: z.number(),
  item_count: z.number(),
});

export type InventorySummaryOut = z.infer<typeof InventorySummaryOutSchema>;

export const ReorderEntryOutSchema = z.object({
  id: z.string(),
  item_id: z.string(),
  item_name: z.string(),
  current_stock: z.number(),
  reorder_level: z.number().nullable(),
  unit: z.string().nullable(),
  status: z.string(),
  added_by_name: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ReorderEntryOut = z.infer<typeof ReorderEntryOutSchema>;

export const ReorderListOutSchema = z.object({
  items: z.array(ReorderEntryOutSchema),
  total: z.number(),
});

export type ReorderListOut = z.infer<typeof ReorderListOutSchema>;

export const ReorderListPatchInSchema = z.object({
  status: z.enum(["pending", "ordered", "done", "cancelled"]),
});

export type ReorderListPatchIn = z.infer<typeof ReorderListPatchInSchema>;

export const OpeningStockInSchema = z.object({
  qty: z.number(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  idempotency_key: z.string().optional(),
});

export type OpeningStockIn = z.infer<typeof OpeningStockInSchema>;

export const PhysicalCountInSchema = z.object({
  counted_qty: z.number(),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  notes: z.string().optional(),
});

export type PhysicalCountIn = z.infer<typeof PhysicalCountInSchema>;

export const StaffPurchaseLogInSchema = z.object({
  item_id: z.string(),
  qty: z.number().positive(),
  supplier_id: z.string().optional(),
  broker_id: z.string().optional(),
  notes: z.string().optional(),
  idempotency_key: z.string().optional(),
});

export type StaffPurchaseLogIn = z.infer<typeof StaffPurchaseLogInSchema>;

export const StaffPurchaseLogOutSchema = z.object({
  id: z.string(),
  item_id: z.string(),
  item_name: z.string(),
  qty: z.number(),
  unit: z.string().nullable(),
  supplier_name: z.string().nullable(),
  broker_name: z.string().nullable(),
  notes: z.string().nullable(),
  created_by_name: z.string().nullable(),
  created_at: z.string(),
});

export type StaffPurchaseLogOut = z.infer<typeof StaffPurchaseLogOutSchema>;

export const StockAuditItemOutSchema = z.object({
  id: z.string(),
  old_qty: z.number(),
  new_qty: z.number(),
  adjustment_type: z.string(),
  reason: z.string().nullable(),
  updated_by_name: z.string().nullable(),
  updated_at: z.string(),
});

export type StockAuditItemOut = z.infer<typeof StockAuditItemOutSchema>;

export const BarcodeLabelOutSchema = z.object({
  id: z.string(),
  barcode: z.string().nullable(),
  item_code: z.string().nullable(),
  item_name: z.string(),
  category_name: z.string().nullable(),
  unit: z.string().nullable(),
  current_stock: z.number(),
  last_purchase_date: z.string().nullable(),
  last_purchase_qty: z.number().nullable(),
  last_purchase_unit: z.string().nullable(),
  last_purchase_rate: z.number().nullable(),
  supplier_name: z.string().nullable(),
});

export type BarcodeLabelOut = z.infer<typeof BarcodeLabelOutSchema>;

export const BarcodeBatchInSchema = z.object({
  item_ids: z.array(z.string()).min(1).max(100),
});

export type BarcodeBatchIn = z.infer<typeof BarcodeBatchInSchema>;

export const PhysicalUpdateInSchema = z.object({
  new_qty: z.number(),
  adjustment_type: z.enum(["verification", "sale", "damaged", "correction"]),
  reason: z.string().min(1),
  last_seen_stock_version: z.number().optional(),
  idempotency_key: z.string().optional(),
});

export type PhysicalUpdateIn = z.infer<typeof PhysicalUpdateInSchema>;

export const VerifyCountInSchema = z.object({
  counted_qty: z.number(),
  reason: z.string().optional(),
  idempotency_key: z.string().optional(),
});

export type VerifyCountIn = z.infer<typeof VerifyCountInSchema>;

export const StockListItemOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  item_code: z.string().nullable(),
  barcode: z.string().nullable(),
  current_stock: z.number(),
  reorder_level: z.number().nullable(),
  stock_unit: z.string().nullable(),
  default_unit: z.string().nullable(),
  category_name: z.string().nullable(),
  subcategory_name: z.string().nullable(),
  stock_status: z.string(),
  opening_stock_set_at: z.string().nullable(),
  opening_stock_qty: z.number().nullable(),
  opening_stock_locked: z.boolean().optional(),
  stock_version: z.number(),
  last_stock_updated_at: z.string().nullable(),
  physical_stock_qty: z.number().nullable(),
  physical_stock_difference_qty: z.number().nullable(),
  supplier_name: z.string().nullable().optional(),
  last_purchase_human_id: z.string().nullable().optional(),
  has_pending_order: z.boolean().optional(),
  pending_order_days: z.number().nullable().optional(),
  pending_delivery_qty: z.number().nullable().optional(),
  period_purchased_qty: z.number().nullable().optional(),
  period_usage_qty: z.number().nullable().optional(),
  needs_verification: z.boolean().optional(),
  missing_barcode: z.boolean().optional(),
  missing_item_code: z.boolean().optional(),
  is_perishable: z.boolean().optional(),
  needs_eviction: z.boolean().optional(),
  days_since_last_purchase: z.number().nullable().optional(),
  ledger_variance_qty: z.number().nullable().optional(),
  warehouse_diff: z.number().nullable().optional(),
  rack_location: z.string().nullable().optional(),
  last_stock_updated_by: z.string().nullable().optional(),
  total_delivered_qty: z.number().nullable().optional(),
  total_pending_delivery_qty: z.number().nullable().optional(),
  physical_stock_counted_at: z.string().nullable().optional(),
  physical_stock_counted_by: z.string().nullable().optional(),
  last_movement_at: z.string().nullable().optional(),
  last_purchase_delivered: z.boolean().nullable().optional(),
  last_line_qty: z.number().nullable().optional(),
  purchased_today_qty: z.number().nullable().optional(),
  usage_today_qty: z.number().nullable().optional(),
});

export type StockListItemOut = z.infer<typeof StockListItemOutSchema>;

export const StockListItemMinimalOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  item_code: z.string().nullable(),
  barcode: z.string().nullable(),
  current_stock: z.number(),
  stock_unit: z.string().nullable(),
  stock_status: z.string(),
  supplier_name: z.string().nullable().optional(),
  reorder_level: z.number().nullable(),
  rack_location: z.string().nullable().optional(),
  is_perishable: z.boolean().optional(),
  missing_barcode: z.boolean().optional(),
  opening_stock_qty: z.number().nullable(),
  last_stock_updated_at: z.string().nullable(),
});

export type StockListItemMinimalOut = z.infer<typeof StockListItemMinimalOutSchema>;

export const StockListOutSchema = z.object({
  items: z.array(StockListItemOutSchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export type StockListOut = z.infer<typeof StockListOutSchema>;

export const StockListCompactOutSchema = z.object({
  items: z.array(StockListItemMinimalOutSchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export type StockListCompactOut = z.infer<typeof StockListCompactOutSchema>;

export const StockAlertsSummaryOutSchema = z.object({
  low_stock: z.number(),
  critical_stock: z.number(),
  out_of_stock: z.number(),
  active_out_of_stock: z.number(),
  missing_barcode: z.number(),
  missing_item_code: z.number(),
  missing_usage_logs: z.number(),
  eviction_count: z.number(),
  total_items: z.number(),
});

export type StockAlertsSummaryOut = z.infer<typeof StockAlertsSummaryOutSchema>;

export const WarehouseAlertsSummaryOutSchema = z.object({
  pending_deliveries: z.number(),
  low_stock: z.number(),
  critical_stock: z.number(),
  pending_verifications: z.number(),
  missing_barcode: z.number(),
  missing_usage_logs: z.number(),
  eviction_count: z.number(),
  checklist_completion_pct: z.number(),
  total_items: z.number(),
});

export type WarehouseAlertsSummaryOut = z.infer<typeof WarehouseAlertsSummaryOutSchema>;

export const StockDeliveryIndicatorCountsOutSchema = z.object({
  pending: z.number(),
  delivered: z.number(),
});

export type StockDeliveryIndicatorCountsOut = z.infer<typeof StockDeliveryIndicatorCountsOutSchema>;

export const StockShellBundleOutSchema = z.object({
  list: StockListOutSchema,
  status_counts: StockAlertsSummaryOutSchema,
  delivery_counts: StockDeliveryIndicatorCountsOutSchema,
  audit_recent: z.array(z.any()),
});

export type StockShellBundleOut = z.infer<typeof StockShellBundleOutSchema>;

export const LowStockOpsSummaryOutSchema = z.object({
  total_attention: z.number(),
  out_of_stock: z.number(),
  pending_purchase: z.number(),
  delayed_supplier: z.number(),
  mismatch_items: z.number(),
  pending_verification: z.number(),
  disputed_items: z.number(),
  estimated_impact_units_per_day: z.number(),
});

export type LowStockOpsSummaryOut = z.infer<typeof LowStockOpsSummaryOutSchema>;

export const LowStockOpsItemOutSchema = StockListItemOutSchema.extend({
  priority_score: z.number(),
  priority_band: z.string(),
  is_delayed_supplier: z.boolean(),
  has_mismatch: z.boolean(),
  verification_state: z.string(),
  lifecycle_stage: z.string(),
  reorder_entry_status: z.string().nullable().optional(),
  has_open_dispute: z.boolean(),
});

export type LowStockOpsItemOut = z.infer<typeof LowStockOpsItemOutSchema>;

export const LowStockOpsOutSchema = z.object({
  summary_slice: LowStockOpsSummaryOutSchema,
  items: z.array(LowStockOpsItemOutSchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export type LowStockOpsOut = z.infer<typeof LowStockOpsOutSchema>;

export const OpeningStockSetupSummaryOutSchema = z.object({
  pending: z.number(),
  completed: z.number(),
  total: z.number(),
});

export type OpeningStockSetupSummaryOut = z.infer<typeof OpeningStockSetupSummaryOutSchema>;

export const OpeningStockSetupItemOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  item_code: z.string().nullable(),
  barcode: z.string().nullable(),
  current_stock: z.number().nullable(),
  stock_unit: z.string().nullable(),
  category_name: z.string().nullable(),
  opening_stock_set_at: z.string().nullable(),
  opening_stock_qty: z.number().nullable(),
  setup_status: z.string(),
});

export type OpeningStockSetupItemOut = z.infer<typeof OpeningStockSetupItemOutSchema>;

export const StockIntelligenceOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  item_code: z.string().nullable(),
  barcode: z.string().nullable(),
  current_stock: z.number(),
  reorder_level: z.number().nullable(),
  stock_unit: z.string().nullable(),
  category_name: z.string().nullable(),
  supplier_name: z.string().nullable(),
  last_purchase_human_id: z.string().nullable(),
  period_purchased_qty: z.number().nullable(),
  period_usage_qty: z.number().nullable(),
  ledger_variance_qty: z.number().nullable(),
  recent_purchases: z.array(z.any()),
  recent_adjustments: z.array(z.any()),
  tracking_profile: z.any().nullable(),
});

export type StockIntelligenceOut = z.infer<typeof StockIntelligenceOutSchema>;

export const StockItemSummaryOutSchema = z.object({
  id: z.string(),
  current_stock: z.number(),
  physical_stock_qty: z.number().nullable(),
  physical_stock_difference_qty: z.number().nullable(),
  stock_version: z.number(),
  last_stock_updated_at: z.string().nullable(),
  stock_status: z.string(),
});

export type StockItemSummaryOut = z.infer<typeof StockItemSummaryOutSchema>;

export const StockItemBundleOutSchema = z.object({
  detail: StockDetailOutSchema.nullable(),
  activity: z.array(StockMovementOutSchema),
  intelligence: StockIntelligenceOutSchema.nullable(),
  catalog: z.any().nullable(),
});

export type StockItemBundleOut = z.infer<typeof StockItemBundleOutSchema>;
