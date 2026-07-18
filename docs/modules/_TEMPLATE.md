# Module analysis template

Copy to `docs/modules/<module>.md`. Fill only from `source-app/` + `docs/`. Never invent.

## Meta

- Module:
- Queue #:
- Status: Draft | Review PASS | Review FAIL
- Primary sources:

## Sections

1. Screen purpose
2. UI Layout
3. Background image
4. Logo
5. Company branding
6. Every field
7. Placeholder
8. Validation
9. Keyboard behaviour
10. Button behaviour
11. Loading behaviour
12. Error messages
13. Success flow
14. Navigation after login / entry
15. Related flows (forgot password, etc.)
16. Session handling
17. JWT / tokens (if applicable)
18. Authentication flow
19. Authorization
20. API endpoints
21. Request body
22. Response body
23. Database tables
24. Database columns
25. Password hashing / secrets (if applicable)
26. Security
27. Audit logging
28. Edge cases
29. Sequence diagram
30. User Flow

## Capability flags

| Capability | UI | API | Notes |
|---|---|---|---|
| … | Yes/No | Yes/No | |

## Unknowns

- …

## Implementation note (backend)

Use the shared SQL pool from `new-app/backend/src/index.ts` (`connect` + repositories). On Windows local, driver may be `msnodesqlv8` — see `docs/44_Local_SQL_Bootstrap.md`. Do not open a separate Tedious-only connection path per module.

## Review PASS/FAIL

| # | Section | Status | Evidence |
|---|---|---|---|
| 1 | … | PASS/FAIL | path |
