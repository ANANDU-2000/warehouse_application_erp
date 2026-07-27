# Staff activity `/staff/activity` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Staff activity `/staff/activity` only — not owner home activity, not purchase entry, not barcode/print, not `/staff/receive`  
**Sources:** `staff_activity_page.dart` · `hexa_api.listActivityLog` · `list_skeleton.dart` · `hexa_error_card.dart` / `load_state_error.dart` · slice compares below

**Verdict:** **PASS** for in-scope staff activity page loop (SCAFFOLD→STATES). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff low-stock COMPARE · Staff activity **SCAFFOLD→COMPARE** |
| 🟡 Current | Staff activity **COMPARE PASS** — ask before next Subagent 4 stub |
| ⬜ Pending (ask first) | Next stub from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) |
| ⏸ Deferred | purchase entry · barcode/print · receive · Settings · merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + AppBar + empty | `StaffActivityPage` | `/staff/activity` + slots | PASS | [`staff_activity_scaffold_compare.md`](staff_activity_scaffold_compare.md) |
| 2 | LAYOUT Hexa chrome + row avatars | brandBackground / ListTile tokens | CSS tokens | PASS | [`staff_activity_layout_compare.md`](staff_activity_layout_compare.md) |
| 3 | FIELDS period Today / Week / Month | SegmentedButton | `setPeriod` + chips | PASS | [`staff_activity_fields_compare.md`](staff_activity_fields_compare.md) |
| 4 | BUTTONS back + display-only rows | `popOrGo` · ListTile no onTap | `onBack` · `data-interactive="false"` | PASS | [`staff_activity_buttons_compare.md`](staff_activity_buttons_compare.md) |
| 5 | WIRE activity-log by period | `listActivityLog` | `fetchStaffActivityLog` | PASS | [`staff_activity_wire_compare.md`](staff_activity_wire_compare.md) |
| 6 | WIRE labels / timeAgo / when stamp | `_staffActivityLabel` / `_timeAgo` | `staffActLabel` / `staffActTimeAgo` | PASS | wire compare |
| 7 | STATES ListSkeleton 10 × 84 | exact | `STAFF_ACT_SKELETON_*` | PASS | [`staff_activity_states_compare.md`](staff_activity_states_compare.md) |
| 8 | STATES HexaErrorCard map | title + `loadStateErrorSubtitle` | `mapStaffActLoad*` | PASS | states compare |
| 9 | STATES no pull / no keepAlive | autoDispose · no RefreshIndicator | same | PASS | states compare |

**Overall (in-scope `/staff/activity`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Purchase entry `/purchase` · `/purchase/new` | Backend module blocked (docs/06 Seq 7) |
| Barcode scan / bulk print | Backend module blocked (docs/06 Seq 11) |
| `/staff/receive` · deliveries | Backend module blocked (docs/06 Seq 8) |
| Owner `/home/activity` | Separate page (already COMPARE PASS) |
| `/staff/settings` · `/settings` | Settings **implement locked** |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:staff-activity-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc)
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix). STATES+WIRE app code remains until separately reverted.

---

## 5. Next after Approve

1. Ask before next Subagent 4 stub from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) — e.g. `/staff/deliveries`, `/staff/scan`, catalog item, **or** hold for backends (purchase / barcode / receive), **or**  
2. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**
