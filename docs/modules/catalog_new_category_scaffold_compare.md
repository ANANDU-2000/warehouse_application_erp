# Catalog new category `/catalog/new-category` — SCAFFOLD compare (Step 1)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_category_page.dart`; `categories.md` § Add category; `app_router.dart` staff **allowed**; [`FRONTEND_PAGE_BUILD_LOOP.md`](../FRONTEND_PAGE_BUILD_LOOP.md)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · **new-category SCAFFOLD** |
| 🟡 Current | `/catalog/new-category` **SCAFFOLD PASS** — ask before LAYOUT |
| ⬜ Pending | LAYOUT → COMPARE · new-subcategory · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/catalog/new-category` | `CatalogAddCategoryPage` | `features/catalog/CatalogAddCategoryPage` | PASS |
| 2 | AppBar title `New category` | exact | `ADD_CATEGORY_TITLE` | PASS |
| 3 | Slot order: appBar → nameField → footer | Flutter Scaffold | Same `data-slot` | PASS |
| 4 | Close leading (deferred) | Icons.close | `data-deferred="close"` | PASS |
| 5 | Name label `Name` + hint `e.g. Rice, Oil` | exact | copy + deferred | PASS |
| 6 | Footer `Cancel` / `Create` | exact | deferred labels | PASS |
| 7 | Staff **allowed** (no redirect) | `_isStaffAllowedRoute` | no `<Navigate` | PASS |
| 8 | Name input / validation / Create API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |
| 9 | Similar-name dialog | Yes | **Deferred** WIRE | N/A |
| 10 | Purchase / barcode / receive bodies | — | **Backend blocked** | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-category-scaffold
npm run build
```

## Rollback

Revert SCAFFOLD commit; remove `CatalogAddCategoryPage*` + `catalogAddCategoryCopy.ts` + scaffold script + package script; restore `DashboardRouteStubPage title="New category"`; boards → taxonomy COMPARE current.

**Next (ask first):** LAYOUT — Hexa chrome for AppBar / Outline name / Cancel+Create footer. Stop after SCAFFOLD.
