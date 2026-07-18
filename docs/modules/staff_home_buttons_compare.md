# Staff `/staff/home` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_home_page.dart` (profile sheet, quick actions, scan CTA); `StaffHomeToolsGrid` in `staff_home_dashboard_widgets.dart`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Bell → `/notifications` | Yes | `navigate("/notifications")` + stub | PASS |
| 2 | Avatar → profile sheet | Yes | sheet with Settings / Home focus / Logout / Close | PASS |
| 3 | Settings → `/staff/settings` | Yes | stub route | PASS |
| 4 | Home focus in sheet | Radios + prefs | Same radios + `staff_home_focus` | PASS |
| 5 | Logout dialog copy | `Log out of Harisree Warehouse?` + body | exact constants | PASS |
| 6 | Logout clears session | session logout | `clearTokens` + `clearPrimaryBusiness` → `/login` | PASS |
| 7 | Tools labels + paths | Search…Daily log | `STAFF_HOME_TOOLS` | PASS |
| 8 | Labels gated by barcode focus | `staffHomeShowsBarcodeTools` | `staffHomeToolsForFocus` | PASS |
| 9 | Quick actions | Deliveries / Low stock / Scan | exact paths | PASS |
| 10 | Scan barcode CTA | → `/staff/scan` | button + stub | PASS |
| 11 | KPI / attention / activity counts | Data-driven | **Deferred WIRE** | N/A |
| 12 | Live API | Yes | **Deferred WIRE** | N/A |

**Smoke:** `npm run test:staff-home-buttons`  
**Rollback:** Revert BUTTONS commit; restore FIELDS page-body focus + inert bell.  
**Next:** `/staff/home` WIRE — staff floor providers / counts (not owner home-overview).
