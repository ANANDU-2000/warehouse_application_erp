# Owner `/home/activity` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_warehouse_activity_page.dart` AppBar leading; `navigation_ext.dart` `popOrGo`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back CTA present | `IconButton` leading | `<button aria-label="Back">` | PASS |
| 2 | Back → leave screen | `popOrGo('/home')` | `popOrGo(navigate, "/home")` | PASS |
| 3 | Pop when history allows | `canPop` then pop | `history.state.idx > 0` → `navigate(-1)` | PASS |
| 4 | Else go `/home` | `context.go('/home')` | `navigate("/home", { replace: true })` | PASS |
| 5 | Period chips remain interactive | FIELDS | Unchanged | PASS |
| 6 | Feed rows / refresh / API | Yes | **Deferred WIRE** | N/A |

**Rollback:** Revert BUTTONS commit; restore inert back `<span>` (LAYOUT/FIELDS).

**Next:** `/home/activity` WIRE PASS — see [`home_activity_wire_compare.md`](home_activity_wire_compare.md). Next STATES.
