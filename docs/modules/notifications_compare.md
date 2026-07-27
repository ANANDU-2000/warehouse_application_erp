# Notifications `/notifications` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/dashboard-module`  
**Route scope:** Notifications center `/notifications` only — not Settings hub  
**Sources:** `notifications_page.dart` · `mergedNotificationFeedProvider` · `notifications.py` · slice compares below

**Verdict:** **PASS** for in-scope notifications page loop (SCAFFOLD→STATES + list/merge/mark-all/clear/patch). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | SCAFFOLD · LAYOUT · FIELDS · BUTTONS · WIRE · STATES · **COMPARE** |
| 🟡 Current | Notifications COMPARE PASS — ask before next Subagent 4 stub |
| ⬜ Pending (ask first) | Next unlockable stub — [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) |
| ⏸ Deferred | Purchase-due synthetics; Approve/Review; Settings hub (locked); merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + slots | `/notifications` | `NotificationsPage` + slots | PASS | [`notifications_scaffold_compare.md`](notifications_scaffold_compare.md) |
| 2 | LAYOUT Hexa chrome | AppBar / chips / search | tokens + card chrome | PASS | [`notifications_layout_compare.md`](notifications_layout_compare.md) |
| 3 | FIELDS search/filter/empty | catalogs + showing | exact copy + state | PASS | [`notifications_fields_compare.md`](notifications_fields_compare.md) |
| 4 | BUTTONS back/clear/CTAs | popOrGo + dialog + paths | wired local | PASS | [`notifications_buttons_compare.md`](notifications_buttons_compare.md) |
| 5 | WIRE list + merge feed | server + warehouse + welcome | `mergeNotificationFeed` | PASS | [`notifications_wire_compare.md`](notifications_wire_compare.md) |
| 6 | WIRE mark-all / clear / patch | FastAPI routes | backend + `notificationsApi` | PASS | wire compare |
| 7 | WIRE cards + tap navigate | `NotificationAlertCard` | same + PATCH | PASS | wire compare |
| 8 | STATES progress + empty gate | loading / stock idle | `serverLoading`/`stockLoading` | PASS | [`notifications_states_compare.md`](notifications_states_compare.md) |
| 9 | STATES error map | `loadStateErrorSubtitle` | `mapNotificationsLoadSubtitle` | PASS | states compare |
| 10 | STATES pull-to-refresh | `RefreshIndicator` | touch pull → retry | PASS | states compare |
| 11 | Staff omit Purchases filter | `_visibleFilters` | `NOTIFICATIONS_FILTER_ORDER_STAFF` | PASS | fields/scaffold |

**Overall (in-scope `/notifications`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Purchase due/overdue synthetics (`pur_*`) | New-app trade-purchases list lacks `remaining`/`due_date` vs FastAPI `TradePurchaseOut` |
| Approve / Review / Order-now query `itemId` polish | Card Order now navigates `/purchase/new`; Approve/Review not wired |
| Settings `/staff/settings` · `/settings` | Settings module **implement locked** |
| Desktop multi-column notification layout | Flutter desktop width branch; mobile parity shipped |
| Full FriendlyLoadError full-page replace | Page uses banner ListTile pattern (legacy match) |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:notifications-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc)
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. Ask before: **next Subagent 4 satellite** from [`dashboard_subagent4_inventory.md`](dashboard_subagent4_inventory.md) (not Settings hub), **or**  
2. Hold / merge review of `ops/dashboard-module` → `main`.

**Do not merge to `main` unless asked.**
