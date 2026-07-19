# Catalog hub `/catalog` — SCAFFOLD compare (Step 1)

**Branch:** `ops/products-module`  
**Sources:** `catalog_page.dart`; `categories.md` §2 Catalog hub; `app_router.dart` staff block; [`FRONTEND_PAGE_BUILD_LOOP.md`](../FRONTEND_PAGE_BUILD_LOOP.md)

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog SCAFFOLD · **LAYOUT** |
| 🟡 Current | superseded — see [`catalog_layout_compare.md`](catalog_layout_compare.md) |
| ⬜ Pending | FIELDS → COMPARE · other `/catalog/*` routes |
| ⏸ Deferred | rename/delete dialogs · FAB sheet · fuzzy search · trade-summary · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Route `/catalog` | `CatalogPage` | `features/catalog/CatalogPage` | PASS |
| 2 | AppBar title `Catalog` | exact | `CATALOG_TITLE` | PASS |
| 3 | Slot order: appBar → search → suggestions → grid/empty → fab | Flutter build | Same `data-slot` | PASS |
| 4 | AppBar action tooltips (Quick categories / Stock list / Scan barcode) | exact | copy + `data-deferred` | PASS |
| 5 | FAB label `Add category` | exact | `data-label` deferred | PASS |
| 6 | Search hint `Search categories (fuzzy)` | exact | `data-hint` deferred | PASS |
| 7 | Empty copy `No categories yet` + sub | exact | empty slot text | PASS |
| 8 | Staff blocked → `/staff/home` | `_staffRedirectForBlockedRoute` | `Navigate` when role staff | PASS |
| 9 | Back / action / FAB handlers | Yes | **Deferred** BUTTONS | N/A |
| 10 | Search field + fuzzy + API | Yes | **Deferred** FIELDS / WIRE | N/A |
| 11 | Rename/delete / category cards | Yes | **Deferred** | N/A |
| 12 | Purchase / barcode / receive bodies | — | **Backend blocked** | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-scaffold
npm run build
```

## Rollback

Revert SCAFFOLD commit; remove `features/catalog/*` + `scripts/check-catalog-scaffold.mjs` + package script; restore no `/catalog` route (or stub); boards → Categories Slice 2 current.

**Next (ask first):** LAYOUT — done → [`catalog_layout_compare.md`](catalog_layout_compare.md). Ask before FIELDS.
