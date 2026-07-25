# Catalog new category `/catalog/new-category` — STATES compare (Step 6)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_category_page.dart` · `form_feedback.dart` `showRetryableErrorSnackBar` · `user_facing_errors` / `friendlyApiError`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category **SCAFFOLD→COMPARE** |
| 🟡 Current | superseded — see [`catalog_new_category_compare.md`](catalog_new_category_compare.md) |
| ⬜ Pending | new-subcategory · category detail · item routes |
| ⏸ Deferred | purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Saving spinner on Create | CircularProgressIndicator 22 | `data-slot="saving"` spinner | PASS |
| 2 | Disable close/cancel/create while saving | `_saving ? null` | `disabled={saving}` | PASS |
| 3 | PopScope canPop: !_saving | exact | close/cancel gated | PASS |
| 4 | Error snack uses user-facing copy | `userFacingError` | `mapAddCategoryError` | PASS |
| 5 | No Dio/HTTP/stack in UI | yes | mapper strips | PASS |
| 6 | Retry action label `Retry` | SnackBarAction | `data-action="retry"` | PASS |
| 7 | Retry re-runs create | `onRetry: _create` | `onRetry` → `postCreate` | PASS |
| 8 | Success snack `Category created` | exact | ok snack (no retry) | PASS |
| 9 | 401/403 / 404 / 408 / 429 / 5xx map | friendlyApiError | same strings | PASS |
| 10 | Server `detail` preferred when present | yes | CatalogApiError.detail first | PASS |
| 11 | WIRE create + similar dialog | yes | unchanged | PASS |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-category-states
npm run build
```

## Rollback

Revert STATES commit; restore WIRE plain flash errors; remove `catalogAddCategoryError.ts` + states script + this compare; boards → ask before STATES.

**Next (ask first):** COMPARE — done → [`catalog_new_category_compare.md`](catalog_new_category_compare.md). Ask before new-subcategory SCAFFOLD.
