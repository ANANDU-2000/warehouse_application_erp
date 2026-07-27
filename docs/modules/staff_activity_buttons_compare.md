# Staff activity `/staff/activity` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `staff_activity_page.dart` — AppBar `popOrGo('/staff/home')`; `ListTile` **without** `onTap`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Staff low-stock COMPARE · Staff activity SCAFFOLD → **BUTTONS** |
| 🟡 Current | superseded — see [`staff_activity_wire_compare.md`](staff_activity_wire_compare.md) |
| ⬜ Pending | STATES → COMPARE · other Subagent 4 stubs |
| ⏸ Deferred | ListSkeleton / HexaErrorCard · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back → pop or `/staff/home` | `popOrGo` | `onBack` + `data-action="back"` | PASS |
| 2 | Period chips still selectable | SegmentedButton | `select-period` (FIELDS) | PASS |
| 3 | List rows not tappable | ListTile no `onTap` | `data-interactive="false"` | PASS |
| 4 | No Inform / Receive / export CTAs | none on page | none | PASS |
| 5 | Activity list filled from API | Yes | **Deferred** WIRE | N/A |
| 6 | Retry on error | HexaErrorCard | **Deferred** STATES | N/A |

**Smoke:** `npm run test:staff-activity-buttons` (+ scaffold→fields PASS); `npm run build` PASS.

**Rollback:** Revert BUTTONS commit; restore FIELDS page without `onBack` / interactive markers; remove buttons script + this compare; boards → ask before BUTTONS.

**Next (ask first):** WIRE — do not start until approved.
