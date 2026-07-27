# Products backend — Slice 6 (catalog variants CRUD)

**Branch:** `ops/products-module`  
**Status:** Slice 6 **PASS** (2026-07-19)  
**Scope:** Backend only — list/create/patch/delete catalog variants  
**Sources:** `catalog.py` (`list_catalog_variants`, `create_catalog_variant`, `update_catalog_variant`, `delete_catalog_variant`)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Slice 1–5 · **Slice 6 variants** · Slice 7 (see slice7) |
| 🟡 Current | See [`products_backend_slice7.md`](products_backend_slice7.md) |
| ⬜ Pending | catalog UI · remaining reads |
| ⏸ Deferred | purchase entry · barcode/print UI · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/catalog-items/{id}/variants` | yes | nested routes | PASS |
| 2 | Order `lower(name)` | yes | `ORDER BY LOWER(name)` | PASS |
| 3 | `POST` create 201 | yes | same | PASS |
| 4 | Missing item → 404 `Catalog item not found` | yes | same | PASS |
| 5 | Dup name → 409 exact message | yes | same | PASS |
| 6 | `PATCH …/catalog-variants/{id}` | yes | top-level routes | PASS |
| 7 | `DELETE` owner only | yes | `requireOwnerMembership` | PASS |
| 8 | Block delete if archived entry lines | yes | count helper (0 if table missing) | PASS |

## Endpoints

| Method | Path | Auth | Test |
|---|---|---|---|
| GET | `/v1/businesses/:businessId/catalog-items/:itemId/variants` | membership | `catalogVariants.test.ts` |
| POST | same | membership | same |
| PATCH | `/v1/businesses/:businessId/catalog-variants/:variantId` | membership | same |
| DELETE | same | owner | same |

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/
npm run build
```

## Rollback

Revert Slice 6 commit; remove variants repo/service/routes; boards → Slice 5 current.

## Next (ask first)

Slice 7 — bulk-archive / bulk-reorder · **or** catalog frontend. Purchase / barcode-print / receive remain **backend-blocked**.
