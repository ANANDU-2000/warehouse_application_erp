# Target structure (planned — not implemented)

This documents the intended Clean Architecture layout for `new-app/`. Folders exist as placeholders only during Phase 1.

## Frontend (`new-app/frontend/`)

```
frontend/
  src/
    app/                 # router, providers, shell
    features/
      auth/              # Login, forgot/reset (after login.md PASS)
      ...
    shared/              # UI kit, hooks, api client
```

## Backend (`new-app/backend/`)

```
backend/
  src/
    modules/
      auth/              # routes, controllers, services, repositories
      ...
    shared/              # middleware, errors, config, db
```

## Database (`new-app/database/`)

Phase 2 only. No DDL in Phase 1.

## Mapping rule

Every feature folder must map to a completed `docs/modules/<module>.md` and a row in `docs/matrix/`.
