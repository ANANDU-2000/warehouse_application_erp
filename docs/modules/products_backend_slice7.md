# Products backend — Slice 7 (bulk-archive + bulk-reorder)

**Branch:** `ops/products-module`  
**Status:** Slice 7 **PASS** (2026-07-19)  
**Scope:** Backend only — owner bulk soft-delete + bulk reorder_level  
**Sources:** `catalog.py` (`bulk_archive_catalog_items`, `bulk_reorder_catalog_items`)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Slice 1–6 · **Slice 7 bulk-archive + bulk-reorder** |
| 🟡 Current | Products backend Slice 7 PASS — ask before catalog UI or remaining catalog reads (insights/defaults/lines) |
| ⬜ Pending | catalog UI · supplier-purchase-defaults · insights · duplicate-clusters · categories APIs |
| ⏸ Deferred | purchase entry · barcode/print UI · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `POST …/catalog/items/bulk-archive` owner | yes | routes + `requireOwnerMembership` | PASS |
| 2 | Body `item_ids` 1..200 | yes | Zod | PASS |
| 3 | Soft-delete only active (`deleted_at IS NULL`) | yes | `bulkSoftDelete` | PASS |
| 4 | Response 204 | yes | same | PASS |
| 5 | `PATCH …/catalog/items/bulk-reorder` owner | yes | same | PASS |
| 6 | Body `item_ids` + `reorder_level` ≥ 0 | yes | Zod | PASS |
| 7 | Response `{ updated }` | yes | same | PASS |
| 8 | Staff → 403 | yes | owner gate | PASS |
| 9 | In-memory cache invalidate | `app_cache` | **Deferred** (no list cache yet) | N/A |

## Endpoints

| Method | Path | Auth | Test |
|---|---|---|---|
| POST | `/v1/businesses/:businessId/catalog/items/bulk-archive` | owner | `catalogBulk.test.ts` |
| PATCH | `/v1/businesses/:businessId/catalog/items/bulk-reorder` | owner | same |

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/
npm run build
```

## Rollback

Revert Slice 7 commit; remove bulk methods + routes; boards → Slice 6 current.

## Next (ask first)

**Catalog UI** (docs/06 Seq 4 pages) · **or** remaining catalog read APIs (defaults/insights) · **or** hold. Purchase / barcode-print / receive remain **backend-blocked**.
