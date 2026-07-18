# Owner `/home/activity` — SCAFFOLD compare (Step 1)

**Branch:** `ops/dashboard-module`  
**Sources:** `dashboard.md` Definition (Warehouse activity); `home_warehouse_activity_page.dart` section order

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/home/activity` | `HomeWarehouseActivityPage` | `features/home/HomeWarehouseActivityPage` | PASS |
| 2 | AppBar title “Warehouse activity” | Yes | `h1` in appbar slot | PASS |
| 3 | Section order | Period filter → caption → list/error/empty | Same empty `data-slot` order | PASS |
| 4 | Brand bg `#F7F9F6` | `HexaColors.brandBackground` | CSS | PASS |
| 5 | Period chips / back CTA / rows / API | Yes | **Deferred** | N/A |
| 6 | Owner `/home` + staff `/staff/home` | Separate | Untouched | PASS |

**Rollback:** Revert SCAFFOLD commit; restore `DashboardRouteStubPage` on `/home/activity`.

**Next:** `/home/activity` LAYOUT — AppBar/back chrome + period caption styling (still no API). Then FIELDS (period chips).
