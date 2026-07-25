# Catalog new category `/catalog/new-category` — FIELDS compare (Step 3)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_category_page.dart` `_touched && trim.isEmpty` → `Enter a name`; label `Name`; hint `e.g. Rice, Oil`; [`categories.md`](categories.md) §4

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category SCAFFOLD→LAYOUT→FIELDS→**BUTTONS** |
| 🟡 Current | superseded — see [`catalog_new_category_buttons_compare.md`](catalog_new_category_buttons_compare.md) |
| ⬜ Pending | WIRE → COMPARE · new-subcategory · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Name editable | TextField | `<input>` + `name` state | PASS |
| 2 | Hint `e.g. Rice, Oil` | exact | placeholder | PASS |
| 3 | Label `Name` | exact | field label | PASS |
| 4 | Empty error `Enter a name` | `_touched && trim.isEmpty` | `addCategoryNameError` | PASS |
| 5 | Error only after touched | Create sets `_touched` | blur sets `touched` (Create also in BUTTONS) | PASS* |
| 6 | Loss border when error | HexaColors.loss | `--error` field class | PASS |
| 7 | autofocus / words capitalize | autofocus + TextCapitalization.words | `autoFocus` + `autoCapitalize="words"` | PASS |
| 8 | Close / Cancel / Create handlers | Yes | **Deferred** BUTTONS | N/A |
| 9 | Similar-name dialog + POST create | Yes | **Deferred** WIRE | N/A |

\*Flutter sets `_touched` on Create with empty name; FIELDS also marks touched on blur so error is testable before BUTTONS.

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-category-fields
npm run build
```

## Rollback

Revert FIELDS commit; restore LAYOUT inert name chrome; remove `catalogAddCategoryFields.ts` + fields script + this compare; boards → ask before FIELDS.

**Next (ask first):** BUTTONS — done → [`catalog_new_category_buttons_compare.md`](catalog_new_category_buttons_compare.md). Ask before WIRE.
