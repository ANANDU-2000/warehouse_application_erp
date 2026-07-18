# Owner `/home/breakdown-more` — LAYOUT compare (Step 2)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_breakdown_list_page.dart` AppBar + `_totalHeader` + search `InputDecoration`; `hexa_colors.dart`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | `brandBackground` | CSS | PASS |
| 2 | AppBar title w800 `All — {label}` | Yes | Title + tab query | PASS |
| 3 | Back chevron chrome | `Icons.arrow_back_rounded` | SVG inert (no navigate) | PASS |
| 4 | Body pad `16/8/16/96` | ListView padding | CSS | PASS |
| 5 | Total card white + `#E2E8E6` r8 | `_totalHeader` | Exact | PASS |
| 6 | `Total:` 12px `#5C6578` w700 | Exact | `HOME_BREAKDOWN_TOTAL_LABEL` | PASS |
| 7 | Amount/units placeholders | Bound values | `—` until WIRE | PASS |
| 8 | Search hint chrome (non-category) | hintText | Static hint; hidden on category | PASS |
| 9 | Search r12 white + brandBorder | Yes | CSS | PASS |
| 10 | Interactive search / back nav / rows / API | Yes | **Deferred** | N/A |

**Rollback:** Revert LAYOUT commit; restore SCAFFOLD empty slots only.

**Next:** `/home/breakdown-more` FIELDS — interactive search input + client filter state (no API).
