# Products backend — Slice 2 (POST / PATCH / DELETE catalog-items)

**Branch:** `ops/products-module`  
**Status:** Slice 2 **PASS** (2026-07-19)  
**Scope:** Backend only — create / update / hard-delete catalog items  
**Sources:** `catalog.py` (`create_catalog_item`, `update_catalog_item`, `delete_catalog_item`); unit profile + `resolve_for_catalog_item` / merge; staff financial redact

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1 GET · **Slice 2 POST/PATCH/DELETE** |
| 🟡 Current | Products backend Slice 2 PASS — ask before Slice 3 (batch / from-scan / fuzzy / variants) or catalog frontend |
| ⬜ Pending | batch · from-scan · fuzzy-check · variants · bulk-archive · item-code/barcode patches · catalog UI |
| ⏸ Deferred | purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `POST …/catalog-items` membership | yes | routes + write service | PASS |
| 2 | Category must exist in business | 400 | `categoryExists` | PASS |
| 3 | Missing `type_id` → General type create | yes | `getOrCreateGeneralTypeId` | PASS |
| 4 | Dup name (cat+type) → 409 `{ message, existing_item_id }` | yes | `HttpError` object detail | PASS |
| 5 | Auto `ITM-####` + barcode fallback to item_code | yes | `nextItemCode` | PASS |
| 6 | Unit profile + resolve/merge + smart fields | yes | `applyCanonicalUnitProfile` + unitResolution | PASS |
| 7 | Default suppliers/brokers + seed supplier_item_defaults | yes | replace + seed | PASS |
| 8 | Staff create response financial null redact | yes | `maybeRedactCatalogOut` | PASS |
| 9 | `PATCH` partial; empty `default_supplier_ids` → 400 | exact message | same string | PASS |
| 10 | Profile keys re-merge unit resolution | yes | after patch | PASS |
| 11 | `DELETE` owner only | `require_owner_membership` | `requireMembership` + `requireOwnerMembership` | PASS |
| 12 | Block delete if trade lines / archived variant lines | yes | count helpers | PASS |
| 13 | Delete 204 | yes | `res.status(204)` | PASS |

## Endpoints

| Method | Path | Auth | Test |
|---|---|---|---|
| POST | `/v1/businesses/:businessId/catalog-items` | membership | `catalogItemsWrite.test.ts` |
| PATCH | `/v1/businesses/:businessId/catalog-items/:itemId` | membership | same |
| DELETE | `/v1/businesses/:businessId/catalog-items/:itemId` | owner | same |

## Key files

- `src/validation/catalogItems.schemas.ts`
- `src/services/catalogItemsWrite.service.ts`
- `src/repositories/catalogItems.repository.ts` (write methods)
- `src/controllers/catalogItems.controller.ts`
- `src/routes/catalogItems.routes.ts`
- `src/errors/httpError.ts` / `sendDetail` (object `detail` for 409)

## Smoke

```bash
cd new-app/backend
npm test -- tests/catalog/catalogItemsWrite.test.ts tests/catalog/catalogItemsListGet.test.ts
npm run build
```

## Rollback

Revert Slice 2 commit; remove write service/schemas/route verbs; restore Slice 1-only controller/routes; boards → Slice 1 current.

## Next (ask first)

Slice 3 — batch / from-scan / fuzzy-check / variants · **or** catalog frontend pages after more read APIs if needed. **Do not** invent purchase/barcode/receive UI.
