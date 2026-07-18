# 01 — Project Overview

> Source of truth for this document: `README.md`, `backend/requirements.txt`, `package.json`, `render.yaml`, `vercel.json`, `docker-compose.yml`, `backend/app/main.py`, `flutter_app/pubspec.yaml`. Where the repo's own docs conflict with reality (dead links, renamed modules), that is called out explicitly rather than guessed.

## 1. What this project actually is

This is **not** a legacy application awaiting its first modernization. It is an existing, actively-developed, already-modern SaaS-style warehouse/purchase system:

**Product name:** HEXA Purchase Assistant
**Owner/tenant framing:** Multi-tenant by "business" (`businesses` table) — built for **New Harisree Agency**, a trading/warehouse operation, but modeled generically as `business_id`-scoped.

**What it does (per README + route inventory):**
- Trade purchase entry (AI-assisted OCR/parsing → preview → confirm), supplier/broker management
- Stock ledger: catalog-linked quantities, physical counts vs system stock, stock audits, barcode scanning, low-stock/reorder alerts
- Delivery pipeline & damage reporting for incoming purchases
- Reporting/BI: trade-based KPIs, supplier/category/item breakdowns, period comparisons, activity feed
- User/staff management with roles and per-user permissions JSON
- Notifications (in-app + scheduled jobs), realtime event stream
- Exports/backup: stock Excel export, monthly purchase PDF, full ZIP backup
- An in-app AI assistant (`/ai/chat`) and "Price Intelligence" module referenced in code (`unit_intelligence.py` models, `ai_item_profiles` table)

## 2. Actual technology stack (as found in repo — not the target stack from the brief)

| Layer | Technology | Evidence |
|---|---|---|
| Client | **Flutter** (Dart), Riverpod state management, deployed as installable **PWA** | `flutter_app/`, 549 `.dart` files, `flutter_app/pubspec.yaml`, `flutter_app/web/` |
| Backend | **Python FastAPI**, async (SQLAlchemy 2.0 async + asyncpg), JWT auth (`python-jose`), bcrypt password hashing | `backend/requirements.txt`, `backend/app/main.py` |
| Database | **PostgreSQL** (Render-hosted in prod, Docker Compose Postgres for local), Alembic migrations + 60 hand-numbered raw SQL migration scripts in `backend/sql/` | `docker-compose.yml`, `backend/alembic/`, `backend/sql/*.sql` |
| Cache/queue | Optional **Redis** | `docker-compose.yml`, `redis>=5.2` in requirements |
| Frontend hosting | **Vercel** (PWA build via `scripts/vercel-flutter-build.sh`) | `vercel.json`, `render.yaml` |
| Backend hosting | **Render** | `render.yaml`, README "API on Render" |
| CI/Backup | **GitHub Actions** — weekly `pg_dump` backup, API keep-alive cron | README, `docs/backup/BACKUP_SETUP.md` |
| Reporting/exports | `openpyxl` (Excel), `reportlab` (PDF) | `backend/requirements.txt` |
| AI/OCR | `Pillow`, `numpy`, `opencv-python-headless` for image preprocessing; an LLM-backed intent/OCR pipeline (`services/llm_intent.py`, `services/ocr_parser.py`, `services/llm_failover.py`) | `backend/app/services/` |

**There is no React, Node.js, Express, SQL Server, or Windows Server anywhere in this codebase.** The target stack in your migration brief (React/TS/Vite frontend, Node/Express backend, MS SQL Server, Windows Server 2022 + IIS/Nginx deployment) is a **full re-platform**, not an incremental migration:

- Frontend: Dart/Flutter widget tree → React/TypeScript component tree (complete rewrite, different rendering model, different state management, different PWA/native story)
- Backend: Python/FastAPI async services → Node.js/Express (complete rewrite, different ORM/query layer, different async model)
- Database: PostgreSQL (with Postgres-specific features — JSONB columns, Postgres RLS policies per `054_enable_rls_business_policies.sql`) → MS SQL Server (schema + all 60 migrations need re-authoring, JSONB → appropriate SQL Server equivalent, RLS → SQL Server Row-Level Security or app-layer filtering)
- Hosting: Vercel/Render → Windows Server 2022 with IIS/Nginx + a Windows Service

You confirmed you want the full re-implementation to React/Node/Express/SQL Server, so all subsequent documentation and migration planning targets that as the destination while documenting the *current* (Flutter/FastAPI/Postgres) system as the **source of truth for behavior**.

## 3. High-level module map (detailed in `03_Module_Inventory.md`)

Backend: 26 FastAPI routers, 29 SQLAlchemy model files (46 tables), 53 service modules, 8 Pydantic schema files.
Frontend: 21 Flutter feature folders under `lib/features/`, largest being `stock` (60 files), `purchase` (45 files), `reports` (40 files), `home` (34 files), `catalog` (36 files).

## 4. Known documentation gaps in the source repo itself

The repo's own `README.md` links to docs that **do not exist** in this upload:
- `docs/master-prd.md` — missing
- `docs/architecture.md` — missing
- `docs/data-model.md` — missing
- `docs/flutter-architecture.md` — missing
- `docs/api/openapi.yaml` — missing
- `docs/ux/screen-map.md`, `docs/ux/whatsapp-flows.md` — missing
- `docs/admin-panel.md`, `docs/ops.md`, `docs/delivery-phases.md` — missing

What *does* exist under `docs/`: `DATA_SOURCE_RENDER.md`, `TEST_RESULTS.md`, `backup/BACKUP_SETUP.md`, `cleanup/` (DB reconcile, deprecated files, SQL archive, migration plan), `debug/PURCHASE_ENTRY_ROOT_CAUSE.md`, `harisree/BARCODE_WORKFLOW.md`, `perf/pg_audit_2026-06-13.md`, `plans/BARCODE_SCAN_REBUILD_PLAN.md`, `users/*` (4 files on permissions/layout/activity).

There is also a root-level `admin_web/` referenced in README as "removed — never deployed" — confirms a super-admin web SPA existed historically and was deleted; it is **not** in this zip. Marked `Unknown` for feature-parity purposes below.

Also present at repo root (not yet analyzed in this batch, will feed later docs): `TASKS.md` (1,967 lines — likely a running engineering changelog/backlog), `PRE_CLIENT_AUDIT_RESULT.md`, `04_STOCK_MODULE_REDESIGN.md`, `backend/schema_expected.json`, `backend/docs/` (24K, unexplored), `backend/scripts/` (512K, unexplored — includes seeding scripts referenced in README).

## 5. What's next

This is document 1 of 5 in the first delivery batch:
1. ✅ `01_Project_Overview.md` (this file)
2. `02_Folder_Structure.md`
3. `03_Module_Inventory.md`
4. `18_API_Inventory.md`
5. `20_Database_Analysis.md`

Remaining docs (screens, forms, fields, validation, workflows, business rules, reports, tests, migration plan, etc.) follow in subsequent batches, each grounded in direct code inspection — not inferred from this overview.
