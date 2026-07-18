---
name: module-migration
description: Executes the one-module migration loop — read docs and source, plan, implement only the requested module, test, compare, PASS/FAIL, stop. Use when migrating a single approved module.
---
# Module Migration Loop

## Scope only

ONE module named in the user task. Stop when that module's session task is done.

## Steps

1. Read `docs/00_MASTER_CHECKLIST.md` — confirm the phase for this module is unlocked.
2. Read `docs/modules/<module>.md` (required). If missing, stop and ask.
3. Read legacy routers/services/UI for the module in `source-app/`.
4. Extract business rules for this module only.
5. Plan implementation; wait for confirmation if anything is unclear or Unknown.
6. Implement only the requested module in `new-app/`.
7. Generate tests.
8. Compare legacy vs new.
9. Produce a PASS/FAIL report using the Done gate in migration-rules.
10. Update `docs/00_MASTER_CHECKLIST.md` for this step only.
11. **Stop.** Do not start another module.

## Output

1. Files changed
2. Implemented vs still missing
3. Legacy vs New PASS/FAIL table
4. Unknowns needing confirmation
