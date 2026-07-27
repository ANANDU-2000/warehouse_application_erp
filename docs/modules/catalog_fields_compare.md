# Catalog hub `/catalog` — FIELDS compare (Step 3)

**Branch:** `ops/products-module`  
**Sources:** `catalog_page.dart` `_searchDebounce` 150ms · clear suffix · empty `No categories yet` / `No matches`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Catalog SCAFFOLD → LAYOUT → FIELDS · **BUTTONS** |
| 🟡 Current | superseded — see [`catalog_buttons_compare.md`](catalog_buttons_compare.md) |
| ⬜ Pending | WIRE → COMPARE · other `/catalog/*` |
| ⏸ Deferred | rename/delete API · quick sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Search editable | TextField | `<input>` + `searchDraft` | PASS |
| 2 | Debounce 150ms → query | Timer 150 | `CATALOG_SEARCH_DEBOUNCE_MS` | PASS |
| 3 | Clear suffix when nonempty | IconButton close | clear btn | PASS |
| 4 | Hint `Search categories (fuzzy)` | exact | placeholder | PASS |
| 5 | Empty catalog title/sub | `No categories yet` + sub | `catalogEmptyTitle/Sub` | PASS |
| 6 | Search no-match title/sub | `No matches` + sub | same when query nonempty + empty list | PASS |
| 7 | Suggestion chips | fuzzy ActionChips | **Deferred** WIRE (needs categories API) | N/A |
| 8 | AppBar / FAB / card tap / rename | Yes | **Deferred** BUTTONS | N/A |
| 9 | item-categories / catalog-items API | Yes | **Deferred** WIRE | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-fields
npm run build
```

## Rollback

Revert FIELDS commit; restore LAYOUT inert search; remove `catalogFields.ts` + fields script + this compare; boards → ask before FIELDS.

**Next (ask first):** BUTTONS — done → [`catalog_buttons_compare.md`](catalog_buttons_compare.md). Ask before WIRE.
