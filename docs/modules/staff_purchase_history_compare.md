# Staff purchase history `/staff/purchase-history` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Staff purchase orders list `/staff/purchase-history` only — not purchase entry wizard, not owner `/purchase`, not `/staff/low-stock` page body, not detail page body  
**Sources:** `staff_purchase_history_page.dart` · `staffTradePurchasesHistoryProvider` · `staffLowStockAlertsProvider` · slice compares below

**Verdict:** **PASS** for in-scope staff purchase-history page loop (SCAFFOLD→STATES). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff stock COMPARE · Staff purchase-history **SCAFFOLD→COMPARE** |
| 🟡 Current | Staff purchase-history **COMPARE PASS** — ask before next stub (`/staff/low-stock` started) |
| ⬜ Pending (ask first) | `/staff/low-stock` LAYOUT → COMPARE · other Subagent 4 stubs — [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) |
| ⏸ Deferred | full pack summary · delivery badge · detail body · staff ₹ redact · purchase entry · barcode/print · owner `/stock` · Settings · merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + AppBar + tabs | `StaffPurchaseHistoryPage` | slots + `/staff/purchase-history` | PASS | [`staff_purchase_history_scaffold_compare.md`](staff_purchase_history_scaffold_compare.md) |
| 2 | LAYOUT Hexa chrome + row/date | brandBackground / row tokens | CSS tokens | PASS | [`staff_purchase_history_layout_compare.md`](staff_purchase_history_layout_compare.md) |
| 3 | FIELDS debounce / status / low chips | 250ms · All/Undelivered/Delivered · All low/Critical | same | PASS | [`staff_purchase_history_fields_compare.md`](staff_purchase_history_fields_compare.md) |
| 4 | BUTTONS row tap + Inform owner | push detail / `/staff/low-stock` | same | PASS | [`staff_purchase_history_buttons_compare.md`](staff_purchase_history_buttons_compare.md) |
| 5 | WIRE trade-purchases period + paginate | provider 50→500 | `fetchStaffPhPurchases` | PASS | [`staff_purchase_history_wire_compare.md`](staff_purchase_history_wire_compare.md) |
| 6 | WIRE low tab listStock status=low | `staffLowStockAlertsProvider` | `fetchStaffPhLowStock` | PASS | wire compare |
| 7 | WIRE tab label `Low stock (N)` | lowAsync.maybeWhen | `lowRows.length` | PASS | wire compare |
| 8 | STATES ListSkeleton / FriendlyLoadError | 10×88 / 8×72 + titles | gates + copy map | PASS | [`staff_purchase_history_states_compare.md`](staff_purchase_history_states_compare.md) |
| 9 | STATES 2m keepAlive cache | registerProviderKeepAliveTimer 2m | `STAFF_PH_CACHE_TTL_MS` | PASS | states compare |
| 10 | STATES pull-to-refresh purchases only | RefreshIndicator | touch pull | PASS | states compare |

**Overall (in-scope `/staff/purchase-history`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Full pack summary on row | include_lines / pack accumulator (`data-deferred="pack-summary"`) |
| PurchaseDeliveryBadge | delivery badge not ported (`data-deferred="delivery-badge"`) |
| Detail page `/staff/purchase-history/:id` body | route stub — separate page loop |
| Staff financial ₹ redaction | UI hides amounts; server redact path deferred |
| Inform owner target page `/staff/low-stock` | CTA navigates; **page still stub** |
| Purchase entry `/purchase` · `/purchase/new` | separate module — not this list |
| Barcode scan / bulk print | separate Subagent 4 stubs |
| Owner `/stock` family | Staff list only |
| `/staff/settings` · `/settings` | Settings **implement locked** |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:staff-purchase-history-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc)
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix). STATES+WIRE app code remains until separately reverted.

---

## 5. Next after Approve

1. Ask before: **`/staff/low-stock` LAYOUT** (SCAFFOLD done — [`staff_low_stock_scaffold_compare.md`](staff_low_stock_scaffold_compare.md)), **or**  
2. Another Subagent 4 stub from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md), **or**  
3. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**
