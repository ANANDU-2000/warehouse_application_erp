# Catalog new category `/catalog/new-category` — BUTTONS compare (Step 4)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_category_page.dart` Close / Cancel `pop(false)` · Create empty → `_touched` · non-empty → API (WIRE)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category SCAFFOLD→…→**WIRE** |
| 🟡 Current | superseded — see [`catalog_new_category_wire_compare.md`](catalog_new_category_wire_compare.md) |
| ⬜ Pending | STATES → COMPARE · new-subcategory · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Close → pop(false) | IconButton close | `onClose` + `popOrGo` → `/catalog/taxonomy` | PASS |
| 2 | Cancel → pop(false) | OutlinedButton | `onCancel` + same fallback | PASS |
| 3 | Create empty → set touched | `_touched = true` | `onCreate` + `addCategoryNameIsEmpty` | PASS |
| 4 | Create non-empty → POST + similar | yes | **Deferred** WIRE | N/A |
| 5 | Saving disables close/cancel/create | `_saving` | **Deferred** WIRE/STATES | N/A |
| 6 | Name FIELDS validation | yes | unchanged | PASS |
| 7 | Snack `Category created` / pop true | yes | **Deferred** WIRE | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-category-buttons
npm run build
```

## Rollback

Revert BUTTONS commit; restore FIELDS deferred Close/Cancel/Create; remove buttons script + this compare; boards → ask before BUTTONS.

**Next (ask first):** WIRE — done → [`catalog_new_category_wire_compare.md`](catalog_new_category_wire_compare.md). Ask before STATES.
