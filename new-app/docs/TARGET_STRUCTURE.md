# Target structure

## Frontend (`new-app/frontend/`)

Phase 4.1 scaffold + Login Step 1 empty `/login` shell. See `docs/06_Master_Page_Build_Order.md`.

```
frontend/
  src/
    app/           # App, router
    features/auth/ # LoginPage
    shared/        # auth shell, theme tokens
```

## Backend (`new-app/backend/`) — Phase 3.1+

Clean Architecture layers (coding rules):

```
backend/src/
  routes/
  controllers/
  services/
  repositories/     # Phase 3.2+
  middleware/
  config/
  types/
  utils/
```

Feature-specific folders (e.g. `modules/auth/`) may be introduced when implementing Login after repositories and auth phases unlock — without breaking the layer rule.

See `docs/33_Backend_Structure.md`.

## Database (`new-app/database/`)

Phase 2 COMPLETE — DDL, constraints, indexes, migrate scripts. See `docs/PHASE2_SIGN_OFF.md`.

## Mapping rule

Every feature folder must map to a completed `docs/modules/<module>.md` and a row in `docs/matrix/`.
