# Owner `/home` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_compact_header.dart`; `home_owner_quick_actions.dart`; `home_owner_dashboard_body.dart`; `home_warehouse_activity_feed.dart`; `dashboard.md` §7/§10

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Header Notifications → `/notifications` | Yes | `navigate("/notifications")` + stub | PASS |
| 2 | Header Settings → `/settings` | Yes | `navigate("/settings")` + stub | PASS |
| 3 | Tools: Purchase / Stock / Low stock / Deliveries / Reports / Users / Scan / Reorder / Daily log | Yes | `HOME_OWNER_TOOLS` | PASS |
| 4 | Tool paths match legacy helpers | `/purchase/new`, `/stock`, `/stock/low-stock`, … | Same paths | PASS |
| 5 | Activity **View all** → `/home/activity` | Yes | Button + stub | PASS |
| 6 | Alert / KPI / delivery / purchase CTAs | Data-driven | **Deferred WIRE** (empty shells) | N/A |
| 7 | Live API | Yes | **Deferred WIRE** | N/A |

**Rollback:** Revert BUTTONS commit; restore FIELDS inert header icons + empty tools/activity chrome.

**Next:** WIRE `reports/home-overview` (+ period → `from`/`to`).
