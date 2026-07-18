# Owner `/home/breakdown-more` — WIRE compare (Step 5)

**Branch:** `ops/dashboard-module`  
**Sources:** `home_breakdown_list_page.dart`; `homeDashboardDataProvider` / `homeShellReportsProvider`; `dashboard.md` §16

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Primary API `…/reports/home-overview` | Yes | `fetchHomeOverview` | PASS |
| 2 | `compact` + `shell_bundle` | Yes | Same query | PASS |
| 3 | Not `GET /dashboard` | Never | No UI call | PASS |
| 4 | Total INR + units line | `_totalHeader` | `formatRupee` + Flutter pack words | PASS |
| 5 | Category rows (amount>0, sort desc) | Yes | Bound from `categories` | PASS |
| 6 | Tile chrome (dot / title / amount / qty) | `_breakdownTile` | Display-only tiles | PASS |
| 7 | Non-category from `home_shell` + search filter | Yes | `shellRows` + match helper | PASS |
| 8 | Default period month dates | Shared home period | `homePeriodApiDates("month")` | PASS |
| 9 | Minimal loading copy | Spinner | Deferred → STATES spinner | N/A |
| 10 | Shell subcategories/suppliers/items data | Full when API fills | Backend often empty — UI wired | N/A |
| 11 | Cross-route period sync with `/home` | Riverpod shared | **Deferred** | N/A |
| 12 | Row tap → catalog/supplier | Yes | **Deferred** | N/A |
| 13 | FriendlyLoadError / empty HexaEmptyState | **Not on this Flutter page** | Confirmed N/A in STATES | N/A |

**Rollback:** Revert WIRE commit; restore BUTTONS-only page (placeholders, no fetch).

**Next:** `/home/breakdown-more` STATES PASS — see [`home_breakdown_states_compare.md`](home_breakdown_states_compare.md). Next COMPARE.
