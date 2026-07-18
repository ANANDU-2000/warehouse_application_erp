# Staff `/staff/home` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-18)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Staff `/staff/home` only — not owner `/home`, not full Dashboard module Subagent 4  
**Spec:** [`dashboard.md`](dashboard.md) · slice compares below

**Verdict:** **PASS** for in-scope staff home page loop (SCAFFOLD→STATES + scoped WIRE APIs). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · **COMPARE** |
| 🟡 Current | Staff WIRE-2e bell badge **PASS** — ask before pull-refresh / Subagent 4 |
| ⬜ Pending (ask first) | pull-refresh · Users & Roles (backend blocked) |
| ⏸ Deferred | Pull-refresh; merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD slots / route | `/staff/home` body order | `StaffHomePage` + `data-slot` | PASS | [`staff_home_scaffold_compare.md`](staff_home_scaffold_compare.md) |
| 2 | LAYOUT chrome | max 560, Hexa bg, section headers | Exact titles/subtitles | PASS | [`staff_home_layout_compare.md`](staff_home_layout_compare.md) |
| 3 | FIELDS focus | `StaffHomeFocus` radios + prefs | `staffHomeFocus.ts` + sheet | PASS | [`staff_home_fields_compare.md`](staff_home_fields_compare.md) |
| 4 | BUTTONS CTAs | Tools / quick / scan / profile / bell | Navigate + stubs | PASS | [`staff_home_buttons_compare.md`](staff_home_buttons_compare.md) |
| 5 | WIRE paths | Flutter-exact staff APIs | Thin backends + `staffHomeApi` | PASS | [`staff_home_wire_compare.md`](staff_home_wire_compare.md) |
| 6 | Not owner `home-overview` | Staff never calls | No staff call | PASS | wire compare |
| 7 | Floor KPI bind | Pipeline + low list length | Pending/Delivered/Low stock | PASS | wire compare |
| 8 | Attention gates | focus + counts | `staffHomeShows*` + tiles | PASS | wire compare |
| 9 | STATES loading | 3×88 shimmer | `StaffFloorKpiSkeleton` | PASS | [`staff_home_states_compare.md`](staff_home_states_compare.md) |
| 10 | STATES errors | Floor / session / network + Retry | Exact copy | PASS | states compare |
| 11 | STATES empty | Activity + shift empty strings | Exact constants | PASS | states compare |
| 12 | Greeting · STAFF · date | Flutter spans | Exact role + `EEE d MMM` | PASS | layout + wire name |

**Overall (in-scope staff `/staff/home`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Warehouse & purchases stats body (`stock/totals`) | **WIRE-2a PASS** |
| Pending delivery card list (`trade-purchases` list) | **WIRE-2b PASS** — [`staff_home_wire2b_compare.md`](staff_home_wire2b_compare.md) |
| Shift today strip numbers (`activity-log` + `audit/feed`) | **WIRE-2c PASS** — [`staff_home_wire2c_compare.md`](staff_home_wire2c_compare.md) |
| Recent activity feed rows | **WIRE-2d PASS** — [`staff_home_wire2d_compare.md`](staff_home_wire2d_compare.md) |
| Notifications unread badge merge | **WIRE-2e PASS** — [`staff_home_wire2e_compare.md`](staff_home_wire2e_compare.md) |
| Pull-to-refresh / auto-refresh listener | Not ported |
| Profile sheet business title line | Name/role only this loop |
| Nested staff routes full pages | Stubs only |
| Splash session restore WIRE | **Done** — [`splash_compare.md`](splash_compare.md) |
| Dashboard module Subagent 4 sign-off | Needs remaining Dashboard satellites + ask |
| Owner `/home` | Separate COMPARE PASS already |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:staff-home-compare
# runs scaffold → layout → fields → buttons → wire → states (+ docs present)
```

---

## 4. Rollback

Docs/checklist only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Ask before starting: **pull-refresh** · Users & Roles (still backend-blocked) · Dashboard Subagent 4  
2. Do **not** mark full Dashboard module ✅ until Subagent 4 remaining routes are agreed  
3. Hold merge of `ops/dashboard-module` to `main` until you review
4. Splash `/splash` — **COMPARE PASS**
5. WIRE-2a–2e — **PASS**

