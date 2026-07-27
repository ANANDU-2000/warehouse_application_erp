import { z } from "zod";

const unitPattern = /^[a-z][a-z0-9\- ]{0,31}$/i;

// Base line input schema (no transform/refine to avoid circular refs)
export const purchaseLineBaseSchema = z.object({
  catalog_item_id: z.string(),
  item_name: z.string().min(1).max(512),
  qty: z.number().gt(0),
  unit: z.string().min(1).max(32).regex(unitPattern, "invalid unit format"),
  landing_cost: z.number().gt(0),
  purchase_rate: z.number().gt(0).optional(),
  kg_per_unit: z.number().gt(0).optional(),
  weight_per_unit: z.number().gt(0).optional(),
  landing_cost_per_kg: z.number().gt(0).optional(),
  selling_cost: z.number().min(0).optional(),
  selling_rate: z.number().min(0).optional(),
  freight_type: z.enum(["included", "separate"]).optional(),
  freight_value: z.number().min(0).optional(),
  delivered_rate: z.number().min(0).optional(),
  billty_rate: z.number().min(0).optional(),
  box_mode: z.enum(["items_per_box", "fixed_weight_box"]).optional(),
  items_per_box: z.number().gt(0).optional(),
  weight_per_item: z.number().gt(0).optional(),
  kg_per_box: z.number().gt(0).optional(),
  weight_per_tin: z.number().gt(0).optional(),
  discount: z.number().min(0).optional(),
  tax_percent: z.number().min(0).optional(),
  tax_mode: z.enum(["exclusive", "inclusive", "none"]).default("exclusive"),
  payment_days: z.number().int().min(0).max(3650).optional(),
  hsn_code: z.string().max(32).optional(),
  item_code: z.string().max(64).optional(),
  description: z.string().max(512).optional(),
});

export const purchaseLineSchema = purchaseLineBaseSchema;

export const createPurchaseBaseSchema = z.object({
  purchase_date: z.string(),
  invoice_number: z.string().max(64).optional().nullable(),
  supplier_id: z.string(),
  broker_id: z.string().optional().nullable(),
  force_duplicate: z.boolean().default(false),
  status: z.enum(["draft", "saved", "confirmed"]).default("confirmed"),
  payment_days: z.number().int().min(0).max(3650).optional().nullable(),
  discount: z.number().min(0).optional().nullable(),
  commission_percent: z.number().min(0).optional().nullable(),
  commission_mode: z.enum(["percent", "flat_invoice", "flat_kg", "flat_bag", "flat_box", "flat_tin"]).default("percent"),
  commission_money: z.number().min(0).optional().nullable(),
  delivered_rate: z.number().min(0).optional().nullable(),
  billty_rate: z.number().min(0).optional().nullable(),
  freight_amount: z.number().min(0).optional().nullable(),
  freight_type: z.enum(["included", "separate"]).optional().nullable(),
  lines: z.array(purchaseLineBaseSchema).default([]),
});

export const createPurchaseSchema = createPurchaseBaseSchema;
export const updatePurchaseSchema = createPurchaseBaseSchema;

export const paymentPatchSchema = z.object({
  paid_amount: z.number().min(0),
  paid_at: z.string().optional().nullable(),
});

export const markPaidSchema = z.object({
  paid_amount: z.number().min(0).optional().nullable(),
  paid_at: z.string().optional().nullable(),
});

export const duplicateCheckSchema = z.object({
  supplier_id: z.string().optional().nullable(),
  purchase_date: z.string(),
  total_amount: z.number().min(0),
  lines: z.array(purchaseLineBaseSchema).default([]),
});

export const draftUpsertSchema = z.object({
  step: z.number().int().min(0).max(3),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const previewLinesSchema = z.object({
  lines: z.array(purchaseLineBaseSchema).default([]),
});

export const lifecycleTransitionSchema = z.object({
  to_status: z.enum([
    "draft", "active", "approved", "ordered", "supplier_confirmed",
    "in_transit", "arrived", "verification_pending", "verified",
    "added_to_stock", "completed", "cancelled",
  ]),
  notes: z.string().max(2000).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// Delivery pipeline schemas
export const dispatchSchema = z.object({
  truck_number: z.string().max(100).optional().nullable(),
  driver_contact: z.string().max(100).optional().nullable(),
  dispatch_note: z.string().max(2000).optional().nullable(),
  mark_in_transit: z.boolean().default(false),
});

export const arriveSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
  truck_number: z.string().max(100).optional().nullable(),
  driver_contact: z.string().max(100).optional().nullable(),
  damage_qty: z.number().min(0).optional().nullable(),
  missing_qty: z.number().min(0).optional().nullable(),
  broker_confirmed: z.boolean().optional().nullable(),
});

export const verificationLineSchema = z.object({
  line_id: z.string(),
  received_qty: z.number().min(0),
  damaged_qty: z.number().min(0).default(0),
  return_qty: z.number().min(0).default(0),
});

export const verifySchema = z.object({
  lines: z.array(verificationLineSchema).default([]),
  notes: z.string().max(2000).optional().nullable(),
});

export const deliveryPatchSchema = z.object({
  is_delivered: z.boolean(),
  delivered_at: z.string().optional().nullable(),
  delivery_notes: z.string().max(2000).optional().nullable(),
});

export const deliveryPipelineOutSchema = z.object({
  pending: z.number().default(0),
  dispatched: z.number().default(0),
  in_transit: z.number().default(0),
  arrived: z.number().default(0),
  staff_verifying: z.number().default(0),
  staff_verified: z.number().default(0),
  partial: z.number().default(0),
  stock_committed: z.number().default(0),
  cancelled: z.number().default(0),
  total_pending_amount: z.number().default(0),
});

export type DispatchIn = z.infer<typeof dispatchSchema>;
export type ArriveIn = z.infer<typeof arriveSchema>;
export type VerifyIn = z.infer<typeof verifySchema>;
export type DeliveryPatchIn = z.infer<typeof deliveryPatchSchema>;
export type DeliveryPipelineOut = z.infer<typeof deliveryPipelineOutSchema>;

// Response types
export const purchaseLineOutSchema = z.object({
  id: z.string(),
  catalog_item_id: z.string().nullable().optional(),
  item_name: z.string(),
  qty: z.number(),
  unit: z.string(),
  unit_type: z.string().nullable().optional(),
  landing_cost: z.number(),
  purchase_rate: z.number().nullable().optional(),
  kg_per_unit: z.number().nullable().optional(),
  weight_per_unit: z.number().nullable().optional(),
  landing_cost_per_kg: z.number().nullable().optional(),
  selling_cost: z.number().nullable().optional(),
  selling_rate: z.number().nullable().optional(),
  freight_type: z.string().nullable().optional(),
  freight_value: z.number().nullable().optional(),
  delivered_rate: z.number().nullable().optional(),
  billty_rate: z.number().nullable().optional(),
  total_weight: z.number().nullable().optional(),
  line_total: z.number().nullable().optional(),
  profit: z.number().nullable().optional(),
  box_mode: z.string().nullable().optional(),
  items_per_box: z.number().nullable().optional(),
  weight_per_item: z.number().nullable().optional(),
  kg_per_box: z.number().nullable().optional(),
  weight_per_tin: z.number().nullable().optional(),
  discount: z.number().nullable().optional(),
  tax_percent: z.number().nullable().optional(),
  hsn_code: z.string().nullable().optional(),
  item_code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  received_qty: z.number().nullable().optional(),
  damaged_qty: z.number().nullable().optional(),
  return_qty: z.number().nullable().optional(),
  default_unit: z.string().nullable().optional(),
  default_kg_per_bag: z.number().nullable().optional(),
  default_purchase_unit: z.string().nullable().optional(),
  line_landing_gross: z.number().default(0),
  line_selling_gross: z.number().default(0),
  line_profit: z.number().nullable().optional(),
  rate_context: z.record(z.string(), z.unknown()).default({}),
});

export const purchaseOutSchema = z.object({
  id: z.string(),
  human_id: z.string(),
  invoice_number: z.string().nullable().optional(),
  purchase_date: z.string(),
  supplier_id: z.string(),
  broker_id: z.string().nullable().optional(),
  payment_days: z.number().nullable().optional(),
  due_date: z.string().nullable().optional(),
  paid_amount: z.number().default(0),
  paid_at: z.string().nullable().optional(),
  discount: z.number().nullable().optional(),
  commission_percent: z.number().nullable().optional(),
  commission_mode: z.string().default("percent"),
  commission_money: z.number().nullable().optional(),
  delivered_rate: z.number().nullable().optional(),
  billty_rate: z.number().nullable().optional(),
  freight_amount: z.number().nullable().optional(),
  freight_type: z.string().nullable().optional(),
  total_qty: z.number().nullable().optional(),
  total_amount: z.number(),
  total_landing_subtotal: z.number().nullable().optional(),
  total_selling_subtotal: z.number().nullable().optional(),
  total_line_profit: z.number().nullable().optional(),
  status: z.string(),
  remaining: z.number().default(0),
  derived_status: z.string().default("confirmed"),
  items_count: z.number().default(0),
  supplier_name: z.string().nullable().optional(),
  broker_name: z.string().nullable().optional(),
  supplier_gst: z.string().nullable().optional(),
  supplier_address: z.string().nullable().optional(),
  supplier_phone: z.string().nullable().optional(),
  broker_phone: z.string().nullable().optional(),
  broker_location: z.string().nullable().optional(),
  broker_image_url: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
  lines: z.array(purchaseLineOutSchema).default([]),
  is_delivered: z.boolean().default(false),
  delivered_at: z.string().nullable().optional(),
  delivery_notes: z.string().nullable().optional(),
  delivery_status: z.string().default("pending"),
  dispatched_at: z.string().nullable().optional(),
  arrived_at: z.string().nullable().optional(),
  staff_verified_at: z.string().nullable().optional(),
  staff_verified_by_name: z.string().nullable().optional(),
  created_by_name: z.string().nullable().optional(),
  stock_committed_at: z.string().nullable().optional(),
  staff_verified_qty: z.number().nullable().optional(),
  delivered_qty_committed: z.number().nullable().optional(),
  truck_number: z.string().nullable().optional(),
  driver_contact: z.string().nullable().optional(),
  dispatch_note: z.string().nullable().optional(),
  header_discount: z.number().nullable().optional(),
  freight_value: z.number().nullable().optional(),
  has_missing_details: z.boolean().default(false),
});

export const duplicateCheckResponseSchema = z.object({
  duplicate: z.boolean(),
  message: z.string().nullable().optional(),
  existing_id: z.string().nullable().optional(),
  existing_human_id: z.string().nullable().optional(),
});

export const nextHumanIdOutSchema = z.object({ human_id: z.string() });

export const draftOutSchema = z.object({
  step: z.number(),
  payload: z.record(z.string(), z.unknown()),
  updated_at: z.string(),
});

export const previewLineOutSchema = z.object({
  index: z.number().min(0),
  line_total: z.number(),
  line_landing_gross: z.number(),
  line_profit: z.number().nullable().optional(),
  line_total_weight_kg: z.number().default(0),
  resolved_labels: z.record(z.string(), z.unknown()).default({}),
  rate_context: z.record(z.string(), z.unknown()).default({}),
});

export const previewOutSchema = z.object({
  lines: z.array(previewLineOutSchema),
  total_qty: z.number(),
  total_amount: z.number(),
  total_landing_subtotal: z.number().nullable().optional(),
  total_selling_subtotal: z.number().nullable().optional(),
  total_line_profit: z.number().nullable().optional(),
});

export const validateOutSchema = z.object({
  ok: z.boolean(),
  errors: z.array(z.record(z.string(), z.unknown())),
  warnings: z.array(z.record(z.string(), z.unknown())).default([]),
});

export const lifecycleEventOutSchema = z.object({
  id: z.string(),
  purchase_id: z.string(),
  business_id: z.string(),
  from_status: z.string().nullable().optional(),
  to_status: z.string(),
  actor_id: z.string().nullable().optional(),
  actor_name: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  created_at: z.string(),
});

export type PurchaseLineIn = z.infer<typeof purchaseLineBaseSchema>;
export type CreatePurchaseIn = z.infer<typeof createPurchaseBaseSchema>;
export type PaymentPatchIn = z.infer<typeof paymentPatchSchema>;
export type MarkPaidIn = z.infer<typeof markPaidSchema>;
export type DuplicateCheckIn = z.infer<typeof duplicateCheckSchema>;
export type DraftUpsertIn = z.infer<typeof draftUpsertSchema>;
export type PreviewLinesIn = z.infer<typeof previewLinesSchema>;
export type LifecycleTransitionIn = z.infer<typeof lifecycleTransitionSchema>;
export type PurchaseLineOut = z.infer<typeof purchaseLineOutSchema>;
export type PurchaseOut = z.infer<typeof purchaseOutSchema>;
export type DuplicateCheckOut = z.infer<typeof duplicateCheckResponseSchema>;
export type DraftOut = z.infer<typeof draftOutSchema>;
export type PreviewOut = z.infer<typeof previewOutSchema>;
export type ValidateOut = z.infer<typeof validateOutSchema>;
export type LifecycleEventOut = z.infer<typeof lifecycleEventOutSchema>;
