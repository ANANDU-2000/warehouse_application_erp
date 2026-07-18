---
name: database-analysis
description: Reads legacy schema and extracts tables, columns, keys, indexes, triggers, and procedures. Use for Phase 1.5/1.9 DB analysis or before SQL Server DDL work.
---
# Database Analysis

## Scope only

Schema and data-model facts. No frontend. No API route coding.

## Steps

1. Read `docs/20_Database_Analysis.md`.
2. Read legacy ORM/models/migrations under `source-app/backend/`.
3. Extract every table.
4. Extract every column (name, type, nullability, defaults).
5. Identify primary keys and foreign keys.
6. Identify indexes.
7. Identify triggers, views, and procedures if present in source.
8. Compare with documentation; list mismatches and Unknowns.
9. Stop. Do not invent SQL Server DDL unless the task is explicitly Phase 2 and docs are approved.

## Output

- Table inventory
- PK/FK/index list
- Doc vs source diffs
- Unknowns
