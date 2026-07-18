# Owner `/home/breakdown-more` — FIELDS compare (Step 3)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_breakdown_list_page.dart` TextField + `_breakdownRowMatchesQuery` + `_breakdownSearchActive`

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search input (non-category) | TextField | `<input type="search">` | PASS |
| 2 | Hint `Search title or quantity…` | Exact | `HOME_BREAKDOWN_SEARCH_HINT` | PASS |
| 3 | Clear when text non-empty | suffixIcon clear | Clear button | PASS |
| 4 | Hidden on category tab | `showBreakdownSearch: false` | Same | PASS |
| 5 | Match helper title/qtyLine | `_breakdownRowMatchesQuery` | `breakdownRowMatchesQuery` | PASS |
| 6 | Search active collapses Total | `CollapsibleSearchChrome` | `hidden={searchActive}` | PASS |
| 7 | Client query state only | Controller | `useState` | PASS |
| 8 | Back navigate / rows / API | Yes | **Deferred** | N/A |

**Rollback:** Revert FIELDS commit; restore LAYOUT static search hint (no input).

**Next:** `/home/breakdown-more` BUTTONS PASS — see [`home_breakdown_buttons_compare.md`](home_breakdown_buttons_compare.md). Next WIRE.
