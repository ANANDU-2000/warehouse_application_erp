# Frontend (Phase 4)

Vite + React + TypeScript. Layout mirrors Flutter Auth shell for Login Step 1 SCAFFOLD.

## Status

**Step 1 SCAFFOLD** — `/login` empty `AuthPageShell` + `AuthFormCard` (no fields).  
Next: FIELDS (after review). See `docs/06_Master_Page_Build_Order.md`.

## Scripts

```bash
npm install
npm run dev
npm run build
```

Open `http://localhost:5173/login`.

## Layout

```
src/
  app/           → App + router
  features/auth/ → LoginPage
  shared/auth/   → AuthPageShell, AuthFormCard
  shared/theme/  → brand color tokens
```
