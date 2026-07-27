# Catalog hub `/catalog` — WIRE compare (Step 5)

**Branch:** `ops/products-module`  
**Sources:** `catalog_page.dart` · `catalog_providers.dart` · `catalog_fuzzy.dart` · `catalog_taxonomy_utils.dart` · `hexa_api` item-categories / catalog-items / category-types-index

## Task board

| State | Step |
|---|---|
| ✅ Completed | Catalog SCAFFOLD → … → WIRE · **STATES** |
| 🟡 Current | superseded — see [`catalog_states_compare.md`](catalog_states_compare.md) |
| ⬜ Pending | COMPARE · other `/catalog/*` |
| ⏸ Deferred | pull gesture · keepAlive · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/item-categories` | `listItemCategories` | `listItemCategories` | PASS |
| 2 | `GET …/catalog-items` | `listCatalogItems` | `listCatalogItems` | PASS |
| 3 | `GET …/category-types-index` | `listCategoryTypesIndex` | `listCategoryTypesIndex` | PASS |
| 4 | Fuzzy grid (minScore 10/38, limit 500) | `catalogFuzzyRank` | `catalogDisplayCategories` | PASS |
| 5 | Suggestion chips (limit 6) | ActionChips | `catalogSuggestionCategories` | PASS |
| 6 | Meta `N subcategories · M items` | exact | `catalogCategoryMeta` | PASS |
| 7 | Types null → subCount `-1` | exact | same | PASS |
| 8 | Rename → `PATCH …/item-categories/{id}` | yes | `updateItemCategory` | PASS |
| 9 | Delete → `DELETE` owner | yes | `deleteItemCategory` | PASS |
| 10 | Snack `Saved` / `Category deleted` | exact | same | PASS |
| 11 | Nav BUTTONS | back/taxonomy/stock/scan/FAB | unchanged | PASS |
| 12 | Loading / FriendlyLoadError polish | ListSkeleton | basic Loading… / Retry — **STATES** | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-wire
npm run build
```

## Rollback

Revert WIRE commit; restore BUTTONS sample card; remove `catalogApi` / `catalogFuzzy` / `catalogTaxonomy` + wire script + this compare; boards → ask before WIRE.

**Next (ask first):** STATES — done → [`catalog_states_compare.md`](catalog_states_compare.md). Ask before COMPARE.
