# Catalog taxonomy hub `/catalog/taxonomy` — LAYOUT compare (Step 2)

**Branch:** `ops/products-module`  
**Sources:** `catalog_taxonomy_hub_page.dart` · `HexaOp.pageGutter` 16 · `HexaColors` · ActionChip / Outline search radius 12 · ListTile w800 · FAB circular 56 · empty icon 48

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy SCAFFOLD→LAYOUT→**FIELDS** |
| 🟡 Current | superseded — see [`catalog_taxonomy_fields_compare.md`](catalog_taxonomy_fields_compare.md) |
| ⬜ Pending | BUTTONS → COMPARE · `/catalog/new-category` · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | Scaffold / brandBackground | `--tax-bg` | PASS |
| 2 | AppBar title brandPrimary `#0E4F46` w800 | AppBar | `.taxonomy-hub-page__title` | PASS |
| 3 | Toolbar ~56 | Material AppBar | `--tax-toolbar: 56px` | PASS |
| 4 | Gutter 16 | `HexaOp.pageGutter` | `--tax-gutter: 16px` | PASS |
| 5 | Explainer 13 muted | `fontSize: 13` · onSurfaceVariant | `.taxonomy-hub-page__explainer` | PASS |
| 6 | ActionChips spacing 8 | `Wrap spacing/runSpacing 8` | chips gap 8 | PASS |
| 7 | Search Outline radius 12 | `OutlineInputBorder` | `.taxonomy-hub-page__search` | PASS |
| 8 | Input border `#E5E7EB` · hint `#9CA3AF` | HexaColors | tokens | PASS |
| 9 | Row avatar primaryMid @20% | `primaryContainer` CircleAvatar | `rgba(21,154,138,0.2)` | PASS |
| 10 | Name w800 · 16px | ListTile title | `.taxonomy-hub-page__row-name` | PASS |
| 11 | Meta 12 muted | subtitle `fontSize: 12` | `.taxonomy-hub-page__row-meta` | PASS |
| 12 | Divider / row border | `Divider(height: 1)` | row border-bottom | PASS |
| 13 | Empty icon 48 · title w800 | HexaEmptyState | empty chrome | PASS |
| 14 | FAB circular 56 accent | `FloatingActionButton` | `.taxonomy-hub-page__fab` | PASS |
| 15 | brandAccent `#159A8A` | primary / FAB | `--tax-accent` | PASS |
| 16 | Controls inert | N/A | `pointer-events: none` | PASS |
| 17 | Staff allowed · owner Full catalog chrome | `!isStaff` action | no Navigate · owner-only | PASS |
| 18 | Search input / handlers / API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-taxonomy-layout
npm run build
```

## Rollback

Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS — done → [`catalog_taxonomy_fields_compare.md`](catalog_taxonomy_fields_compare.md). Ask before BUTTONS.
