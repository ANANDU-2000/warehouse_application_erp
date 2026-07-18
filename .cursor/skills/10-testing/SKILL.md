---
name: testing-migration
description: Runs and expands tests for a migrated module and produces evidence for the Done gate. Use when verifying a module or Phase 6 testing.
---
# Testing

## Scope only

Test creation, execution, and evidence for the named module/scope.

## Steps

1. Identify scope (module + layer: API / UI / DB).
2. Read existing tests and Legacy vs New notes for that module.
3. Add missing tests for documented behaviors still uncovered.
4. Run tests; record commands and results.
5. Fill PASS/FAIL evidence table.
6. Stop if any FAIL or Unknown remains for claimed-done items.

## Output

- Commands run
- Pass/fail counts
- Gaps remaining
