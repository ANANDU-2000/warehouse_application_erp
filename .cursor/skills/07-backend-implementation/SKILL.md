---
name: backend-implementation
description: Implements Node/Express TypeScript backend for one module matching legacy FastAPI behavior. Use when coding routes, services, repositories in new-app backend.
---
# Backend Implementation

## Scope only

Backend for ONE module in `new-app/`. No Flutter/React screens in this skill.

## Steps

1. Read module plan `docs/modules/<module>.md` and API section in `docs/18_API_Inventory.md`.
2. Read legacy routers/services in `source-app/backend/`.
3. Implement repository → service → controller/route only for this module.
4. Match validations and transactions from source.
5. Write API/service tests.
6. Produce Legacy vs New endpoint PASS/FAIL table.
7. Stop.

## Forbidden

- Inventing endpoints or fields
- Touching unrelated modules
- Editing `source-app/`
