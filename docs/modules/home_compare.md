# Owner `/home` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-18)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Owner `/home` only — not `/staff/home`, not full Dashboard module Subagent 4  
**Spec:** [`dashboard.md`](dashboard.md) · slice compares below

**Verdict:** **PASS** for in-scope owner home page loop (SCAFFOLD→STATES + backend overview). Known deferrals listed as N/A (not FAIL).

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD slots / route | `/home` owner shell | `HomePage` + slots | PASS | [`home_scaffold_compare.md`](home_scaffold_compare.md) |
| 2 | LAYOUT chrome | Compact header 48, cards r12, Hexa bg | Same | PASS | [`home_layout_compare.md`](home_layout_compare.md) |
| 3 | FIELDS period | Today→Custom, Month default, caption | `homePeriod.ts` + chips | PASS | [`home_fields_compare.md`](home_fields_compare.md) |
| 4 | BUTTONS CTAs | Header + Tools + View all | Local navigate + stubs | PASS | [`home_buttons_compare.md`](home_buttons_compare.md) |
| 5 | WIRE API | `GET …/reports/home-overview` | `fetchHomeOverview` + sessionStore | PASS | [`home_wire_compare.md`](home_wire_compare.md) |
| 6 | Not month `/dashboard` | Flutter unused | No UI call | PASS | wire compare |
| 7 | Period → `from`/`to` | half-open −1ms | `homePeriodApiDates` | PASS | wire compare |
| 8 | KPI / alerts / purchase bind | Owner body | Bound from overview JSON | PASS | wire compare |
| 9 | STATES loading | Skeleton + `Loading dashboard…` | Exact copy + bars | PASS | [`home_states_compare.md`](home_states_compare.md) |
| 10 | STATES errors | FriendlyLoadError / Session expired | Exact strings + Retry | PASS | states compare |
| 11 | STATES empty | Activity empty + hide zero delivery | Exact strings | PASS | states compare |
| 12 | Backend overview | reports_trade snapshot | Subagent 1+2 on branch | PASS | `dashboard_subagent1_backend.md`, `dashboard_subagent2_db_check.md` |

**Overall (in-scope owner `/home`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Activity feed rows / stock audit satellites | WIRE/STATES: View all + empty only |
| ETag / in-memory TTL cache | Not ported this loop |
| Pull-to-refresh / `RefreshIndicator` | Not ported |
| `HomeLiveStatusBar` | Not ported |
| Opening stock alert chip | Backend operational stub often 0 |
| Delivery stage breakdown (dispatched/arrived/…) | Bundle exposes pending/received only |
| Analytics ring / comparison charts | Owner body secondary; unused month `/dashboard` charts |
| Offline Synced/Offline state machine | Static Synced |
| `/staff/home` full UI | Stub only; separate route loop |
| Splash session restore WIRE | Explicitly deferred (`docs/07`) |
| Dashboard module Subagent 4 sign-off | Needs `/staff/home` (+ nested routes) COMPARE |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:home-compare
# equivalent:
# npm run test:home-scaffold && npm run test:home-layout && npm run test:home-fields \
#   && npm run test:home-buttons && npm run test:home-wire && npm run test:home-states && npm run build
```

---

## 4. Rollback

Docs/checklist only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Ask before starting: Splash WIRE (deferred) **or** `/staff/home` SCAFFOLD **or** Users & Roles module  
2. Do **not** mark Dashboard module ✅ until Subagent 4 covers remaining Dashboard routes  
3. Hold merge of `ops/dashboard-module` to `main` until you review
