---
name: frontend-implementation
description: Implements React TypeScript UI for one module matching legacy Flutter screens. Use when building pages, forms, and navigation parity in new-app frontend.
---
# Frontend Implementation

## Scope only

Frontend for ONE module in `new-app/`. Do not redesign unless explicitly requested.

## Steps

1. Read `docs/05_Navigation_Map.md` and page/module docs.
2. Read legacy Flutter feature under `source-app/flutter_app/lib/features/`.
3. Implement screens, fields, dialogs, buttons, loading, and errors to match legacy.
4. Wire to existing backend contracts only — do not invent API shapes.
5. Write component/integration tests for critical flows.
6. Produce Legacy vs New UI PASS/FAIL table.
7. Stop.

## Forbidden

- Removing controls present in legacy
- Merging separate legacy workflows into one screen without approval
- Editing `source-app/`
