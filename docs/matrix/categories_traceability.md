# Categories — Traceability Matrix

**Module:** Categories (catalog taxonomy)  
**Queue:** 5  
**Status:** Review PASS (2026-07-18)  
**Branch:** `phase1/categories-analysis`

| Capability | Flutter | API | DB | Auth / notes | Trace |
|---|---|---|---|---|---|
| Catalog hub category grid | `CatalogPage` | `GET /item-categories` + items/types counts | `item_categories` | Staff blocked from `/catalog` | Complete |
| Rename category | `CatalogPage` `_editCategory` | `PATCH /item-categories/{id}` | `item_categories.name` | Membership; hub owner-only | Complete |
| Delete category | `CatalogPage` `_deleteCategory` | `DELETE /item-categories/{id}` | hard delete | **Owner**; 400 if items | Complete |
| Taxonomy hub | `CatalogTaxonomyHubPage` | list categories + types-index | — | Staff+owner | Complete |
| Create category (page) | `CatalogAddCategoryPage` | `POST /item-categories` | + seed `category_types` General | Membership | Complete |
| Create category (sheet) | `quick_catalog_taxonomy_sheet` | same POST ± type | — | Membership | Complete |
| Create subcategory (page) | `CatalogAddSubcategoryPage` | `POST …/category-types` | `category_types` | Membership | Complete |
| Create subcategory (sheet) | sheet `subcategoryOnly` | same POST | — | Membership | Complete |
| Category detail types | `CatalogCategoryDetailPage` | types-index / list types | `category_types` | Staff blocked from detail route | Complete |
| Trade pulse | detail + `categoryTradeSummaryProvider` | `GET …/trade-summary` | joins trade lines | Membership | Complete |
| Category insights | provider only (no detail UI) | `GET …/insights` | — | API-only UX gap | Documented |
| Type rename/delete | **none** | PATCH/DELETE type | `category_types` | DELETE owner | API-only |
| Types index (selectors) | `categoryTypesIndexProvider` | `GET /category-types-index` | — | Used by Products selectors too | Complete |
| Invalidate after write | `invalidateCatalogTaxonomy` | — | — | also items + contacts cats | Complete |
| Navigate to items | type card → `CatalogTypeItemsPage` | Products | `catalog_items` FKs | Boundary | Products |
| Contacts create category | `contacts_page` | `POST /item-categories` | — | Cross-feature | Noted |
| `is_perishable` | not taxonomy UI | not in Out/Create | `item_categories.is_perishable` | Unknown writer | Unknown |

## Source anchors

- Router: `source-app/flutter_app/lib/core/router/app_router.dart`
- Pages: `features/catalog/presentation/catalog_*taxonomy*`, `catalog_add_*`, `catalog_category_detail_page.dart`, `catalog_page.dart`
- API: `source-app/backend/app/routers/catalog.py` (`GENERAL_TYPE_NAME`, item-categories, category-types)
- Models: `source-app/backend/app/models/catalog.py` (`ItemCategory`, `CategoryType`)
- Docs: `docs/20_Database_Analysis.md`, `docs/18_API_Inventory.md`, `docs/modules/products.md` §Boundary
