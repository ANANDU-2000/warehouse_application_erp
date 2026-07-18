# Staff `/staff/home` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_home_providers.dart` (`StaffHomeFocus`, prefs key); `staff_home_page.dart` `_staffFocusLabel` + sheet heading `Home focus`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Focus values order | `all`, `barcode`, `stock`, `purchase` | `STAFF_HOME_FOCUS_ORDER` | PASS |
| 2 | Labels | All tasks / Barcode & labels / Stock & warehouse / Purchases & delivery | `STAFF_HOME_FOCUS_LABELS` | PASS |
| 3 | Heading | `Home focus` | exact constant | PASS |
| 4 | Storage key | `staff_home_focus` | same localStorage key | PASS |
| 5 | Default / bad raw | `all` | `staffHomeFocusFromStorage` | PASS |
| 6 | UI control | Radio ListTiles in profile sheet | Radios on page (sheet = BUTTONS) | PASS |
| 7 | Gate helpers | `staffHomeShows*` | exported same rules | PASS |
| 8 | Persist on change | SharedPreferences setString | `writeStaffHomeFocus` | PASS |
| 9 | Profile Settings / Logout / navigate | Yes | **Deferred** | N/A (BUTTONS) |
| 10 | Tool/attention body gating | Yes | **Deferred** | N/A (BUTTONS/WIRE) |

**Smoke:** `npm run test:staff-home-fields`  
**Rollback:** Revert FIELDS commit; remove focus card; keep LAYOUT headers.  
**Next:** `/staff/home` BUTTONS — profile sheet, bell, Scan barcode CTA, tool/quick-action tiles.
