# Staff item gallery `/staff/items` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `staffGalleryStockProvider` · `hexa_api.listStock` · `stock_list.py` / `stock_helpers._item_to_list_row` · `stock_inventory.stock_status`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff search COMPARE · Staff items SCAFFOLD · LAYOUT · FIELDS · BUTTONS · **WIRE** |
| 🟡 Current | Staff items **WIRE PASS** — ask before STATES |
| ⬜ Pending | Staff items STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | `/staff/settings` · `/settings`; QuickStockActionSheet; FriendlyLoadError map polish (STATES) |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | `GET …/stock/list` authz membership | Yes | existing `createStockRoutes` | PASS |
| 2 | Gallery paginate pageSize 500 · max 40 pages · status=all · sort=name | `staffGalleryStockProvider` | `fetchAllGalleryStock` | PASS |
| 3 | Response items + total + page + per_page | StockListOut | same | PASS |
| 4 | Category / subcategory names | `_item_to_list_row` | JOIN `item_categories` / `category_types` | PASS |
| 5 | `missing_barcode` from empty barcode | stock_helpers | `itemOut` | PASS |
| 6 | `stock_status` out/critical/low/healthy | `stock_inventory.stock_status` | `computeStockStatus` | PASS |
| 7 | `opening_stock_set_at` on rows | StockListItemOut | same | PASS |
| 8 | Normalize → `opening_stock_set` / `needs_opening_stock` for Flutter filter keys | client intent | `normalizeGalleryStockItem` | PASS* |
| 9 | Frontend load → `allItems` + filter/group | provider | `setAllItems` | PASS |
| 10 | Loading spinner while fetch | `CircularProgressIndicator` | `data-slot="loading"` | PASS |
| 11 | Error + Retry (basic) | FriendlyLoadError | title + retry (STATES polishes map) | PASS* |
| 12 | per_page max 2000 | FastAPI `le=2000` | `Math.min(2000,…)` | PASS |
| 13 | QuickStockActionSheet | Yes | **Deferred** | N/A |
| 14 | Full StockListItemOut trade/period meta | Yes | **Deferred** (gallery subset only) | N/A |

\*Opening filter: Flutter checks `opening_stock_set` / `needs_opening_stock` which API does not emit; new-app maps from `opening_stock_set_at` (documented). Error subtitle status map deferred to STATES.

**Smoke:** `npm run test:staff-items-wire` (+ prior PASS); backend `vitest` `tests/stock/stockStatus.test.ts`; `npm run build` PASS.

**Rollback:** Revert WIRE commit; restore BUTTONS empty `allItems`; remove `staffItemGalleryApi.ts` + gallery fields from `listStock` SELECT/itemOut (keep slim fields if needed for staff home); remove this compare + script; boards → ask before WIRE.

**Next (ask first):** `/staff/items` STATES — do not start until approved.
