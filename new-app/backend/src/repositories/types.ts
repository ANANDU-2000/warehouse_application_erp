/**
 * Row shapes for core identity tables.
 * Column names match `new-app/database/ddl/01_core.sql` — no renames.
 */

/** `dbo.users` — global identity (no business_id). */
export interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string | null;
  google_sub: string | null;
  phone: string | null;
  name: string | null;
  is_super_admin: boolean;
  ai_monthly_token_budget: number | null;
  ai_tokens_used_month: number;
  is_active: boolean;
  is_blocked: boolean;
  token_version: number;
  last_login_at: Date | null;
  last_active_at: Date | null;
  device_info: string | null;
  created_by: string | null;
  created_at: Date;
  deleted_at: Date | null;
  notes: string | null;
}

/** `dbo.businesses` — tenant root; load by explicit id (no silent cross-tenant list). */
export interface BusinessRow {
  id: string;
  name: string;
  branding_title: string | null;
  branding_logo_url: string | null;
  gst_number: string | null;
  address: string | null;
  phone: string | null;
  contact_email: string | null;
  default_currency: string;
  created_at: Date;
}

/** `dbo.memberships` — user↔business junction; has business_id. */
export interface MembershipRow {
  id: string;
  user_id: string;
  business_id: string;
  role: string;
  permissions_json: string | null;
  created_at: Date;
}

/** `dbo.suppliers` — supplier master under a business. */
export interface SupplierRow {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  gst_number: string | null;
  default_payment_days: number | null;
  default_discount: number | null;
  default_delivered_rate: number | null;
  default_billty_rate: number | null;
  location: string | null;
  address: string | null;
  notes: string | null;
  freight_type: string | null;
  ai_memory_enabled: boolean;
  preferences_json: string | null;
  broker_id: string | null;
  created_at: Date;
}

/** `dbo.brokers` — broker master under a business. */
export interface BrokerRow {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  location: string | null;
  notes: string | null;
  preferences_json: string | null;
  commission_type: string;
  commission_value: number | null;
  default_payment_days: number | null;
  default_discount: number | null;
  default_delivered_rate: number | null;
  default_billty_rate: number | null;
  freight_type: string | null;
  image_url: string | null;
  created_at: Date;
}

/** `dbo.broker_supplier_m2m` — M2M link row. */
export interface BrokerSupplierLinkRow {
  id: string;
  broker_id: string;
  supplier_id: string;
  created_at: Date;
}

/** `dbo.trade_purchases` — purchase order header. */
export interface PurchaseRow {
  id: string;
  business_id: string;
  user_id: string;
  human_id: string;
  invoice_number: string | null;
  purchase_date: string;
  supplier_id: string;
  broker_id: string | null;
  payment_days: number | null;
  due_date: string | null;
  paid_amount: number | null;
  paid_at: string | null;
  discount: number | null;
  commission_percent: number | null;
  commission_mode: string | null;
  commission_money: number | null;
  delivered_rate: number | null;
  billty_rate: number | null;
  freight_amount: number | null;
  freight_type: string | null;
  total_qty: number | null;
  total_amount: number | null;
  total_landing_subtotal: number | null;
  total_selling_subtotal: number | null;
  total_line_profit: number | null;
  status: string;
  is_delivered: boolean;
  delivery_status: string;
  delivered_at: string | null;
  delivery_notes: string | null;
  dispatched_at: string | null;
  arrived_at: string | null;
  staff_verified_at: string | null;
  staff_verified_by: string | null;
  staff_verified_by_name: string | null;
  stock_committed_at: string | null;
  staff_verified_qty: number | null;
  delivered_qty_committed: number | null;
  dispatch_note: string | null;
  truck_number: string | null;
  driver_contact: string | null;
  created_at: string;
  updated_at: string | null;
}

/** `dbo.trade_purchase_lines` — purchase order line item. */
export interface PurchaseLineRow {
  id: string;
  trade_purchase_id: string;
  catalog_item_id: string | null;
  item_name: string;
  qty: number;
  unit: string;
  qty_in_stock_unit: number | null;
  unit_type: string | null;
  purchase_rate: number | null;
  selling_rate: number | null;
  freight_type: string | null;
  freight_value: number | null;
  delivered_rate: number | null;
  billty_rate: number | null;
  weight_per_unit: number | null;
  total_weight: number | null;
  line_total: number | null;
  profit: number | null;
  box_mode: string | null;
  items_per_box: number | null;
  weight_per_item: number | null;
  kg_per_box: number | null;
  weight_per_tin: number | null;
  landing_cost: number;
  kg_per_unit: number | null;
  landing_cost_per_kg: number | null;
  selling_cost: number | null;
  discount: number | null;
  tax_percent: number | null;
  tax_mode: string | null;
  payment_days: number | null;
  hsn_code: string | null;
  item_code: string | null;
  description: string | null;
  received_qty: number | null;
  damaged_qty: number | null;
  return_qty: number | null;
}

/** `dbo.trade_purchase_drafts` — per-user purchase draft. */
export interface PurchaseDraftRow {
  id: string;
  business_id: string;
  user_id: string;
  step: number;
  payload_json: string;
  updated_at: string;
}

/** `dbo.purchase_lifecycle_events` — status transition log. */
export interface LifecycleEventRow {
  id: string;
  purchase_id: string;
  business_id: string;
  from_status: string | null;
  to_status: string;
  actor_id: string | null;
  actor_name: string | null;
  notes: string | null;
  metadata: string;
  created_at: string;
}
