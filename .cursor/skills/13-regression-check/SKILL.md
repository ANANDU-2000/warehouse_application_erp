---
name: regression-check
description: Re-checks previously PASS modules after a change to catch regressions. Use after multi-module edits, shared refactors, or before release.
---
# Regression Check

## Scope only

Re-verify previously completed modules. Do not implement new features.

## Steps

1. List modules marked ✅ in `docs/00_MASTER_CHECKLIST.md` that share code with the latest change.
2. Re-run their tests.
3. Spot-check critical Legacy vs New rows for shared behaviors (auth, stock, permissions).
4. Report new FAIL/Unknown items.
5. Stop. Do not “fix forward” into new modules.

## Output

- Modules rechecked
- New failures
- Safe to continue: yes/no
