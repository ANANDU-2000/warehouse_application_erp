# Categories backend — Slice 1 (item-categories list/get/create + types-index)

**Branch:** `ops/products-module`  
**Status:** Slice 1 **PASS** (2026-07-19)  
**Scope:** Backend only — category list hub prerequisites  
**Sources:** `catalog.py` (`list_item_categories`, `get_item_category`, `create_item_category`, `list_category_types_index`)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · **Categories Slice 1** |
| 🟡 Current | Categories Slice 1 PASS — ask before Slice 2 (PATCH/DELETE category + category-types CRUD) or catalog UI SCAFFOLD |
| ⬜ Pending | category PATCH/DELETE · nested category-types · trade-summary/insights · catalog UI |
| ⏸ Deferred | purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/item-categories` membership | yes | routes | PASS |
| 2 | Order `lower(name)` | yes | same | PASS |
| 3 | `GET …/item-categories/{id}` 404 | `Category not found` | same | PASS |
| 4 | `POST` create 201 | yes | same | PASS |
| 5 | Dup name → 409 exact message | yes | same | PASS |
| 6 | Seed type `"General"` on create | `GENERAL_TYPE_NAME` | same constant | PASS |
| 7 | `GET …/category-types-index` | yes | flat + category_name | PASS |

## Endpoints

| Method | Path | Auth | Test |
|---|---|---|---|
| GET | `/v1/businesses/:businessId/item-categories` | membership | `itemCategories.test.ts` |
| POST | same | membership | same |
| GET | `/v1/businesses/:businessId/item-categories/:categoryId` | membership | same |
| GET | `/v1/businesses/:businessId/category-types-index` | membership | same |

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/
npm run build
```

## Rollback

Revert Categories Slice 1 commit; remove itemCategories modules; boards → Products Slice 7 current.

## Next (ask first)

Categories Slice 2 (PATCH/DELETE + nested types) · **or** catalog UI SCAFFOLD (`/catalog`). Purchase / barcode-print / receive remain **backend-blocked**.
