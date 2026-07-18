# Owner `/home/breakdown-more` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-18)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Owner `/home/breakdown-more` only — not `/home` body, not `/home/activity`, not `/staff/home`, not full Dashboard Subagent 4  
**Spec:** [`dashboard.md`](dashboard.md) · slice compares below  
**Sources:** `home_breakdown_list_page.dart`; `home_breakdown_tab_providers.dart`; `homeDashboardDataProvider` / `homeShellReportsProvider`

**Verdict:** **PASS** for in-scope breakdown-more page loop (SCAFFOLD→STATES + `reports/home-overview` only). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · **COMPARE** |
| 🟡 Current | `/home/breakdown-more` route loop **PASS** — staff WIRE-2e PASS; ask pull-refresh / Subagent 4 |
| ⬜ Pending | pull-refresh · Users & Roles (backend blocked) |
| ⏸ Deferred | Row tap · period sync · shell data fill; merge to `main`; Dashboard Subagent 4 |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route / slots / tab | `/home/breakdown-more?tab=` | `HomeBreakdownListPage` + slots | PASS | [`home_breakdown_scaffold_compare.md`](home_breakdown_scaffold_compare.md) |
| 2 | LAYOUT chrome | AppBar, Total card, search chrome | Same | PASS | [`home_breakdown_layout_compare.md`](home_breakdown_layout_compare.md) |
| 3 | FIELDS search | hint + match + collapse Total | Same | PASS | [`home_breakdown_fields_compare.md`](home_breakdown_fields_compare.md) |
| 4 | BUTTONS back | `popOrGo('/home')` | Same | PASS | [`home_breakdown_buttons_compare.md`](home_breakdown_buttons_compare.md) |
| 5 | WIRE API | `…/reports/home-overview` | `fetchHomeOverview` | PASS | [`home_breakdown_wire_compare.md`](home_breakdown_wire_compare.md) |
| 6 | Not month `/dashboard` | Never | No UI call | PASS | wire compare |
| 7 | Total + category/shell rows | Bound tiles | Same | PASS | wire compare |
| 8 | STATES cold spinner | `CircularProgressIndicator` | Centered ring | PASS | [`home_breakdown_states_compare.md`](home_breakdown_states_compare.md) |
| 9 | STATES silent empty / fail seed | Empty children / empty seed | Same | PASS | states compare |
| 10 | No FriendlyLoadError on this page | Not in Flutter | Not added | PASS | states compare |

**Overall (in-scope owner `/home/breakdown-more`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Row tap → catalog / supplier / trade item | Satellite navigation; not this loop |
| Cross-route period sync with `/home` | Shared Riverpod period not ported yet |
| Shell `subcategories` / `suppliers` / `items` data fill | Backend `home_shell` often empty until Purchases helpers ported — UI already wired |
| Kg-only bag inference in `_itemUpperQtyLine` | Simplified intentionally in WIRE |
| `homeAnalyticsEmptyHint` strings | Belong to `/home` ranked list, not this page |
| Staff WIRE-2 bodies | Separate `/staff/home` deferral |
| Users & Roles UI | Backend me/businesses only |
| Dashboard module Subagent 4 sign-off | Remaining Dashboard satellites |
| Merge `ops/dashboard-module` → `main` | Hold until you review |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:home-breakdown-compare
# runs scaffold → layout → fields → buttons → wire → states (+ docs present)
```

---

## 4. Rollback

Docs/checklist + compare smoke only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Ask before starting: staff **WIRE-2b** pending delivery cards  
2. Do **not** start Users & Roles UI until users list/CRUD APIs exist  
3. Do **not** mark Dashboard module ✅ until Subagent 4 covers remaining routes  
4. Hold merge of `ops/dashboard-module` to `main` until you review
5. Staff WIRE-2a — **PASS** ([`staff_home_wire2a_compare.md`](staff_home_wire2a_compare.md))
