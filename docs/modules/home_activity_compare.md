# Owner `/home/activity` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-18)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Owner `/home/activity` only — not `/home` body, not `/staff/home`, not full Dashboard Subagent 4  
**Spec:** [`dashboard.md`](dashboard.md) · slice compares below  
**Sources:** `home_warehouse_activity_page.dart`; `_fetchHomeWarehouseActivity` in `home_owner_dashboard_providers.dart`

**Verdict:** **PASS** for in-scope warehouse activity page loop (SCAFFOLD→STATES + three feed APIs). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · **COMPARE** |
| 🟡 Current | `/home/activity` route loop **PASS** — `/home/breakdown-more` COMPARE PASS; ask staff WIRE-2 |
| ⬜ Pending | staff WIRE-2 · Users & Roles (backend blocked) |
| ⏸ Deferred | Pull-refresh · row detail sheet · write invalidation; merge to `main`; Dashboard Subagent 4 |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD slots / route | `/home/activity` | `HomeWarehouseActivityPage` + slots | PASS | [`home_activity_scaffold_compare.md`](home_activity_scaffold_compare.md) |
| 2 | LAYOUT chrome | AppBar, caption, table header | Same | PASS | [`home_activity_layout_compare.md`](home_activity_layout_compare.md) |
| 3 | FIELDS period | Today→Custom + caption | Chips + custom range | PASS | [`home_activity_fields_compare.md`](home_activity_fields_compare.md) |
| 4 | BUTTONS back | `popOrGo('/home')` | Same | PASS | [`home_activity_buttons_compare.md`](home_activity_buttons_compare.md) |
| 5 | WIRE APIs | trade / audit/recent / staff-purchases | Same three + merge | PASS | [`home_activity_wire_compare.md`](home_activity_wire_compare.md) |
| 6 | Merge keepKinds + collapse | `_fetchHomeWarehouseActivity` | `homeActivityFeed.ts` | PASS | wire compare |
| 7 | Not month `/dashboard` | Never | No UI call | PASS | wire compare |
| 8 | Full-page limits 60 / 200 / 30 | Yes | Same defaults | PASS | wire compare |
| 9 | STATES skeleton rows 8 | `HomeSectionSkeleton` | Same | PASS | [`home_activity_states_compare.md`](home_activity_states_compare.md) |
| 10 | STATES FriendlyLoadError | `Could not load activity` + Retry | Exact + `Tap to retry.` | PASS | states compare |
| 11 | STATES empty full-page subtitle | Deliveries, purchases, and stock… | Exact (not feed copy) | PASS | states compare |
| 12 | Cache-while-refresh banner | 2px progress | Same | PASS | states compare |

**Overall (in-scope owner `/home/activity`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Pull-to-refresh `RefreshIndicator` | Same deferral as owner `/home` STATES |
| Row tap / activity detail sheet | Satellite UI; not this loop |
| Business-write invalidation listeners | No write-event bus on new-app yet |
| Compact home-feed empty subtitle | Different string on `/home` feed — already COMPARE PASS there |
| `/home/breakdown-more` | Next nested route — COMPARE PASS |
| Staff WIRE-2 bodies | Separate staff route deferral |
| Dashboard module Subagent 4 sign-off | Needs remaining Dashboard satellites |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:home-activity-compare
# runs scaffold → layout → fields → buttons → wire → states (+ docs present)
```

---

## 4. Rollback

Docs/checklist only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Start `/home/breakdown-more` **SCAFFOLD** (Dashboard Seq 2 nested)  
2. Do **not** mark Dashboard module ✅ until Subagent 4 covers remaining routes  
3. Hold merge of `ops/dashboard-module` to `main` until you review  
4. Users & Roles UI remains blocked until users list/CRUD APIs exist
