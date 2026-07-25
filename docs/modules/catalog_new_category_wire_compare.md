# Catalog new category `/catalog/new-category` — WIRE compare (Step 5)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_category_page.dart` · `catalog_fuzzy.dart` · `hexa_api.createItemCategory` · Categories Slice 1 POST

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category SCAFFOLD→…→**WIRE** |
| 🟡 Current | `/catalog/new-category` **WIRE PASS** — ask before STATES |
| ⬜ Pending | STATES → COMPARE · new-subcategory · category detail · item routes |
| ⏸ Deferred | pull gesture · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Empty Create → touched | yes | unchanged BUTTONS | PASS |
| 2 | List categories for similar | `itemCategoriesListProvider` | `listItemCategories` | PASS |
| 3 | Fuzzy similar minScore 86 · limit 4 | exact | `ADD_CATEGORY_SIMILAR_*` + `catalogFuzzyRank` | PASS |
| 4 | Dialog title `Similar category exists` | exact | copy | PASS |
| 5 | Dialog body empty / named samples | exact | `addCategorySimilarBody` | PASS |
| 6 | Go back / Create dialog actions | exact | `similar-go-back` / `similar-create` | PASS |
| 7 | Similar list fail → continue create | `catch (_) {}` | same | PASS |
| 8 | `POST …/item-categories` `{name}` | `createItemCategory` | `createItemCategory` | PASS |
| 9 | Snack `Category created` | exact | flash + snack | PASS |
| 10 | Pop after success | `pop(true)` | `popOrGo` taxonomy | PASS |
| 11 | Saving disables controls + spinner | `_saving` | `saving` + spinner | PASS |
| 12 | Error snack + retry polish | `showRetryableErrorSnackBar` | basic flash — **STATES** | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-category-wire
npm run build
```

## Rollback

Revert WIRE commit; restore BUTTONS Create stub; remove `createItemCategory` if unused elsewhere; remove wire script + this compare; boards → ask before WIRE.

**Next (ask first):** STATES — saving spinner polish / retryable error mapping if needed. Stop after WIRE.
