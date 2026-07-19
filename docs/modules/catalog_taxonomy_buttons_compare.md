# Catalog taxonomy hub `/catalog/taxonomy` — BUTTONS compare (Step 4)

**Branch:** `ops/products-module`  
**Sources:** `catalog_taxonomy_hub_page.dart` AppBar back / Full catalog · ActionChips · FAB · ListTile / trailing add · empty primary; `navigation_ext.popOrGo`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy SCAFFOLD→…→**WIRE** |
| 🟡 Current | superseded — see [`catalog_taxonomy_wire_compare.md`](catalog_taxonomy_wire_compare.md) |
| ⬜ Pending | STATES → COMPARE · `/catalog/new-category` · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet body · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back → pop or staff/owner home | `popOrGo(isStaff ? '/staff/home' : '/home')` | `onBack` + fallbacks | PASS |
| 2 | Owner Full catalog → `/catalog` | `push('/catalog')` | `onFullCatalog` | PASS |
| 3 | Staff: no Full catalog action | `if (!isStaff)` | owner-only button | PASS |
| 4 | Category chip → create | quick sheet | → `/catalog/new-category` stub (sheet deferred) | PASS* |
| 5 | Subcategory chip → create | sheet (optional preselect) | → `/catalog/category/:id/new-subcategory` stub | PASS* |
| 6 | FAB Quick add category | sheet | → `/catalog/new-category` stub | PASS* |
| 7 | Empty primary Add category | sheet | → `/catalog/new-category` stub | PASS* |
| 8 | Owner row tap → category detail | `push('/catalog/category/$id')` | `taxonomyCategoryPath` + sample | PASS |
| 9 | Staff row tap → add subcategory | sheet with `categoryId` | → new-sub stub | PASS* |
| 10 | Row trailing Add subcategory | sheet | → new-sub stub | PASS* |
| 11 | item-categories / types-index fetch | Yes | **Deferred** WIRE | N/A |
| 12 | Quick sheet snacks / create API | Yes | **Deferred** WIRE | N/A |

\*Quick taxonomy sheet deferred — same pattern as catalog hub FAB → `/catalog/new-category`.

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-taxonomy-buttons
npm run build
```

## Rollback

Revert BUTTONS commit; restore FIELDS deferred AppBar/chips/FAB; remove new-subcategory stub if unused; remove buttons script + this compare; boards → ask before BUTTONS.

**Next (ask first):** WIRE — done → [`catalog_taxonomy_wire_compare.md`](catalog_taxonomy_wire_compare.md). Ask before STATES.
