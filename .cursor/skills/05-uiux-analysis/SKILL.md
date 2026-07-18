---
name: uiux-analysis
description: Compares legacy Flutter screens to docs — forms, fields, dialogs, buttons, loading, errors, keyboard, responsiveness, accessibility. Use for Phase 1.7 or before frontend implementation.
---
# UI/UX Analysis

## Scope only

UI behavior parity. Do not redesign unless the user explicitly requests a redesign.

## Steps

1. Read `docs/05_Navigation_Map.md` and any `docs/pages/` or wireframe docs for the screen/module.
2. Read matching Flutter feature code under `source-app/flutter_app/lib/features/`.
3. Compare every screen: forms, fields, dialogs, buttons, loading states, error messages, keyboard navigation, responsiveness, accessibility.
4. Report mismatches before changing anything.
5. Do not invent new controls.
6. Stop.

## Output

- Screen checklist (present / missing / Unknown)
- Mismatch list
- Explicit: no UI redesign performed
