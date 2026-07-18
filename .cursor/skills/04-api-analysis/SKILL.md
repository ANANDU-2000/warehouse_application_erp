---
name: api-analysis
description: Inventories legacy FastAPI endpoints, payloads, and auth for one module or the full API. Use for Phase 1.4 or before backend implementation of a module.
---
# API Analysis

## Scope only

HTTP API surface from `source-app/`. No UI. No Node implementation unless separately requested.

## Steps

1. Read `docs/18_API_Inventory.md` for the target module/section.
2. Read the matching router(s) under `source-app/backend/app/routers/`.
3. For each endpoint record: method, path, auth, request fields, response fields, status codes, side effects.
4. Compare to docs; trust source on conflict and flag the discrepancy.
5. List Unknowns; do not guess missing fields.
6. Stop.

## Output

- Endpoint table for the scope
- Auth requirements
- Doc gaps / Unknowns
