# Migrate one module only

ROLE: Implement ONE module of the production ERP migration.

Ground rules: `.cursor/rules/migration-rules.mdc`
Skill: `module-migration` (+ `backend-implementation` and/or `frontend-implementation` as tasked)

MODULE: <name>

Read in order:
1. `docs/00_MASTER_CHECKLIST.md` — confirm unlocked
2. `docs/modules/<module>.md` — required; stop if missing
3. `docs/18_API_Inventory.md` (module section) and/or navigation/page docs
4. Matching `source-app/` backend + Flutter files

TASK FOR THIS SESSION: <one concrete step>

RULES:
- Do not touch other modules
- Do not invent endpoints, fields, or rules
- If docs disagree with source, trust `source-app/` and flag the discrepancy
- Write tests with the code
- Stop when this task is done

OUTPUT:
1. Files changed
2. Implemented vs missing
3. Legacy vs New PASS/FAIL table
4. Unknowns
