---
name: business-logic-analysis
description: Extracts business rules, calculations, and validations from legacy source for one module. Use when documenting Phase 1.6 business logic or before implementing a module.
---
# Business Logic Analysis

## Scope only

Extract rules for ONE named module. Do not implement. Do not redesign UX.

## Steps

1. Confirm module name with the user / session task.
2. Read `docs/modules/<module>.md` if it exists; else note missing.
3. Read matching routers/services in `source-app/backend/`.
4. Extract every business rule, calculation, status transition, and validation.
5. Note side effects (stock, ledger, notifications).
6. Flag anything not proven in source as `Unknown — needs verification`.
7. Write or update `docs/modules/<module>.md` only if asked.
8. Stop.

## Output

- Rule list with source file references
- State/transition diagram notes if present in source
- Unknowns
- Explicit statement: analysis only — no code written
