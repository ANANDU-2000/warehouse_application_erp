# Catalog taxonomy hub `/catalog/taxonomy` — WIRE compare (Step 5)

**Branch:** `ops/products-module`  
**Sources:** `catalog_taxonomy_hub_page.dart` · `itemCategoriesListProvider` · `categoryTypesIndexProvider` · contains filter · row subtitles · `catalogApi.ts`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy SCAFFOLD→…→**WIRE** |
| 🟡 Current | `/catalog/taxonomy` **WIRE PASS** — ask before STATES |
| ⬜ Pending | STATES → COMPARE · `/catalog/new-category` · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet create API · pull gesture · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/item-categories` | `itemCategoriesListProvider` | `listItemCategories` | PASS |
| 2 | `GET …/category-types-index` | `categoryTypesIndexProvider` | `listCategoryTypesIndex` | PASS |
| 3 | Types soft-fail → `[]` | `valueOrNull ?? []` | catch → `[]` | PASS |
| 4 | Filter name `contains` | listener + `.contains` | `taxonomyFilterCategories` | PASS |
| 5 | Row subtitle 0 → General auto copy | exact | `taxonomyRowSubtitle(0)` | PASS |
| 6 | Row subtitle N → `$N subcategories` | exact | `taxonomyRowSubtitle(N)` | PASS |
| 7 | Type counts from index | `typeCountByCat` | `typeCountForCategory` | PASS |
| 8 | Nav BUTTONS unchanged | back/catalog/chips/FAB/row | same stubs | PASS |
| 9 | Create APIs / quick sheet | sheet POST | **Deferred** sheet route stubs | N/A |
| 10 | Loading / FriendlyLoadError polish | ListSkeleton | basic Loading… / Retry — **STATES** | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-taxonomy-wire
npm run build
```

## Rollback

Revert WIRE commit; restore BUTTONS sample list; remove wire script + this compare; boards → ask before WIRE.

**Next (ask first):** STATES — ListSkeleton + FriendlyLoadError defaults. Stop after WIRE.
