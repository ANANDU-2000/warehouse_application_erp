# Catalog taxonomy hub `/catalog/taxonomy` — SCAFFOLD compare (Step 1)

**Branch:** `ops/products-module`  
**Sources:** `catalog_taxonomy_hub_page.dart`; `categories.md` § Taxonomy hub; `app_router.dart` staff **allowed**; [`FRONTEND_PAGE_BUILD_LOOP.md`](../FRONTEND_PAGE_BUILD_LOOP.md)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy SCAFFOLD → **LAYOUT** |
| 🟡 Current | superseded — see [`catalog_taxonomy_layout_compare.md`](catalog_taxonomy_layout_compare.md) |
| ⬜ Pending | FIELDS → COMPARE · `/catalog/new-category` · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/catalog/taxonomy` | `CatalogTaxonomyHubPage` | `features/catalog/CatalogTaxonomyHubPage` | PASS |
| 2 | AppBar title `Categories` | exact | `TAXONOMY_TITLE` | PASS |
| 3 | Slot order: appBar → explainer → chips → search → list/empty → fab | Flutter Column | Same `data-slot` | PASS |
| 4 | Explainer copy (category vs subcategory) | exact | `TAXONOMY_EXPLAINER` | PASS |
| 5 | Chip labels `Category` / `Subcategory` | exact | copy + `data-deferred` | PASS |
| 6 | Search hint `Search categories` | exact | `data-hint` deferred | PASS |
| 7 | Empty titles `No categories yet` / `No matches` + sub + primary | exact | empty slot text | PASS |
| 8 | FAB tooltip `Quick add category` | exact | `data-tooltip` deferred | PASS |
| 9 | Owner-only AppBar `Full catalog` | `if (!isStaff)` | `data-role="owner-only"` | PASS |
| 10 | Staff **allowed** (no redirect) | `_isStaffAllowedRoute` | no `Navigate` away | PASS |
| 11 | Back fallbacks owner `/home` · staff `/staff/home` | `popOrGo` | copy constants | PASS |
| 12 | Back / chips / search / FAB / row handlers | Yes | **Deferred** BUTTONS/FIELDS | N/A |
| 13 | List API + filter + sheets | Yes | **Deferred** WIRE | N/A |
| 14 | Purchase / barcode / receive bodies | — | **Backend blocked** | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-taxonomy-scaffold
npm run build
```

## Rollback

Revert SCAFFOLD commit; remove `CatalogTaxonomyHubPage*` + `catalogTaxonomyCopy.ts` + `scripts/check-catalog-taxonomy-scaffold.mjs` + package script; restore `DashboardRouteStubPage title="Categories"` on `/catalog/taxonomy`; boards → Catalog hub COMPARE current.

**Next (ask first):** LAYOUT — done → [`catalog_taxonomy_layout_compare.md`](catalog_taxonomy_layout_compare.md). Ask before FIELDS.
