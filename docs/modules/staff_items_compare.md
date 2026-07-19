# Staff item gallery `/staff/items` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Staff item gallery `/staff/items` only — not owner `/stock` gallery, not Settings hub  
**Sources:** `staff_item_gallery_page.dart` · `staffGalleryStockProvider` · `hexa_api.listStock` · `stock_list.py` / `stock_helpers` · slice compares below

**Verdict:** **PASS** for in-scope staff gallery page loop (SCAFFOLD→STATES + listStock wire). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · **COMPARE** |
| 🟡 Current | Staff items COMPARE PASS — ask before next Subagent 4 stub |
| ⬜ Pending (ask first) | Next unlockable stub — [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) |
| ⏸ Deferred | `/staff/settings` · `/settings` (implement locked); QuickStockActionSheet; full StockListItemOut trade/period meta; merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + AppBar | `StaffItemGalleryPage` | `StaffItemGalleryPage` slots | PASS | [`staff_items_scaffold_compare.md`](staff_items_scaffold_compare.md) |
| 2 | LAYOUT Hexa chip/card chrome | chipTheme + Card border | tokens + CSS ready | PASS | [`staff_items_layout_compare.md`](staff_items_layout_compare.md) |
| 3 | FIELDS search/filter/match | debounce 200ms + filter helpers | same | PASS | [`staff_items_fields_compare.md`](staff_items_fields_compare.md) |
| 4 | BUTTONS expand/subtabs/row menu/nav | PopupMenu + catalog paths | same + edit stub | PASS | [`staff_items_buttons_compare.md`](staff_items_buttons_compare.md) |
| 5 | WIRE listStock paginate | pageSize 500 · ≤40 pages | `fetchAllGalleryStock` | PASS | [`staff_items_wire_compare.md`](staff_items_wire_compare.md) |
| 6 | WIRE gallery row fields | category/barcode/status/opening | JOIN + `computeStockStatus` | PASS | wire compare |
| 7 | WIRE opening filter key map | Flutter keys vs API `opening_stock_set_at` | `normalizeGalleryStockItem` | PASS* | wire compare |
| 8 | STATES body load/error gates | `AsyncValue.when` | `showData` + FriendlyLoadError | PASS | [`staff_items_states_compare.md`](staff_items_states_compare.md) |
| 9 | STATES 3m keepAlive cache | provider timer | `STAFF_GALLERY_CACHE_TTL_MS` | PASS | states compare |
| 10 | STATES pull-to-refresh retry | N/A gallery | touch pull → retry | PASS* | states compare |

\*Opening filter mapped from API `opening_stock_set_at` (Flutter filter keys not on StockListItemOut). Pull is SPA affordance (no Flutter RefreshIndicator).

**Overall (in-scope `/staff/items`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| QuickStockActionSheet (`Update stock` sheet) | Menu control present; sheet write API not ported (`data-deferred`) |
| Full StockListItemOut trade/period/physical meta | Gallery subset fields only — enough for filters/rows |
| Owner `/stock` gallery parity | Slice = staff `/staff/items` only |
| `/staff/settings` · `/settings` | Settings module **implement locked** |
| Rapidfuzz / trade-intel polish | N/A to this route |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:staff-items-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc)
npm run build
```

Backend (WIRE regression, optional on COMPARE):

```bash
cd new-app/backend
npx vitest run tests/stock/stockStatus.test.ts
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Ask before: **next Subagent 4 satellite** from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) (e.g. `/staff/stock` — not Settings hub), **or**  
2. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**
