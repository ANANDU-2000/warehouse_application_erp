# 03 — Module Inventory

> Grounded in direct file listing of `backend/app/{routers,services,models,schemas}` and `flutter_app/lib/features/*`. This is a structural inventory (what modules exist and their rough size); functional detail per module (screens, fields, business rules) is documented in `04_All_Screens.md` onward and module-specific docs (`31–37`).

## 5.1 Backend modules (by router — 26 router files across 6 subject areas)

| Module (router file) | URL prefix | Endpoint count | Purpose (inferred from names — verify against code for exact behavior) |
|---|---|---|---|
| `auth.py` | `/v1/auth` | 6 | Register, login, Google OAuth, password reset, token refresh |
| `me.py` | `/v1/me` | 6 | Current user profile, workspace bootstrap, business list, branding |
| `users.py` (+ `activity_router`) | `/v1/businesses/{id}/users`, `/activity-log` | 15 | Staff/user CRUD, sessions, permissions, credentials, activity ledger |
| `catalog.py` | `/v1/businesses/{id}/...` | 33 | Item categories, category types, catalog items, variants, duplicate detection, bulk archive/reorder |
| `contacts.py` | `/v1/businesses/{id}/...` | 14 | Suppliers, brokers, contact search, metrics |
| `trade_purchases.py` | `/v1/businesses/{id}/trade-purchases` | 27 | Purchase draft/preview/validate, full lifecycle (dispatch → arrive → commit-stock → verify → mark-paid → cancel), delivery, lifecycle events |
| `damage_reports.py` | `/v1/businesses/{id}/damage-reports` | 2 | Damage report review (pending count, patch) |
| `stock/` (5 files: `stock_list`, `stock_detail`, `stock_ops`, `stock_audit`, `stock_barcode`) | `/v1/businesses/{id}/stock` | 36 | Stock list/search, item detail + intelligence, opening stock, physical counts, reorder, barcode lookup/print, staff purchase logs |
| `stock_audits.py` | `/v1/businesses/{id}/stock-audits` (+ legacy `/v1/stock-audits`) | 11 | Formal stock audit sessions (create/approve/complete lines) — distinct from `stock/stock_audit.py` (audit *feed*/variance reporting) |
| `reports_trade.py` | `/v1/businesses/{id}/reports` (custom prefix) | 14 | BI/reporting: dashboard snapshot, summaries, daily profit, item/supplier/category breakdowns, activity feed, sales comparison |
| `report_views.py` | `/v1/businesses/{id}/report-views` | 4 | Saved report view CRUD |
| `dashboard.py` | `/v1/businesses/{id}` | 1 | Dashboard bundle endpoint |
| `operations.py` | `/v1/businesses/{id}/operations` | 11 | Staff checklists, daily usage logs, snapshots |
| `notifications.py` | `/v1/businesses/{id}/notifications` | 7 | List/summary/unread-count/mark-read/clear/client-event |
| `realtime.py` | `/v1/businesses/{id}/realtime` | 2 | Realtime event stream (SSE/polling) |
| `search.py` | `/v1/businesses/{id}` | 1 | Global search |
| `exports.py` | `/v1/businesses/{id}/exports` | 4 | Backup (full + export-only), stock Excel, purchases PDF |
| `media.py` | `/v1/businesses/{id}/media` | 1 | OCR upload endpoint |
| `public_items.py` | `/public/items` | 3 | Public QR-code item lookup (no auth — public-facing) |
| `health.py` | (none) | 5 | Liveness/readiness/DB health checks |

**Total backend endpoints counted directly from `@router.*` decorators: ~153** (plus a handful of multi-line decorators not captured by the single-line grep — see note below). Full path-by-path listing is in `18_API_Inventory.md`.

*Note: a few routes in `catalog.py`, `contacts.py`, `stock_audits.py`, `trade_purchases.py` use multi-line `@router.get(...)` / `@router.post(...)` decorators that a single-line grep doesn't resolve to a path on the same line — these are flagged as `@router.get(` / `@router.post(` with no path in the raw extraction and must be opened individually for exact paths before the migration's route-mapping table is finalized. Not guessed here.*

### Backend service layer (53 files in `services/`)

Grouped by apparent responsibility (based on filenames only — each will be opened individually before backend migration begins):

- **Auth/identity:** `auth_login.py`, `jwt_tokens.py`, `passwords.py`, `readable_password.py`, `google_oauth.py`, `otp.py`, `user_username.py`, `permissions.py`
- **Purchase engine:** `purchase_draft_engine.py`, `trade_purchase_service.py`, `trade_preview_service.py`, `trade_query.py`, `trade_mapping.py`, `trade_report_line_mirror.py`, `trade_unit_type.py`, `purchase_status.py`, `purchase_damage_service.py`, `purchase_line_unit_validation.py`, `line_totals_service.py`, `decimal_precision.py`
- **Stock:** `stock_inventory.py`, `stock_audit_service.py`, `stock_movement_service.py`, `stock_helpers.py`, `stock_change_guard.py`, `stock_tracking_profile.py`, `stock_variance_notifications.py`, `low_stock_notifications.py`, `low_stock_ops_enrichment.py`, `low_stock_priority.py`
- **Catalog/units:** `fuzzy_catalog.py`, `unit_normalization.py`, `unit_resolution_service.py`, `package_detection_service.py`, `catalog_suppliers_seed.py`
- **AI/OCR:** `ocr_parser.py`, `ocr_learning_service.py`, `llm_intent.py`, `llm_failover.py`, `intent_stub.py`, `bill_line_extract.py`
- **Notifications/scheduling:** `notification_emitter.py`, `scheduled_notification_jobs.py`, `monthly_payment_reminder.py`, `realtime_events.py`
- **Admin/audit/usage:** `admin_audit.py`, `staff_audit.py`, `staff_view.py`, `usage_logging.py`, `rate_display_context.py`
- **Infra/cross-cutting:** `app_cache.py`, `aggregate_totals_service.py`, `export_files.py`, `home_operational_bundle.py`, `mandatory_workspace_seed.py`, `default_workspace.py`, `legacy_archive.py`

### Backend schemas (8 files)
`auth.py`, `notification.py`, `operations.py`, `purchase_damage.py`, `stock.py`, `stock_audit.py`, `trade_purchases.py`, `users.py` — Pydantic request/response contracts. Notably **no schema files for `catalog`, `contacts`, or `reports_trade`** — those routers likely define request/response models inline. Verify during API doc pass; do not assume they're unvalidated.

## 5.2 Frontend modules (21 feature folders in `flutter_app/lib/features/`)

| Feature folder | File count | Apparent scope |
|---|---|---|
| `stock/` | 60 | Largest module — stock listing, low-stock dashboard, opening stock setup, reorder list, physical counts, barcode, staff purchase logs, missing labels |
| `purchase/` | 45 | Purchase entry wizard, purchase detail, delivery timeline, damage report sheet, item-entry sub-widgets |
| `reports/` | 40 | BI shell with drill-down (item/purchase reports), filters, tabs (overview/items/purchases/stock), stock-specific report widgets |
| `home/` | 34 | Owner dashboard: analytics rings, delivery pipeline card, low/out-of-stock sections, quick actions, purchase control center |
| `catalog/` | 36 | Item/category CRUD, duplicates, taxonomy hub, batch create, item timeline/ledger/analytics |
| `barcode/` | 23 | Camera scan (incl. web-specific variants), bulk label printing, stock audit session via scan |
| `settings/` | 17 | Business profile, backup, help guide, user management + user activity/permission sub-widgets |
| `staff/` | 16 | Staff-specific shell: activity, pending deliveries, purchase history/detail, receive shipment |
| `contacts/` | 8 | Supplier/broker CRUD, wizards, ledger |
| `shell/` | 8 | App shell/navigation scaffolding, responsive layout, realtime listeners |
| `auth/` | 11 | Login, forgot/reset password, branded auth shell widgets |
| `notifications/` | 3 | Notification list + repository |
| `operations/` | 3 | Daily usage, owner tasks, staff checklist |
| `search/` | 2 | Global search page + desktop preview pane |
| `broker/` | 1 | Broker history page (separate from `contacts/`'s broker CRUD — overlap to verify) |
| `dashboard/` | 1 | `home_page.dart` — appears to duplicate/alias `home/` module (verify which is live/routed) |
| `item/` | 1 | `item_history_page.dart` — standalone from `catalog/`'s item pages (verify routing) |
| `splash/` | 1 | App splash screen |
| `supplier/` | 1 | `supplier_ledger_page.dart` — separate from `contacts/`'s supplier pages (verify routing) |

**Structural flag (not a guess — a direct observation):** `dashboard/`, `item/`, `supplier/`, and `broker/` each contain a single file that overlaps in name/purpose with a much larger sibling module (`home/`, `catalog/`, `contacts/`, `contacts/`). This pattern (small single-file "module" alongside a large module covering the same domain) suggests either (a) legacy/dead code left over from a refactor, or (b) a deliberate redirect/alias page. This must be resolved by checking the router (`flutter_app/lib/core/router/` — not yet opened) before deciding which screens to port. Flagged for `05_Navigation_Map.md` and `46_Missing_Features.md`/`45_Technical_Debt.md`.

### Frontend `core/` infrastructure (26 subfolders — cross-cutting, used by all features)
`api/`, `auth/`, `catalog/`, `config/`, `decision/`, `design_system/`, `errors/`, `models/`, `navigation/`, `notifications/`, `platform/`, `pricing/`, `providers/`, `purchase/`, `reporting/`, `router/`, `search/`, `services/`, `stock/`, `theme/`, `trade/`, `unit_engine/`, `units/`, `utils/`, `widgets/`. Not yet individually inventoried — this is the layer most analogous to what will become shared React hooks/context/services, and deserves its own deep pass before frontend migration starts (recommended as an early doc in the next batch: `core/` infrastructure inventory).

## 5.3 Roles & permission model (structural facts, not the full permission matrix)

- `MembershipRole` enum (`backend/app/models/enums.py`) defines exactly two roles at the DB-enum level: `owner`, `staff`.
- `Membership.permissions_json` (JSONB) allows **per-user granular permissions beyond the coarse role** — so "manager" (mentioned in README's product table) is likely expressed as a staff user with an expanded `permissions_json`, not a third enum value. This must be confirmed against `services/permissions.py` before the permission matrix doc (`17_Roles_and_Permissions.md`) is written — flagged, not assumed.
- `User.is_super_admin` (boolean) is a separate, cross-business flag — distinct from per-business `Membership.role`.

## 5.4 Summary counts

| Metric | Count |
|---|---|
| Backend router files | 26 (21 top-level + 5 under `stock/`) |
| Backend endpoints (directly counted) | ~153 (some multi-line decorators need manual path confirmation) |
| Backend service files | 53 |
| Backend Pydantic schema files | 8 |
| Backend SQLAlchemy model files | 29 |
| Backend DB tables (`__tablename__`) | 46 |
| Backend raw SQL migration files | 60 |
| Flutter feature folders | 21 |
| Flutter feature `.dart` files | 311 |
| Flutter `.dart` files total (incl. `core/`, `shared/`, `widgets/`) | 549 |
