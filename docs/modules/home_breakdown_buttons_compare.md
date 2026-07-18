# Owner `/home/breakdown-more` — BUTTONS compare (Step 4)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_breakdown_list_page.dart` AppBar leading; `navigation_ext.dart` `popOrGo`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back CTA present | `IconButton` leading | `<button aria-label="Back">` | PASS |
| 2 | Back → leave screen | `popOrGo('/home')` | `popOrGo(navigate, "/home")` | PASS |
| 3 | Pop when history allows | `canPop` then pop | `history.state.idx > 0` → `navigate(-1)` | PASS |
| 4 | Else go `/home` | `context.go('/home')` | `navigate("/home", { replace: true })` | PASS |
| 5 | Search FIELDS unchanged | Yes | Unchanged | PASS |
| 6 | Rows / dashboard APIs | Yes | **Deferred WIRE** | N/A |

**Rollback:** Revert BUTTONS commit; restore inert back `<span>` (LAYOUT/FIELDS).

**Next:** `/home/breakdown-more` WIRE — dashboard / shell report APIs for Total + ranked rows.
