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
