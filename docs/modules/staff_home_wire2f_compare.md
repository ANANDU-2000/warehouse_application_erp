# Staff `/staff/home` — WIRE-2f compare (Pull-refresh + light auto-refresh)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_home_page.dart` (`RefreshIndicator`, `_invalidateStaffHomeRefresh`); `staff_home_auto_refresh_listener.dart` (2-min periodic, 25s debounce, foreground)

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Pull-to-refresh at top | `RefreshIndicator` | Touch pull on scroll + indicator | PASS |
| 2 | Full invalidate on pull | `_invalidateStaffHomeRefresh` | `reloadAll` (retryTick + wh/pu) | PASS |
| 3 | Light refresh every 2 min | `Timer.periodic` | `STAFF_HOME_AUTO_REFRESH_MS` | PASS |
| 4 | Light debounce 25s | Yes | `canStaffHomeLightRefresh` | PASS |
| 5 | Foreground / resume refresh | `appLastForegroundAtProvider` | `visibilitychange` → visible | PASS |
| 6 | Realtime invalidation | `realtimeInvalidationProvider` | **N/A** (no realtime in new-app) | N/A |
| 7 | Not `home-overview` | Staff never | No call | PASS |

**Smoke:** `npm run test:staff-home-wire2f`  
**Rollback:** Revert WIRE-2f commit; remove pull handlers / auto-refresh effect.  
**Next:** Ask before Users & Roles (blocked) · Dashboard Subagent 4 · merge to `main`.
