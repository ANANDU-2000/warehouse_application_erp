---
name: project-analysis
description: Analyzes overall warehouse ERP project structure, stack, and ownership boundaries. Use when starting Phase 1 overview work, onboarding, or the user asks for project/architecture understanding.
---
# Project Analysis

## Scope only

Map the migration workspace. Do not implement code. Do not analyze a single module in depth (use other skills).

## Steps

1. Read `docs/00_MASTER_CHECKLIST.md` and `docs/01_Project_Overview.md`.
2. Confirm folders: `source-app/`, `new-app/`, `docs/`, `.cursor/`.
3. Identify legacy stack (Flutter, FastAPI, PostgreSQL) and target stack (React, Node/Express, SQL Server).
4. List top-level backend and frontend entry points from `source-app/` only.
5. Compare findings to existing docs; list gaps and Unknowns.
6. Update checklist evidence if the user asked for a doc update.
7. Stop.

## Output

- Stack summary (legacy vs target)
- Key entry files with paths
- Doc gaps / Unknowns
- What phase is unlocked next
