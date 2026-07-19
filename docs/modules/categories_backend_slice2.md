# Categories backend — Slice 2 (PATCH/DELETE category + category-types CRUD)

**Branch:** `ops/products-module`  
**Status:** Slice 2 **PASS** (2026-07-19)  
**Scope:** Backend only — taxonomy write APIs for catalog hub  
**Sources:** `catalog.py` (`update_item_category`, `delete_item_category`, `list/create/update/delete_category_type`)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub **COMPARE** · taxonomy **SCAFFOLD** |
| 🟡 Current | See [`catalog_taxonomy_scaffold_compare.md`](catalog_taxonomy_scaffold_compare.md) |
| ⬜ Pending | taxonomy LAYOUT→COMPARE · trade-summary · other catalog routes |
| ⏸ Deferred | purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `PATCH …/item-categories/{id}` membership | yes | same | PASS |
| 2 | Rename dup → 409 exact message | yes | same | PASS |
| 3 | `DELETE` **owner** only | `require_owner_membership` | `requireOwnerMembership` | PASS |
| 4 | Delete blocked if items → 400 exact | yes | same | PASS |
| 5 | `GET/POST …/category-types` | yes | same | PASS |
| 6 | Type dup → 409 exact | yes | same | PASS |
| 7 | `PATCH …/category-types/{typeId}` | yes | same | PASS |
| 8 | Type 404 `"Type not found"` | yes | same | PASS |
| 9 | `DELETE` type **owner** + 400 if items | yes | same | PASS |

## Endpoints (this slice)

| Method | Path | Auth | Test |
|---|---|---|---|
| PATCH | `/v1/businesses/:businessId/item-categories/:categoryId` | membership | `itemCategories.test.ts` |
| DELETE | same | **owner** | same |
| GET | `…/item-categories/:categoryId/category-types` | membership | same |
| POST | same | membership | same |
| PATCH | `…/category-types/:typeId` | membership | same |
| DELETE | `…/category-types/:typeId` | **owner** | same |

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/
npm run build
```

**Evidence:** 63 catalog tests PASS · `tsc` PASS (2026-07-19).

## Rollback

Revert Categories Slice 2 commit; keep Slice 1 routes only; boards → Categories Slice 1 current.

## Next (ask first)

1. **Catalog UI SCAFFOLD** — `/catalog` page loop step 1, **or**  
2. Categories trade-summary / insights APIs, **or**  
3. Hold  

Purchase / barcode-print / receive remain **backend-blocked**.
