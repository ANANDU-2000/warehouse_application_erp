# Staff stock `/staff/stock` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Staff warehouse stock `/staff/stock` only — not owner `/stock` full ops, not Settings hub  
**Sources:** `stock_page.dart` (`StockPage(mode: staff)`) · `stock_operational_top_bar.dart` · `stockListProvider` / `hexa_api.listStock` · `stock_helpers` · slice compares below

**Verdict:** **PASS** for in-scope staff stock page loop (SCAFFOLD→STATES + listStock wire). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | Notifications · Staff search · Staff items COMPARE · Staff stock **SCAFFOLD→COMPARE** · Staff purchase-history **SCAFFOLD** |
| 🟡 Current | Staff purchase-history **SCAFFOLD PASS** — ask before LAYOUT |
| ⬜ Pending (ask first) | Staff purchase-history LAYOUT → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | delivery-indicator-counts · Activity feed · period purchased · shell-bundle · subcategory/supplier pickers · `/staff/settings` · `/settings` · merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + AppBar + tabs | `StockPage(staff)` + top bar | slots + `/staff/stock` | PASS | [`staff_stock_scaffold_compare.md`](staff_stock_scaffold_compare.md) |
| 2 | LAYOUT Hexa operational chrome | Scaffold `#F5F3EE` + chip/table | tokens + CSS | PASS | [`staff_stock_layout_compare.md`](staff_stock_layout_compare.md) |
| 3 | FIELDS debounce / status / empty | 180ms · All/Low/Out | same | PASS | [`staff_stock_fields_compare.md`](staff_stock_fields_compare.md) |
| 4 | BUTTONS period/filters/search/Scan | top bar sheets + menu | same (staff: no PDF/Excel/Add) | PASS | [`staff_stock_buttons_compare.md`](staff_stock_buttons_compare.md) |
| 5 | WIRE listStock + status/q/sort | `stock_helpers._query_items` | repo + `fetchStaffStockListPage` | PASS | [`staff_stock_wire_compare.md`](staff_stock_wire_compare.md) |
| 6 | WIRE SYS/PHYS/DIFF rows | `StockRowMetrics` | `staffStockRowMetrics` | PASS | wire compare |
| 7 | WIRE physical from latest count | `_latest_physical_count_map` | `OUTER APPLY` | PASS | wire compare |
| 8 | STATES ListSkeleton / FriendlyLoadError | `ListSkeleton(12)` / auth titles | gates + copy map | PASS | [`staff_stock_states_compare.md`](staff_stock_states_compare.md) |
| 9 | STATES 3m query cache | `kStockListCacheTtl` | `STAFF_STOCK_CACHE_TTL_MS` | PASS | states compare |
| 10 | STATES pull + isReloading | RefreshIndicator / top bar | touch pull + reload bar | PASS | states compare |

**Overall (in-scope `/staff/stock`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Delivery indicator chips | `delivery-indicator-counts` provider not ported (`data-deferred`) |
| Activity tab feed (`StockChangesTab`) | placeholder + `data-deferred="activity-feed"` |
| Period purchased totals / `includePeriod` | period UI local only; totals not wired |
| shell-bundle first page | `stockShellBundleProvider` not ported |
| Subcategory / supplier pickers in filter sheet | deferred slot |
| Owner `/stock` full ops (PDF/Excel/movement/add) | Staff mode only — top bar omits those CTAs |
| `/staff/settings` · `/settings` | Settings module **implement locked** |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:staff-stock-compare
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

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix). STATES+WIRE app code remains until separately reverted.

---

## 5. Next after Approve

1. Ask before: **`/staff/purchase-history` LAYOUT** (SCAFFOLD done — [`staff_purchase_history_scaffold_compare.md`](staff_purchase_history_scaffold_compare.md)), **or**  
2. Another Subagent 4 stub from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md), **or**  
3. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**
