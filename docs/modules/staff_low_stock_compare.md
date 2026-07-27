# Staff low stock `/staff/low-stock` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Staff low stock `/staff/low-stock` only — not owner `/stock/low-stock`, not purchase entry, not barcode/print, not `/staff/receive` body  
**Sources:** `low_stock_dashboard_page.dart` (`staffMode: true`) · `low_stock_providers.dart` · `low_stock_category_tree.dart` · `hexa_api.listLowStockOperations` / `notifyOwnerStockItem` · slice compares below

**Verdict:** **PASS** for in-scope staff low-stock page loop (SCAFFOLD→STATES). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff purchase-history COMPARE · Staff low-stock **SCAFFOLD→COMPARE** |
| 🟡 Current | Staff low-stock **COMPARE PASS** — ask before next Subagent 4 stub |
| ⬜ Pending (ask first) | Next stub from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) |
| ⏸ Deferred | PDF/CSV bytes · + Stock / reorder sheets · ops summary KPI · server filter/sort/dispute · owner `/stock/low-stock` · purchase entry · barcode/print · Settings · merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + AppBar + tabs | `LowStockDashboardPage(staffMode: true)` | slots + `/staff/low-stock` | PASS | [`staff_low_stock_scaffold_compare.md`](staff_low_stock_scaffold_compare.md) |
| 2 | LAYOUT Hexa chrome + row | brandBackground / compact row tokens | CSS tokens | PASS | [`staff_low_stock_layout_compare.md`](staff_low_stock_layout_compare.md) |
| 3 | FIELDS debounce / scopes / tab filters | 200ms · search scopes · All/Out/Bought/Pending/Delivery | same | PASS | [`staff_low_stock_fields_compare.md`](staff_low_stock_fields_compare.md) |
| 4 | BUTTONS Inform / Receive / profile / export empty | compact + detail sheet | same CTAs | PASS | [`staff_low_stock_buttons_compare.md`](staff_low_stock_buttons_compare.md) |
| 5 | WIRE ops list + group tree | `listLowStockOperations` + `groupLowStockOperationItems` | repo + `fetchStaffLowStockOperations` | PASS | [`staff_low_stock_wire_compare.md`](staff_low_stock_wire_compare.md) |
| 6 | WIRE Inform owner HTTP | `notifyOwnerStockItem` | POST notify-owner + notifications | PASS | wire compare |
| 7 | STATES spinner + 10s slow + FriendlyLoadError | CircularProgressIndicator + load_state_error | gates + copy map | PASS | [`staff_low_stock_states_compare.md`](staff_low_stock_states_compare.md) |
| 8 | STATES AppBar chrome only on data | `maybeWhen(data:)` | `showDataChrome` | PASS | states compare |
| 9 | STATES pull-to-refresh | RefreshIndicator | touch pull | PASS | states compare |

**Overall (in-scope `/staff/low-stock`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| PDF / CSV byte export | AppBar CTAs show empty snack only (`data-deferred="pdf-bytes"` / `csv-bytes`) |
| + Stock / Set reorder sheets | Deferred (`data-deferred="plus-stock"` / `set-reorder`) |
| Ops summary KPI route | `GET …/low-stock/operations/summary` — attention uses client tab counts |
| Server-side filter/sort/dispute bands | Client tabs only (FIELDS) |
| Owner `/stock/low-stock` | Same Flutter widget `staffMode: false` — separate stub |
| Purchase entry `/purchase` · `/purchase/new` | Separate module |
| Barcode scan / bulk print | Separate Subagent 4 stubs |
| `/staff/settings` · `/settings` | Settings **implement locked** |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:staff-low-stock-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc)
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix). STATES+WIRE app code remains until separately reverted.

---

## 5. Next after Approve

1. Ask before next Subagent 4 stub from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) — e.g. `/staff/activity`, `/staff/receive`, `/barcode/scan`, purchase entry, **or**  
2. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**
