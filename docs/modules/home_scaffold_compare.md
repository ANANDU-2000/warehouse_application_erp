# Owner `/home` — SCAFFOLD compare (Subagent 3 step 1)

**Branch:** `ops/dashboard-module`  
**Source:** `dashboard.md` §1; `home_page.dart` section order

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/home` | `HomePage` | `features/home/HomePage` | PASS |
| 2 | Compact header region | Yes | empty slot | PASS |
| 3 | Sticky period region | Yes | empty slot | PASS |
| 4 | Alerts → KPI → delivery → purchase → tools → activity | Owner body order | same slot order | PASS |
| 5 | KPI numbers / period chips / API | Yes | **Deferred** | N/A |
| 6 | Staff `/staff/home` | Staff page | stub unchanged | PASS (by design) |

**Rollback:** Revert SCAFFOLD commit; restore `/home` → `HomeStubPage`.
