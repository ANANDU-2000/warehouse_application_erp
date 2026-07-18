# 00 — Master Migration Checklist
### HEXA Purchase Assistant → React + TypeScript + Node/Express + SQL Server + Windows Server 2022

**Legend:** ✅ Done · 🟡 In Progress · ⬜ Not Started · 🔒 Locked (blocked until prior phase is confirmed)

---

## PHASE 1 — Analysis & Understanding ✅

| # | Task | Status | Evidence |
|---|---|---|---|
| 1.1 | Project understanding (what the app does, who uses it) | ✅ | `01_Project_Overview.md` |
| 1.2 | Architecture analysis (stack, hosting, deploy topology) | ✅ | `01_Project_Overview.md`, `02_Folder_Structure.md` |
| 1.3 | Module inventory (backend routers/services, frontend features) | ✅ | `03_Module_Inventory.md` |
| 1.4 | API analysis (full endpoint inventory) | ✅ | `18_API_Inventory.md` |
| 1.5 | Database analysis (tables, columns, FKs from ORM) | ✅ | `20_Database_Analysis.md` |
| 1.6 | Business logic analysis (per-module rules, calculations) | ✅ | Login ✅ · … · Reports ✅ · Settings ✅ — see module queue |
| 1.7 | UI/UX analysis (every screen, button, form, field) | ✅ | Login ✅ · … · Reports ✅ · Settings ✅ — see module queue |
| 1.8 | User flow / navigation analysis | ✅ | `05_Navigation_Map.md` — resolved orphan-module question, found dual shell (Owner vs Staff), confirmed 1 dead route + 2 redirect-aliases |
| 1.9 | Relationships / ER diagram | ✅ | `docs/23_Relationships.md`, `docs/24_ER_Diagram.md` — 103 ORM FKs + 4 soft UUID links; Review PASS 2026-07-18 |
| 1.10 | Reports inventory | ✅ | `docs/modules/reports.md`, `docs/matrix/reports_traceability.md` — closes with module #14 |
| 1.11 | Roles & permissions matrix (confirm "manager" role question) | ✅ | `docs/matrix/roles_permissions_matrix.md` — manager confirmed |
| 1.12 | Phase 1 sign-off | ✅ | `docs/PHASE1_SIGN_OFF.md` — Review PASS 2026-07-18; Phase 2 unlocked |

**Phase 1 status: COMPLETE.** Analysis + module queue + ER + sign-off PASS. Phase 2: **2.1–2.5 PASS** — next **2.6 RLS-equivalent strategy**.

### Phase 1 module analysis queue (strict — one at a time)

| # | Module | Status | Evidence |
|---|---|---|---|
| 1 | Login | ✅ Analyze+Review PASS | `docs/modules/login.md`, `docs/matrix/login_traceability.md` |
| 2 | Dashboard | ✅ Analyze+Review PASS | `docs/modules/dashboard.md`, `docs/matrix/dashboard_traceability.md` |
| 3 | Users & Roles | ✅ Analyze+Review PASS | `docs/modules/users-roles.md`, `docs/matrix/users-roles_traceability.md`, `docs/matrix/roles_permissions_matrix.md` |
| 4 | Products | ✅ Analyze+Review PASS | `docs/modules/products.md`, `docs/matrix/products_traceability.md`, branch `phase1/products-analysis` |
| 5 | Categories | ✅ Analyze+Review PASS | `docs/modules/categories.md`, `docs/matrix/categories_traceability.md`, branch `phase1/categories-analysis` |
| 6 | Units | ✅ Analyze+Review PASS | `docs/modules/units.md`, `docs/matrix/units_traceability.md`, branch `phase1/units-analysis` |
| 7 | Suppliers | ✅ Analyze+Review PASS | `docs/modules/suppliers.md`, `docs/matrix/suppliers_traceability.md`, branch `phase1/suppliers-analysis` |
| 8 | Customers | ✅ Analyze+Review PASS | `docs/modules/customers.md`, `docs/matrix/customers_traceability.md` — **absent in source**; branch `phase1/customers-analysis` |
| 9 | Purchase Orders | ✅ Analyze+Review PASS | `docs/modules/purchase-orders.md`, `docs/matrix/purchase_orders_traceability.md`, branch `phase1/purchase-orders-analysis` |
| 10 | Goods Receipt | ✅ Analyze+Review PASS | `docs/modules/goods-receipt.md`, `docs/matrix/goods_receipt_traceability.md`, branch `phase1/goods-receipt-analysis` |
| 11 | Inventory | ✅ Analyze+Review PASS | `docs/modules/inventory.md`, `docs/matrix/inventory_traceability.md`, branch `phase1/inventory-analysis` |
| 12 | Stock Movement | ✅ Analyze+Review PASS | `docs/modules/stock-movement.md`, `docs/matrix/stock_movement_traceability.md`, branch `phase1/stock-movement-analysis` |
| 13 | Sales | ✅ Analyze+Review PASS | `docs/modules/sales.md`, `docs/matrix/sales_traceability.md` — **no Sales product module**; `sale` = stock kind; branch `phase1/sales-analysis` |
| 14 | Reports | ✅ Analyze+Review PASS | `docs/modules/reports.md`, `docs/matrix/reports_traceability.md`, branch `phase1/reports-analysis` — also closes **1.10** |
| 15 | Settings | ✅ Analyze+Review PASS | `docs/modules/settings.md`, `docs/matrix/settings_traceability.md` — backup/export emphasized; implement locked |

**Rule:** Do not implement any module until its analysis Review PASS and Phase 2 schema gates for that work are ready. Phase 1 analysis queue complete — next: **Phase 2**.

### Cursor operator setup (workspace)

| # | Task | Status | Evidence |
|---|---|---|---|
| 0.1 | Split rules (migration/coding/testing/deployment/security) | ✅ | `.cursor/rules/*.mdc` |
| 0.2 | One-responsibility skills (01–13) | ✅ | `.cursor/skills/*/SKILL.md` |
| 0.3 | Task prompts (analyse/migrate/review/deploy) | ✅ | `.cursor/prompts/*.md` |
| 0.4 | MCP GitHub template + gitignore for secrets | ✅ | `.cursor/mcp.json.example`, `.gitignore` |
| 0.5 | Operator flow doc | ✅ | `docs/CURSOR_SETUP.md` |
| 0.6 | User: paste GitHub PAT into local `.cursor/mcp.json` + restart Cursor | ⬜ | Manual |
| 0.7 | User: confirm Indexing covers whole workspace | ⬜ | Manual |
| 0.8 | Git remote → `ANANDU-2000/warehouse_application_erp` + first push | ✅ | `main` pushed; make repo **private** if not already |

---

## PHASE 2 — Database Design & SQL Server Migration 🟡

**In progress.** 2.1–2.5 PASS. Next: **2.6 RLS-equivalent strategy**.

| # | Task | Status | Evidence / notes |
|---|---|---|---|
| 2.1 | ER diagram + relationship/cardinality doc | ✅ | `docs/21_ER_SQL_Server_Note.md` cites Phase 1 `23`/`24` |
| 2.2 | Data type mapping table (Postgres → SQL Server, incl. JSONB, UUID, NUMERIC precision) | ✅ | `docs/25_SQL_Server_Type_Mapping.md` |
| 2.3 | SQL Server DDL — tables | ✅ | `new-app/database/ddl/*.sql` (46 tables), `docs/26_SQL_Server_DDL.md` — PKs + UniqueConstraints; FKs deferred to 2.4 |
| 2.4 | Constraints (PK, FK, UNIQUE, CHECK) | ✅ | `new-app/database/ddl/constraints/` — 103 FKs + 6 CHECKs; `docs/27_SQL_Server_Constraints.md`; PKs/UNIQUEs remain in 2.3 DDL |
| 2.5 | Indexes | ✅ | `new-app/database/ddl/indexes/` — 149 non-unique; `docs/28_SQL_Server_Indexes.md` |
| 2.6 | RLS-equivalent strategy (Postgres RLS → SQL Server security policy or app-layer) | ⬜ | **Next** — unlocked after 2.5 |
| 2.7 | Stored procedures / views / triggers (only if source DB logic requires them) | 🔒 | |
| 2.8 | Migration/seed scripts | 🔒 | |
| 2.9 | Schema verification against source (row-for-row structural diff) | 🔒 | |
| 2.10 | Phase 2 sign-off | 🔒 | |

---

## PHASE 3 — Backend Migration (Node/Express) 🔒
| # | Task | Status |
|---|---|---|
| 3.1 | Folder structure (Clean Architecture: routes/controllers/services/repositories) | 🔒 |
| 3.2 | Repository pattern per table/aggregate | 🔒 |
| 3.3 | Service layer (business logic, ported 1:1 from FastAPI services) | 🔒 |
| 3.4 | Controllers/routes (Express routers matching `18_API_Inventory.md` paths) | 🔒 |
| 3.5 | Authentication (JWT, refresh, Google OAuth) | 🔒 |
| 3.6 | Authorization (role + `permissions_json` enforcement, business-scoping) | 🔒 |
| 3.7 | Validation layer (equivalent to Pydantic — e.g. Zod) | 🔒 |
| 3.8 | Error handling middleware | 🔒 |
| 3.9 | Logging | 🔒 |
| 3.10 | Transactions (multi-table writes — e.g. purchase commit-stock flow) | 🔒 |
| 3.11 | Phase 3 sign-off (per module, not all at once — see Implementation Rule) | 🔒 |

---

## PHASE 4 — Frontend Migration (React + TypeScript) 🔒
| # | Task | Status |
|---|---|---|
| 4.1 | Project scaffold (Vite + React + TS + strict mode) | 🔒 |
| 4.2 | Routing (mirrors Flutter navigation — pending 1.8) | 🔒 |
| 4.3 | Design system / theme port | 🔒 |
| 4.4 | Shared components | 🔒 |
| 4.5 | Per-module screens/forms | 🔒 |
| 4.6 | State management | 🔒 |
| 4.7 | Responsive layout (mobile/tablet/desktop parity) | 🔒 |
| 4.8 | Accessibility | 🔒 |
| 4.9 | Phase 4 sign-off (per module) | 🔒 |

---

## PHASE 5 — API Integration 🔒
| # | Task | Status |
|---|---|---|
| 5.1 | API client layer | 🔒 |
| 5.2 | CRUD wiring per module | 🔒 |
| 5.3 | Error handling (surfaced to UI) | 🔒 |
| 5.4 | Loading states | 🔒 |
| 5.5 | Optimistic updates (where source app uses them — e.g. stock optimistic version + 409 retry, per README) | 🔒 |
| 5.6 | Phase 5 sign-off | 🔒 |

---

## PHASE 6 — Testing 🔒
| # | Task | Status |
|---|---|---|
| 6.1 | Unit tests | 🔒 |
| 6.2 | Integration tests | 🔒 |
| 6.3 | API tests | 🔒 |
| 6.4 | Database tests | 🔒 |
| 6.5 | E2E tests | 🔒 |
| 6.6 | Regression tests (legacy vs new PASS/FAIL table, per module) | 🔒 |
| 6.7 | Manual test pass | 🔒 |
| 6.8 | Phase 6 sign-off | 🔒 |

---

## PHASE 7 — Performance Optimization 🔒
| # | Task | Status |
|---|---|---|
| 7.1 | Backend query/index profiling | 🔒 |
| 7.2 | Caching strategy (source uses ETag/read-cache — port equivalent) | 🔒 |
| 7.3 | Frontend bundle/render profiling | 🔒 |
| 7.4 | Load testing | 🔒 |
| 7.5 | Phase 7 sign-off | 🔒 |

---

## PHASE 8 — Security Review 🔒
| # | Task | Status |
|---|---|---|
| 8.1 | AuthN/AuthZ review | 🔒 |
| 8.2 | Input validation / injection review | 🔒 |
| 8.3 | Secrets/env review | 🔒 |
| 8.4 | Dependency audit | 🔒 |
| 8.5 | Rate limiting (source has `middleware/rate_limit.py` — port equivalent) | 🔒 |
| 8.6 | Phase 8 sign-off | 🔒 |

---

## PHASE 9 — Windows Server 2022 Deployment 🔒
| # | Task | Status |
|---|---|---|
| 9.1 | Windows Server + SQL Server setup | 🔒 |
| 9.2 | Node.js runtime + Windows Service | 🔒 |
| 9.3 | IIS/Nginx reverse proxy | 🔒 |
| 9.4 | HTTPS + GoDaddy domain | 🔒 |
| 9.5 | Environment variables/secrets | 🔒 |
| 9.6 | Backup strategy | 🔒 |
| 9.7 | Monitoring/health checks | 🔒 |
| 9.8 | Rollback plan | 🔒 |
| 9.9 | Go-live | 🔒 |

---

## Rules we are following (your own rules, restated so we don't drift)

1. One phase at a time. No skipping ahead.
2. One module at a time once implementation starts (Phase 3+).
3. Every module goes through: Analyze → Document → Verify → Plan → Design → Implement → Test → Compare → Review → Approve → Continue.
4. Nothing is "done" until compared Legacy vs New with a PASS/FAIL table.
5. Unknowns are stated as `Unknown` — never guessed.
6. I stop and ask you before continuing past a phase boundary.

---
*Last updated: 2026-07-18 — Phase 2.1–2.5 PASS (`28_SQL_Server_Indexes.md`, `ddl/indexes/`); next = 2.6 RLS strategy.*
