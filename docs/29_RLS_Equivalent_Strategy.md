# 29 — RLS-equivalent strategy (Phase 2.6)

**Status:** Review PASS (2026-07-18)  
**Checklist:** Phase 2 task **2.6**  
**Sources:**  
- `source-app/backend/sql/054_enable_rls_business_policies.sql`  
- `source-app/backend/alembic/versions/054_enable_rls_business_policies.py`  
- Phase 2.3 DDL `new-app/database/ddl/01`–`06` (column inventory)  
- Phase 1: `docs/matrix/roles_permissions_matrix.md`, `docs/modules/login.md`  
**Rule:** Do not silently drop Postgres RLS intent. Document the SQL Server equivalent.

---

## 1. What Postgres does today

### 1.1 Policy (`054`)

For every `public` table that has a `business_id` column:

1. `ALTER TABLE … ENABLE ROW LEVEL SECURITY`
2. Policy `p_business_isolation`:

```sql
USING (
  business_id = NULLIF(current_setting('app.current_business_id', true), '')::uuid
)
WITH CHECK (
  business_id = NULLIF(current_setting('app.current_business_id', true), '')::uuid
)
```

Meaning: a connection may only **read/write** rows whose `business_id` equals the session GUC `app.current_business_id`. Empty/missing GUC → NULL UUID compare → effectively **no tenant rows** match for non-NULL `business_id` (strict isolation when GUC unset).

### 1.2 Earlier per-table RLS

Some scripts also `ENABLE ROW LEVEL SECURITY` on individual tables (e.g. `034_stock_physical_counts.sql`, `036_staff_purchase_logs.sql`). `054` is the **global** business-isolation policy.

### 1.3 Who sets `app.current_business_id`?

**Evidence search:** no `set_config`, `current_setting`, or `app.current_business_id` usage under `source-app/backend/app/` (Python/FastAPI).

| Finding | Status |
|---|---|
| GUC used in RLS policy SQL | Confirmed (`054`) |
| FastAPI sets GUC per request | **Unknown — not found in app code** |
| Likely implication | API tenancy is primarily **application query filters** + membership checks; DB RLS is defense-in-depth for clients that set the GUC (or service-role bypass paths) |

Do **not** invent a FastAPI GUC setter. Phase 3 must re-verify with live DB / connection middleware if any exists outside `backend/app/`.

---

## 2. Chosen SQL Server equivalent (locked)

| Layer | Decision |
|---|---|
| **Primary** | **App-layer business scoping** in Node/Express (Phase 3): every repository/service query on tenant data filters by active `business_id` from JWT/session (same intent as membership + active business after Login) |
| **DB-level SQL Server RLS** (`CREATE SECURITY POLICY` + `SESSION_CONTEXT`) | **Deferred optional defense-in-depth** — **not** emitted in Phase 2.6 |
| **Why primary = app-layer** | (1) Checklist 2.6 is a **strategy** task; (2) FastAPI already scopes most APIs by business in services/deps; (3) no verified GUC setter in app code; (4) connection-pool `SESSION_CONTEXT` must be set **every** request or it fails open/closed incorrectly — safer to mandate app filters first |

**This is not dropping RLS:** the **isolation requirement** is preserved and becomes a **hard Phase 3 gate** (see §5). Silent “ignore business_id” is forbidden.

---

## 3. Table inventory (46 ORM tables)

Parsed from Phase 2.3 `CREATE TABLE` scripts.

### 3.1 Tables **with** `business_id` (36) — Postgres `054` loop targets

| Table | `business_id` nullability (DDL) | Notes |
|---|---|---|
| `memberships` | NOT NULL | Junction user↔business |
| `user_sessions` | NULL | Active-business context |
| `api_usage_logs` | NULL | Optional tenant |
| `business_goals` | NOT NULL | |
| `item_categories` | NOT NULL | |
| `catalog_items` | NOT NULL | |
| `catalog_variants` | NOT NULL | |
| `catalog_item_default_suppliers` | NOT NULL | |
| `catalog_item_default_brokers` | NOT NULL | |
| `supplier_item_defaults` | NOT NULL | |
| `item_packaging_profiles` | NOT NULL | |
| `ocr_item_aliases` | NOT NULL | |
| `smart_unit_rules` | NULL | Global when NULL |
| `item_learning_history` | NOT NULL | |
| `unit_confidence_logs` | NOT NULL | |
| `ai_item_profiles` | NOT NULL | |
| `smart_package_rules` | NULL | Global when NULL |
| `brokers` | NOT NULL | |
| `suppliers` | NOT NULL | |
| `trade_purchases` | NOT NULL | |
| `trade_purchase_drafts` | NOT NULL | |
| `purchase_lifecycle_events` | NOT NULL | |
| `purchase_damage_reports` | NOT NULL | |
| `stock_movements` | NOT NULL | |
| `stock_adjustment_log` | NOT NULL | |
| `stock_physical_counts` | NOT NULL | |
| `stock_audits` | NULL | Nullable tenant on header |
| `stock_dispute_cases` | NOT NULL | |
| `reorder_list` | NOT NULL | |
| `staff_purchase_logs` | NOT NULL | |
| `notifications` | NOT NULL | |
| `report_saved_views` | NOT NULL | |
| `staff_activity_log` | NOT NULL | |
| `daily_usage_logs` | NOT NULL | |
| `staff_checklist_templates` | NULL | Nullable business |
| `staff_checklist_completions` | NOT NULL | |

**Nullable `business_id`:** app must define when NULL means “global/shared” vs “unset” (mirror ORM/service behavior — do not invent new null semantics).

### 3.2 Tables **without** `business_id` (10) — not in `054` loop

| Table | Tenancy approach for Phase 3 |
|---|---|
| `businesses` | Root tenant row; access via membership / super-admin |
| `users` | Global identity; business access via `memberships` |
| `password_reset_tokens` | Scoped by `user_id` only |
| `admin_audit_logs` | Platform/admin audit (no `business_id`) |
| `webhook_event_logs` | Platform/webhook (no `business_id`) |
| `master_units` | Global unit catalog |
| `category_types` | Via parent `item_categories.business_id` |
| `trade_purchase_lines` | Via parent `trade_purchases.business_id` |
| `stock_audit_items` | Via parent `stock_audits.business_id` |
| `broker_supplier_m2m` | Via `brokers` / `suppliers` business |

Child tables without `business_id` **must** be reached only through a parent already authorized for the active business (join/filter). Never query lines/items by id alone across tenants.

---

## 4. Mapping: Postgres GUC → Node context

| Postgres | SQL Server / Node equivalent |
|---|---|
| `app.current_business_id` (session GUC) | Request context: active `business_id` from JWT / session (see Login module: membership + active business) |
| RLS `USING` / `WITH CHECK` | `WHERE business_id = @businessId` (and insert/update must set/validate same id) |
| Table without `business_id` | Parent-join filter or membership/role check |
| `is_super_admin` | User flag; bypasses role/permission in FastAPI `deps.py` (`roles_permissions_matrix.md`) — **explicit elevated paths only**; still audit; do not auto-expose all businesses without product rules from source |

---

## 5. Phase 3 enforcement checklist (mandatory)

When implementing repositories/services:

1. Resolve **active business_id** from authenticated session (same as Flutter/FastAPI after login/business select).  
2. Every query on §3.1 tables: filter (or insert) with that `business_id`.  
3. Every query on §3.2 child tables: join/filter through parent business.  
4. Forbid: “select by primary key only” on tenant entities without business check.  
5. Super-admin / platform tables (`admin_audit_logs`, etc.): follow source role gates — document per endpoint from `18_API_Inventory.md` / module docs.  
6. Integration tests: cross-tenant read/write must **FAIL**.  
7. Optional later: SQL Server `SESSION_CONTEXT(N'business_id')` + `CREATE SECURITY POLICY` predicates mirroring `054` — only after pool/session lifecycle design is approved.

---

## 6. Optional SQL Server SECURITY POLICY (deferred sketch — do not implement in 2.6)

If added later:

```sql
-- ILLUSTRATIVE ONLY — not shipped in Phase 2.6
-- Per request: EXEC sp_set_session_context @key=N'business_id', @value=@bid;
-- Then CREATE FUNCTION + CREATE SECURITY POLICY filtering business_id =
--   CONVERT(uniqueidentifier, SESSION_CONTEXT(N'business_id'));
```

Requirements before adopting: connection reset on pool checkout; NULL/empty context behavior matching Postgres; nullable-`business_id` tables; bypass for migrations/seed.

---

## 7. Rollback / change notes

| Action | Note |
|---|---|
| Phase 2.6 itself | Documentation only — nothing to drop in SQL Server |
| If SECURITY POLICY added later | Drop policies/predicates first, then functions; app-layer filters remain |
| Source Postgres | Unchanged; `054` remains source of truth for PG |

---

## 8. Unknowns (labeled — do not block 2.6 PASS)

1. Whether any non-Python client sets `app.current_business_id` in production.  
2. Whether DB roles bypass RLS (table owner / BYPASSRLS) in Render/Supabase deploy.  
3. Exact super-admin cross-business product rules beyond `deps.py` bypass — confirm per endpoint at implement time.  
4. Whether nullable global rules (`smart_unit_rules.business_id NULL`) should be visible to all tenants in app-layer (mirror FastAPI queries).

---

## 9. Verification

| Check | Result |
|---|---|
| Postgres RLS cited from `054` | PASS |
| Equivalent chosen (not silent drop) | PASS — app-layer primary |
| 46-table `business_id` inventory | PASS — 36 with / 10 without |
| No invented SECURITY POLICY DDL shipped | PASS |
| Review | **PASS** |

---

## 10. Next

**Phase 2.7** — Stored procedures / views / triggers **only if** source DB logic requires them (scan `source-app/backend/sql` + Alembic; most logic is app-layer).

---

*Phase 2.6 complete — strategy documentation only; no SECURITY POLICY scripts; no Node/React.*
