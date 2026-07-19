# Products backend — Slice 1 (GET catalog-items)

**Branch:** `ops/products-module`  
**Status:** Slice 1 **PASS** (2026-07-19)  
**Scope:** Backend only — `GET /catalog-items` + `GET /catalog-items/{item_id}`  
**Sources:** `catalog.py` (`list_catalog_items`, `get_catalog_item`, `_catalog_item_out`); `unit_resolution_service.py`; `staff_view.py:redact_catalog_item_out_model`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Dashboard Subagent 4 nest · **Products Slice 1 GET list+detail** · **Slice 2 POST/PATCH/DELETE** |
| 🟡 Current | Products backend Slice 2 PASS — ask before Slice 3 (batch / fuzzy / variants) or catalog UI |
| ⬜ Pending | batch · from-scan · fuzzy-check · variants · bulk-archive · frontend |
| ⏸ Deferred | purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/catalog-items` membership | yes | `createCatalogItemsRoutes` | PASS |
| 2 | Filters `category_id` / `type_id` | Query | same | PASS |
| 3 | Pagination page/per_page (1..500, default 200) | Query | same | PASS |
| 4 | `deleted_at IS NULL` on list | yes | yes | PASS |
| 5 | Order `lower(name)` | yes | `ORDER BY LOWER(ci.name)` | PASS |
| 6 | Enrich defaults / party names / purchase date / delivered | helpers | repo enrich | PASS |
| 7 | `unit_resolution` via `resolve_for_catalog_item` | yes | `unitResolution.service.ts` | PASS |
| 8 | Staff financial null redact | `redact_catalog_item_out_model` | `redactCatalogItemOutFields` | PASS |
| 9 | `GET …/catalog-items/{id}` 404 `Item not found` | yes | `HttpError 404` | PASS |
| 10 | Get does not require `deleted_at IS NULL` | yes | yes | PASS |
| 11 | In-memory list cache | `app_cache` | **Deferred** Slice 2+ | N/A |

## Endpoints

| Method | Path | Inventory? | Test |
|---|---|---|---|
| GET | `/v1/businesses/:businessId/catalog-items` | yes | `catalogItemsListGet.test.ts` |
| GET | `/v1/businesses/:businessId/catalog-items/:itemId` | yes | same |

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/catalogItemsListGet.test.ts
npm run build
```

## Rollback

Revert Slice 1 commit; remove catalog routes/repo/service/unitResolution + this doc; boards → HOLD Products.

## Next (ask first)

Slice 2 — POST create / PATCH / DELETE (owner) · or fuzzy-check · **do not** start catalog frontend until more read APIs land if needed.
