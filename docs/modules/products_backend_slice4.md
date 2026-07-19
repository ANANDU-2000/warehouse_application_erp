# Products backend — Slice 4 (GET catalog fuzzy-check)

**Branch:** `ops/products-module`  
**Status:** Slice 4 **PASS** (2026-07-19)  
**Scope:** Backend only — `GET /catalog/fuzzy-check`  
**Sources:** `catalog.py:catalog_fuzzy_check`; `fuzzy_catalog.py:rank_ids_by_token_sort` (RapidFuzz token_sort_ratio)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Slice 1–3 · **Slice 4 fuzzy-check** · Slice 5 (see slice5) |
| 🟡 Current | See [`products_backend_slice5.md`](products_backend_slice5.md) |
| ⬜ Pending | variants · bulk-archive · catalog UI |
| ⏸ Deferred | purchase entry · barcode/print UI · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/catalog/fuzzy-check` membership | yes | `createCatalogRoutes` | PASS |
| 2 | Query `name` 1..512 | Query | 422 if missing/empty/too long | PASS |
| 3 | Optional `category_id` / `type_id` / `supplier_id` | Query | same filters + EXISTS supplier | PASS |
| 4 | `deleted_at IS NULL` candidates | yes | yes | PASS |
| 5 | `rank_ids_by_token_sort` limit 12 cutoff 55 | yes | `rankIdsByTokenSort` | PASS |
| 6 | Hit `score` = token_sort_ratio / 100 (0..1) | yes | round 4 dp | PASS |
| 7 | RapidFuzz token_sort_ratio parity | rapidfuzz | Indel LCS port | PASS |

## Endpoints

| Method | Path | Auth | Test |
|---|---|---|---|
| GET | `/v1/businesses/:businessId/catalog/fuzzy-check` | membership | `catalogFuzzyCheck.test.ts` |

## Key files

- `src/services/fuzzyCatalog.service.ts`
- `src/services/catalogFuzzyCheck.service.ts`
- `src/controllers/catalog.controller.ts`
- `src/repositories/catalogItems.repository.ts` (`listFuzzyNamePairs`)

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/
npm run build
```

## Rollback

Revert Slice 4 commit; remove fuzzy services/controller mount; boards → Slice 3 current.

## Next (ask first)

Slice 5 — variants · PATCH item-code/barcode · bulk-archive · **or** catalog frontend. Purchase / barcode-print / receive remain **backend-blocked**.
