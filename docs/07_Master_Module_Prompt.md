# 07 — MASTER MODULE PROMPT (one prompt per module, subagent-orchestrated)

## Read this once

Use one strict prompt per module. Backend, frontend, DB-verification, and business-logic-verification are separate bounded stages under one orchestrator — instead of one long agent session that drifts.

**Scale:** **101 confirmed routes** (`05_Navigation_Map.md`), grouped into **~15 backend modules** (`06_Master_Page_Build_Order.md`). Login is done. That leaves **14 modules**.

## How to use it

1. Open a **fresh** Cursor Agent session (new module, new session).
2. Fill in `<MODULE>` and `<ROUTES>` from `docs/modules/<module>.md` + `docs/06_Master_Page_Build_Order.md` (until `route_buckets_full.md` exists).
3. Paste the whole block below.
4. Let it run to the end of Subagent 1 (Backend) and **STOP** — review before Subagent 2. Do not chain all 4 subagents unattended the first time for a given module.

---

## THE PROMPT

```
ROLE: You are the Module Orchestrator for a production ERP migration.
Ground rules: .cursor/rules/migration-rules.mdc — non-negotiable.
Reference: docs/06_Master_Page_Build_Order.md, docs/18_API_Inventory.md, docs/20_Database_Analysis.md

MODULE: <MODULE>
ROUTES IN THIS MODULE: <ROUTES>
SPEC: docs/modules/<module-lowercase>.md — this is the authoritative spec. If source-app/
      contradicts this doc, trust source-app/ and flag the conflict; do not silently pick one.

Do NOT touch any other module's files. Do NOT modify Login/Splash (already done — see
docs/00_MASTER_CHECKLIST.md). Work in a new branch: ops/<module-lowercase>-module.

================================================================
SUBAGENT 1 — BACKEND
================================================================
Scope: new-app/backend/src/{repositories,services,controllers,routes}/<module>*, new-app/backend/tests/<module>*
Read: docs/modules/<module>.md, docs/18_API_Inventory.md (this module's router section),
      source-app/backend/app/routers/<matching file>.py,
      source-app/backend/app/services/<matching files>.py,
      new-app/database/ddl/*.sql (confirm exact column names/types you're querying against)

Task:
1. Repository layer — one function per query pattern, typed against the real SQL Server
   columns (not assumed names).
2. Service layer — port EVERY business rule and calculation from the matching source-app/
   service file(s). For each non-trivial calculation, cite "Formula source: <file>:<function>"
   in a code comment. Do not simplify, round differently, or drop edge-case branches
   (e.g. weight-based vs unit-based pricing, discount/commission modes) found in source.
3. Controller + routes — match docs/18_API_Inventory.md paths exactly for this module.
   If a route needs a path not in that doc, flag it — don't add or omit silently.
4. Tests — one test per endpoint at minimum, plus one test per non-trivial calculation
   verifying it matches source-app's logic on the same inputs.

Output: files changed, endpoint table (path | matches API inventory? | test written?),
business-logic table (calculation | source file:function | ported? | test written?),
any Unknowns.

STOP. Report back. Do not proceed to Subagent 2 without confirmation.

================================================================
SUBAGENT 2 — DB CROSS-CHECK (only after Subagent 1 confirmed)
================================================================
Scope: read-only — no file changes except a verification report.
Task: For every query Subagent 1 wrote, confirm against new-app/database/ddl/*.sql that
every column referenced actually exists, with matching type/nullability. Confirm FK
assumptions (e.g. business_id scoping) are enforced in the WHERE clause, not just the schema.
Output: a table — Query | Table.Column referenced | Exists in DDL? | Type match?
STOP. Report back.

================================================================
SUBAGENT 3 — FRONTEND (only after Subagents 1+2 pass)
================================================================
Scope: new-app/frontend/src/features/<module>/*
Read: docs/modules/<module>.md, source-app/flutter_app/lib/features/<matching folder>/*
For EACH route in ROUTES, run the full loop from FRONTEND_PAGE_BUILD_LOOP.md:
  SCAFFOLD → LAYOUT → FIELDS → BUTTONS → WIRE API → STATES → COMPARE → PASS/FAIL
One route at a time. Report after each route, not after the whole batch.
Apply the "Full verification checklist" (UI size/position, buttons, desktop, mobile,
endpoint match, DB type match, business logic traced to source, tests, Legacy-vs-New table)
before marking any route done.

================================================================
SUBAGENT 4 — MODULE SIGN-OFF (only after all routes in Subagent 3 pass)
================================================================
Task: Produce a single Legacy-vs-New PASS/FAIL table covering every route in this module.
If ALL PASS: update docs/00_MASTER_CHECKLIST.md and docs/06_Master_Page_Build_Order.md,
marking this module ✅ done. Commit with message "Module <MODULE> complete: N/N routes PASS".
If ANY FAIL: do not mark done. List exactly what's failing and why. Do not push to main.

================================================================
FINAL OUTPUT (always, regardless of how far you got):
1. Which subagent stage you reached
2. PASS/FAIL table so far
3. Files changed
4. Anything marked Unknown that needs my decision
5. Explicit statement: "Ready for next module: <name>" OR "Blocked on: <reason>"
```

---

## Module order (next 4, from `06_Master_Page_Build_Order.md`)

| Next | Module | Why this order |
|---|---|---|
| 1 | **Dashboard** | Smallest UI surface; unblocks post-login landing |
| 2 | **Users & Roles** | Backend partially exists (Me/Businesses) |
| 3 | **Suppliers/Brokers (Contacts)** | Standalone; no Catalog/Purchases dependency |
| 4 | **Products/Catalog** | Largest (19 routes) — after pattern is proven |

Purchase Orders, Stock, Reports, Settings, Barcode, Staff, Operations, Notifications, Search follow in `06` order.

## Notes

- **Login/Splash:** Do not modify unless a separate micro-plan says otherwise. Splash WIRE may still be deferred while Dashboard backend lands.
- **ROUTES source:** Prefer `docs/modules/<module>.md` Definition table + `docs/06` route buckets until `route_buckets_full.md` exists.
