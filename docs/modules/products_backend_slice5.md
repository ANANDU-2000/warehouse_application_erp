# Products backend — Slice 5 (item-code / barcode / generate-code)

**Branch:** `ops/products-module`  
**Status:** Slice 5 **PASS** (2026-07-19)  
**Scope:** Backend only — PATCH item-code · PATCH barcode · POST generate-code  
**Sources:** `catalog.py` (`patch_catalog_item_code`, `patch_catalog_item_barcode`, `generate_catalog_item_code`)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Slice 1–4 · **Slice 5 code/barcode patches** · Slice 6 (see slice6) |
| 🟡 Current | See [`products_backend_slice6.md`](products_backend_slice6.md) |
| ⬜ Pending | bulk-archive · catalog UI |
| ⏸ Deferred | purchase entry · barcode/print UI · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `PATCH …/item-code` membership | yes | routes | PASS |
| 2 | Active only (`deleted_at IS NULL`) | yes | `getActiveById` | PASS |
| 3 | Unique item_code → 409 | yes | `assertUniqueItemCode` | PASS |
| 4 | Normalize A-Z0-9_- slug | yes | Zod transform | PASS |
| 5 | `PATCH …/barcode` needs `stock_edit` | `require_permission` | `requirePermission("stock_edit")` | PASS |
| 6 | Unique barcode → 409 | yes | same | PASS |
| 7 | `POST …/generate-code` | yes | next ITM-#### | PASS |
| 8 | Already has code → 409 `{ message, item_code }` | yes | object detail | PASS |
| 9 | Generate redacts staff financials | `_maybe_redact` | `maybeRedactCatalogOut` | PASS |

## Endpoints

| Method | Path | Auth | Test |
|---|---|---|---|
| PATCH | `/v1/businesses/:businessId/catalog-items/:itemId/item-code` | membership | `catalogItemsCodePatches.test.ts` |
| PATCH | `/v1/businesses/:businessId/catalog-items/:itemId/barcode` | membership + stock_edit | same |
| POST | `/v1/businesses/:businessId/catalog-items/:itemId/generate-code` | membership | same |

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/
npm run build
```

## Rollback

Revert Slice 5 commit; remove patch/generate methods + routes; boards → Slice 4 current.

## Next (ask first)

Slice 6 — variants CRUD · bulk-archive · **or** catalog frontend. Purchase / barcode-print / receive remain **backend-blocked**.
