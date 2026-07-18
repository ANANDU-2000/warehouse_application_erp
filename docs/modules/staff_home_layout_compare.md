# Staff `/staff/home` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_home_page.dart` greeting + `StaffHomeSectionHeader` strings; HexaColors / DesktopPageShell max 560

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Max width 560 | `DesktopPageShell` | `.staff-home-inner` | PASS |
| 2 | Brand bg / primary | `#F7F9F6` / `#0E4F46` | CSS vars | PASS |
| 3 | Greeting fallback name / avatar | `Staff` / `S` | `staffHomeCopy.ts` | PASS |
| 4 | Role span | ` · STAFF · ` | exact constant | PASS |
| 5 | Date format | `EEE d MMM` | `en-GB` short weekday + day + short month | PASS |
| 6 | Bell | notifications icon (wired) | inert disabled chrome | PASS (navigate = BUTTONS) |
| 7 | Section titles/subtitles | e.g. `Warehouse & purchases` / `Stock in hand and this month` | `STAFF_HOME_SECTION` exact | PASS |
| 8 | Remaining slots (floor-kpis / scan / attention / activity) | KPI row / Scan bar / tiles / feed | Card chrome + title/header only (no body) | PASS |
| 9 | Slot order + `data-slot` | body order | unchanged from SCAFFOLD | PASS |
| 10 | Focus chips / tile bodies / API / Scan barcode CTA | Yes | **Deferred** | N/A (FIELDS/BUTTONS+) |
| 11 | Needs-attention visibility | Conditional on counts | Header always for LAYOUT shell | N/A (WIRE) |

**Smoke:** `npm run test:staff-home-layout` (+ scaffold still PASS)  
**Rollback:** Revert LAYOUT commit; restore SCAFFOLD empty slots.  
**Next:** `/staff/home` FIELDS — `StaffHomeFocus` chips (exact labels).
