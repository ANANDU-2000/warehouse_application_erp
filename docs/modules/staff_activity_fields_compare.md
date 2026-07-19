# Staff activity `/staff/activity` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_activity_page.dart` — `SegmentedButton.onSelectionChanged` → `_staffActivityPeriodProvider`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff low-stock COMPARE · Staff activity SCAFFOLD → **FIELDS** |
| 🟡 Current | `/staff/activity` **FIELDS PASS** — ask before BUTTONS |
| ⬜ Pending | BUTTONS → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | listActivityLog API · ListSkeleton / HexaErrorCard · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Period state `today` default | StateProvider `'today'` | `useState(STAFF_ACT_DEFAULT_PERIOD)` | PASS |
| 2 | Segments Today · Week · Month selectable | `onSelectionChanged` | `setPeriod` + `data-action="select-period"` | PASS |
| 3 | Selected chip visual | SegmentedButton selected | `staff-act-period--selected` | PASS |
| 4 | Periods active (not inert) | interactive | `--active` · cursor pointer | PASS |
| 5 | Page reflects period | provider watch | `data-period={period}` | PASS |
| 6 | Empty still shown (no API yet) | after load | empty until WIRE | PASS |
| 7 | `listActivityLog` refetch on period | provider invalidate | **Deferred** WIRE | N/A |
| 8 | ListSkeleton / HexaErrorCard | Yes | **Deferred** STATES | N/A |

**Smoke:** `npm run test:staff-activity-fields` (+ scaffold→layout PASS); `npm run build` PASS.

**Rollback:** Revert FIELDS commit; restore LAYOUT fixed period + inert chips; remove fields script + this compare; boards → ask before FIELDS.

**Next (ask first):** BUTTONS — do not start until approved.
