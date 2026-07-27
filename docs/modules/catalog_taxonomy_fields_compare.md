# Catalog taxonomy hub `/catalog/taxonomy` — FIELDS compare (Step 3)

**Branch:** `ops/products-module`  
**Sources:** `catalog_taxonomy_hub_page.dart` `_searchCtrl` listener (trim+lower, **no debounce**) · `contains` filter · empty `No categories yet` / `No matches` · shared sub `Tap Category to add your first one.` · [`categories.md`](categories.md) §6

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy SCAFFOLD→LAYOUT→FIELDS→**BUTTONS** |
| 🟡 Current | superseded — see [`catalog_taxonomy_buttons_compare.md`](catalog_taxonomy_buttons_compare.md) |
| ⬜ Pending | WIRE → COMPARE · `/catalog/new-category` · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable | TextField | `<input>` + `searchDraft` | PASS |
| 2 | Immediate trim+lower (no debounce) | listener → `_query` | `searchQuery = draft.trim().toLowerCase()` | PASS |
| 3 | Filter = name `contains` (not fuzzy) | `.contains(_query)` | `taxonomyFilterCategories` | PASS |
| 4 | Clear when nonempty | (Flutter none explicit) | clear × (FIELDS UX; same as catalog hub pattern) | PASS |
| 5 | Hint `Search categories` | exact | placeholder | PASS |
| 6 | Empty title | `No categories yet` | `taxonomyEmptyTitle("empty")` | PASS |
| 7 | No-match title | `No matches` | `taxonomyEmptyTitle("noMatches")` | PASS |
| 8 | Empty/no-match **same** subtitle | `Tap Category to add…` | `taxonomyEmptySub` | PASS |
| 9 | Empty primary label `Add category` | HexaEmptyState | deferred chrome | PASS |
| 10 | Categories list source | providers | **[] until WIRE** | N/A |
| 11 | Chips / FAB / back / Full catalog / row tap | Yes | **Deferred** BUTTONS | N/A |
| 12 | item-categories / types-index API | Yes | **Deferred** WIRE | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-taxonomy-fields
npm run build
```

## Rollback

Revert FIELDS commit; restore LAYOUT inert search; remove `catalogTaxonomyFields.ts` + fields script + this compare; boards → ask before FIELDS.

**Next (ask first):** BUTTONS — done → [`catalog_taxonomy_buttons_compare.md`](catalog_taxonomy_buttons_compare.md). Ask before WIRE.
