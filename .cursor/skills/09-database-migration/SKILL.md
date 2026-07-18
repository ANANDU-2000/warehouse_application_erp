---
name: database-migration
description: Translates approved Postgres schema docs into SQL Server DDL, constraints, indexes, and migration scripts. Use only for Phase 2 after analysis sign-off.
---
# Database Migration (SQL Server)

## Scope only

DDL and migration scripts from approved docs + legacy schema. No app feature UI.

## Steps

1. Confirm Phase 2 is unlocked in `docs/00_MASTER_CHECKLIST.md`.
2. Read `docs/20_Database_Analysis.md` and relationship docs if present.
3. Map Postgres types to SQL Server explicitly (document the mapping).
4. Generate tables, PKs, FKs, UNIQUE/CHECK, indexes.
5. Document RLS-equivalent strategy (security policy or app-layer) — do not silently drop RLS.
6. Add up/down or restore rollback notes.
7. Verify structural parity against source inventory; list Unknowns.
8. Stop.

## Forbidden

- Renaming columns without explicit approval
- Dropping constraints that exist in source without documenting the decision
