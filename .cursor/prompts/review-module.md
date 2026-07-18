# Review one module only

ROLE: Verification only. Do not implement new features.

Ground rules: `.cursor/rules/migration-rules.mdc`
Skill: `code-review-migration` (+ `regression-check` if shared code changed)

MODULE: <name>

Read:
1. Latest changes under `new-app/` for this module
2. `docs/modules/<module>.md`
3. Matching `source-app/` files
4. Existing Legacy vs New notes / tests

TASK: Approve or Block using the Done gate (fields, endpoints, tests, mismatches, Unknowns).

OUTPUT:
- Critical / Suggestion / Nice-to-have
- Approve or Block
- Unknowns
- Stop
