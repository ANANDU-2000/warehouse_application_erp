# Analyse one module only

ROLE: Analysis only. Do not write `new-app/` code.

Ground rules: `.cursor/rules/migration-rules.mdc`
Skill: use `business-logic-analysis` / `api-analysis` / `uiux-analysis` / `database-analysis` as needed for this module.

MODULE: <name>

Read in order:
1. `docs/00_MASTER_CHECKLIST.md`
2. `docs/modules/<module>.md` (create draft if missing and asked)
3. Matching `source-app/backend/` routers + services
4. Matching `source-app/flutter_app/lib/features/` if UI is in scope

TASK: Document business rules, API, and/or UI for this module only.

OUTPUT:
- Findings with source paths
- Unknowns
- Suggested checklist updates
- Stop. No implementation.
