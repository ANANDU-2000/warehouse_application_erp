# Catalog hub `/catalog` — BUTTONS compare (Step 4)

**Branch:** `ops/products-module`  
**Sources:** `catalog_page.dart` AppBar back/actions · FAB · card InkWell; `navigation_ext.popOrGo`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Catalog SCAFFOLD → LAYOUT → FIELDS → **BUTTONS** |
| 🟡 Current | Catalog hub BUTTONS PASS — ask before **WIRE** |
| ⬜ Pending | WIRE → STATES → COMPARE · other `/catalog/*` |
| ⏸ Deferred | rename/delete API · quick taxonomy sheet · suggestion chips · purchase entry · barcode/print body · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Back → pop or `/home` | `popOrGo('/home')` | `onBack` + `CATALOG_BACK_FALLBACK` | PASS |
| 2 | Quick categories → `/catalog/taxonomy` | `push` | `onQuickCategories` | PASS |
| 3 | Stock list → `/stock` | `go` | `onStockList` | PASS |
| 4 | Scan → `/barcode/scan` | `push` | `onScan` | PASS |
| 5 | FAB Add category | quick sheet | → `/catalog/new-category` stub (sheet deferred WIRE) | PASS* |
| 6 | Card tap → `/catalog/category/:id` | InkWell | sample card + `catalogCategoryPath` | PASS |
| 7 | Rename / Delete menu | PopupMenu + API | **Deferred** WIRE | N/A |
| 8 | item-categories / catalog-items fetch | Yes | **Deferred** WIRE | N/A |
| 9 | Barcode / stock / taxonomy page bodies | Full Flutter | stubs where not built | N/A |

\*FAB uses full-screen create route until quick taxonomy sheet is ported.

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-buttons
npm run build
```

## Rollback

Revert BUTTONS commit; restore FIELDS deferred AppBar/FAB; remove new-category/category stubs if unused; remove buttons script + this compare; boards → ask before BUTTONS.

## Next (ask first)

**WIRE** for `/catalog` — do not start until approved.
