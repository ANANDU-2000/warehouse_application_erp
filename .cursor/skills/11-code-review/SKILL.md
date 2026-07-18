---
name: code-review-migration
description: Reviews a migrated module against legacy source and migration rules — parity, security, tests, docs. Use when reviewing before Approve/Continue.
---
# Code Review

## Scope only

Verification of ONE module or PR-sized change. No new feature implementation in this skill.

## Checklist

- [ ] Behavior matches `source-app/` for the scope
- [ ] No invented fields/endpoints
- [ ] Validations and authz preserved
- [ ] No secrets committed
- [ ] Tests exist and pass for the scope
- [ ] Docs/checklist updated
- [ ] Rollback notes present if schema/API changed
- [ ] Legacy vs New table has no silent FAIL

## Output

- Findings: Critical / Suggestion / Nice-to-have
- Approve or Block with reasons
- Unknowns
