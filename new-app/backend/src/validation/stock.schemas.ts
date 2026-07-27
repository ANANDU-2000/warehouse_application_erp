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
