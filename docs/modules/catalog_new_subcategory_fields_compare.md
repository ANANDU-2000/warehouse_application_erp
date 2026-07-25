# Catalog new subcategory `/catalog/category/:categoryId/new-subcategory` — FIELDS compare (Step 3)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_subcategory_page.dart` `_touched && trim.isEmpty` → `Enter a name`; label `Name`; hint `e.g. Biriyani rice`; [`categories.md`](categories.md) §4

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category COMPARE · new-subcategory SCAFFOLD→LAYOUT→**FIELDS** |
| 🟡 Current | `/catalog/category/:categoryId/new-subcategory` **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | BUTTONS → COMPARE · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Name editable | TextField | `<input>` + `name` state | PASS |
| 2 | Hint `e.g. Biriyani rice` | exact | placeholder | PASS |
| 3 | Label `Name` | exact | field label | PASS |
| 4 | Empty error `Enter a name` | `_touched && trim.isEmpty` | `addSubcategoryNameError` | PASS |
| 5 | Error only after touched | Create sets `_touched` | blur sets `touched` (Create also in BUTTONS) | PASS* |
| 6 | Loss border when error | HexaColors.loss | `--error` field class | PASS |
| 7 | autofocus / words capitalize | autofocus + TextCapitalization.words | `autoFocus` + `autoCapitalize="words"` | PASS |
| 8 | `categoryId` retained | `widget.categoryId` | `data-category-id` | PASS |
| 9 | Close / Cancel / Create handlers | Yes | **Deferred** BUTTONS | N/A |
| 10 | Similar-name dialog + POST create | Yes | **Deferred** WIRE | N/A |

\*Flutter sets `_touched` on Create with empty name; FIELDS also marks touched on blur so error is testable before BUTTONS.

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-subcategory-fields
npm run build
```

## Rollback

Revert FIELDS commit; restore LAYOUT inert name chrome; remove `catalogAddSubcategoryFields.ts` + fields script + this compare; boards → ask before FIELDS.

**Next (ask first):** BUTTONS — Close/Cancel pop · Create triggers touch/validation (no API). Stop after FIELDS.
