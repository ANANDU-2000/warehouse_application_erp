# Staff deliveries `/staff/deliveries` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Staff pending deliveries `/staff/deliveries` only — not purchase entry, not barcode/print body, not `/staff/receive` body  
**Sources:** `staff_pending_deliveries_page.dart` · `staff_home_providers.dart` / `groupStaffDeliverySections` · `tradePurchasesRecentSnapshotProvider` · `list_skeleton.dart` · `friendly_load_error.dart` · slice compares below

**Verdict:** **PASS** for in-scope staff deliveries page loop (SCAFFOLD→STATES). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff activity COMPARE · Staff deliveries **SCAFFOLD→COMPARE** |
| 🟡 Current | **HOLD** — nest done; ask before Products Seq 4 backend / merge |
| ⬜ Pending | Products backend · purchase / barcode / receive after backends |
| ⏸ Deferred | purchase entry · barcode/print · receive **bodies** · Settings · keepAlive 2m client cache · merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD AppBar + 3 sections + empty | `StaffPendingDeliveriesPage` | `/staff/deliveries` + slots | PASS | [`staff_deliveries_scaffold_compare.md`](staff_deliveries_scaffold_compare.md) |
| 2 | LAYOUT Hexa chrome + Arrived hot | brandBackground / ListTile | CSS tokens + `--hot` | PASS | [`staff_deliveries_layout_compare.md`](staff_deliveries_layout_compare.md) |
| 3 | FIELDS title/count/empty gates | no form inputs | `staffDelAppBarTitle` / helpers | PASS | [`staff_deliveries_fields_compare.md`](staff_deliveries_fields_compare.md) |
| 4 | BUTTONS back / scan / row→receive | pop · `/barcode/scan` · `/staff/receive/:id` | `onBack` / `onScan` / `onOpenReceive` | PASS | [`staff_deliveries_buttons_compare.md`](staff_deliveries_buttons_compare.md) |
| 5 | WIRE trade-purchases limit 50 | `listTradePurchases` | `fetchTradePurchasesRecent` | PASS | [`staff_deliveries_wire_compare.md`](staff_deliveries_wire_compare.md) |
| 6 | WIRE groupStaffDeliverySections | exact | `staffDeliverySectionsFromRows` | PASS | wire compare |
| 7 | WIRE row subtitle / bags / qty | `_PendingDeliveryTile` | `staffDelRowSubtitle` / `bagsLine` | PASS | wire compare |
| 8 | STATES ListSkeleton 6 × 84 | exact | `STAFF_DEL_SKELETON_*` | PASS | [`staff_deliveries_states_compare.md`](staff_deliveries_states_compare.md) |
| 9 | STATES FriendlyLoadError | fixed message + Tap to retry. | `mapStaffDelLoad*` | PASS | states compare |
| 10 | STATES sections-null gates | loading/error only if null | `hasData` / `showInitialSkeleton` | PASS | states compare |

**Overall (in-scope `/staff/deliveries`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Purchase entry `/purchase` · `/purchase/new` | Backend module blocked (docs/06 Seq 7) |
| Barcode scan / bulk print **bodies** | Backend module blocked (docs/06 Seq 11); nav stubs OK |
| `/staff/receive` · `/staff/receive/:id` **bodies** | Backend module blocked (docs/06 Seq 8); row nav stubs OK |
| Snapshot keepAlive 2m | `api_read_snapshots` — page remount refetch OK |
| `/staff/settings` · `/settings` | Settings **implement locked** |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:staff-deliveries-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc)
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix). STATES+WIRE app code remains until separately reverted.

---

## 5. Next after Approve

1. **Products Seq 4 backend** (`ops/products-module` — ask first), **or**  
2. Hold — purchase / barcode / receive need backends (docs/06 Seq 7–8 / 11), **or**  
3. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked. Do not start blocked UI.**
