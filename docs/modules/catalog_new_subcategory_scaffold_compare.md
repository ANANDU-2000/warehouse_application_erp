# Catalog new subcategory `/catalog/category/:categoryId/new-subcategory` — SCAFFOLD compare (Step 1)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_subcategory_page.dart`; `categories.md` § Add subcategory; `app_router.dart` staff **allowed** (path ends with `/new-subcategory`); [`FRONTEND_PAGE_BUILD_LOOP.md`](../FRONTEND_PAGE_BUILD_LOOP.md)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category COMPARE · new-subcategory SCAFFOLD→**LAYOUT** |
| 🟡 Current | superseded — see [`catalog_new_subcategory_layout_compare.md`](catalog_new_subcategory_layout_compare.md) |
| ⬜ Pending | FIELDS → COMPARE · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/catalog/category/:categoryId/new-subcategory` | `CatalogAddSubcategoryPage` | `features/catalog/CatalogAddSubcategoryPage` | PASS |
| 2 | AppBar title `New subcategory` | exact | `ADD_SUBCATEGORY_TITLE` | PASS |
| 3 | Slot order: appBar → nameField → footer | Flutter Scaffold | Same `data-slot` | PASS |
| 4 | `categoryId` from route | `widget.categoryId` | `useParams` → `data-category-id` | PASS |
| 5 | Close leading (deferred) | Icons.close | `data-deferred="close"` | PASS |
| 6 | Name label `Name` + hint `e.g. Biriyani rice` | exact | copy + deferred | PASS |
| 7 | Footer `Cancel` / `Create` | exact | deferred labels | PASS |
| 8 | Staff **allowed** (no redirect) | `_isStaffAllowedRoute` | no `<Navigate` | PASS |
| 9 | Name input / validation / Create API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |
| 10 | Similar-name dialog | Yes | **Deferred** WIRE | N/A |
| 11 | Purchase / barcode / receive bodies | — | **Backend blocked** | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-subcategory-scaffold
npm run build
```

## Rollback

Revert SCAFFOLD commit; remove `CatalogAddSubcategoryPage*` + `catalogAddSubcategoryCopy.ts` + scaffold script + package script; restore `DashboardRouteStubPage title="New subcategory"`; boards → new-category COMPARE current.

**Next (ask first):** LAYOUT — done → [`catalog_new_subcategory_layout_compare.md`](catalog_new_subcategory_layout_compare.md). Ask before FIELDS.
