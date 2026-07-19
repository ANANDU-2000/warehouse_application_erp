# Products backend — Slice 3 (batch + from-scan)

**Branch:** `ops/products-module`  
**Status:** Slice 3 **PASS** (2026-07-19)  
**Scope:** Backend only — `POST /catalog-items/batch` + `POST /catalog-items/from-scan`  
**Sources:** `catalog.py` (`batch_create_catalog_items`, `create_catalog_item_from_scan`)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Slice 1 GET · Slice 2 CRUD · **Slice 3 batch + from-scan** · Slice 4 fuzzy (see slice4) |
| 🟡 Current | See [`products_backend_slice4.md`](products_backend_slice4.md) |
| ⬜ Pending | variants · item-code/barcode patches · bulk-archive · catalog UI |
| ⏸ Deferred | purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `POST …/batch` membership | yes | routes before `/:itemId` | PASS |
| 2 | Body `items` 1..80; each needs `default_supplier_ids` min 1 | yes | Zod | PASS |
| 3 | Category inferred from `type_id` | yes | `findTypeInBusiness` | PASS |
| 4 | Unknown type / dup / bad suppliers → **skip** (not fail) | yes | skipped++ | PASS |
| 5 | No canonical unit profile on batch (resolve+merge only) | yes | same | PASS |
| 6 | Response `{ created, skipped, items }` | yes | same | PASS |
| 7 | `POST …/from-scan` 201 | yes | same | PASS |
| 8 | Unique barcode / item_code → 409 | yes | assert helpers | PASS |
| 9 | Dup name → 409 subcategory message | exact string | same | PASS |
| 10 | No auto ITM; no suppliers on from-scan | yes | same | PASS |
| 11 | `brand_detected=False` on from-scan resolve | yes | same | PASS |

## Endpoints

| Method | Path | Auth | Test |
|---|---|---|---|
| POST | `/v1/businesses/:businessId/catalog-items/batch` | membership | `catalogItemsBatchFromScan.test.ts` |
| POST | `/v1/businesses/:businessId/catalog-items/from-scan` | membership | same |

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/
npm run build
```

## Rollback

Revert Slice 3 commit; remove batch/from-scan methods + schemas + tests; boards → Slice 2 current.

## Next (ask first)

Slice 4 — `GET /catalog/fuzzy-check` · variants · item-code/barcode patches · **or** catalog frontend. Purchase / barcode-print / receive remain **backend-blocked**.
