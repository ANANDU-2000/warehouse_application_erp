# Catalog new subcategory `/catalog/category/:categoryId/new-subcategory` — BUTTONS compare (Step 4)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_subcategory_page.dart` Close / Cancel `pop(false)` · Create empty → `_touched` · non-empty → API (WIRE)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category COMPARE · new-subcategory SCAFFOLD→…→**BUTTONS** |
| 🟡 Current | `/catalog/category/:categoryId/new-subcategory` **BUTTONS PASS** — ask before WIRE |
| ⬜ Pending | WIRE → COMPARE · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Close → pop(false) | IconButton close | `onClose` + `popOrGo` → `/catalog/taxonomy` | PASS |
| 2 | Cancel → pop(false) | OutlinedButton | `onCancel` + same fallback | PASS |
| 3 | Create empty → set touched | `_touched = true` | `onCreate` + `addSubcategoryNameIsEmpty` | PASS |
| 4 | Create non-empty → POST + similar | yes | **Deferred** WIRE | N/A |
| 5 | Saving disables close/cancel/create | `_saving` | **Deferred** WIRE/STATES | N/A |
| 6 | Name FIELDS validation | yes | unchanged | PASS |
| 7 | `categoryId` retained | `widget.categoryId` | `data-category-id` | PASS |
| 8 | Snack `Subcategory created` / pop true | yes | **Deferred** WIRE | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-subcategory-buttons
npm run build
```

## Rollback

Revert BUTTONS commit; restore FIELDS deferred Close/Cancel/Create; remove buttons script + this compare; boards → ask before BUTTONS.

**Next (ask first):** WIRE — `POST …/category-types` + similar-name dialog (minScore 86) + snack. Stop after BUTTONS.
