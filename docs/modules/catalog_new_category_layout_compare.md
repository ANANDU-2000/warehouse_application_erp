# Catalog new category `/catalog/new-category` — LAYOUT compare (Step 2)

**Branch:** `ops/products-module`  
**Sources:** `catalog_add_category_page.dart` · `HexaColors` · KeyboardSafeFormViewport pad 16 · Outline radius 12 · footer gap 12 · Outlined Cancel + Filled Create · loss `#E53935`

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category SCAFFOLD→**LAYOUT** |
| 🟡 Current | `/catalog/new-category` **LAYOUT PASS** — ask before FIELDS |
| ⬜ Pending | FIELDS → COMPARE · new-subcategory · category detail · item routes |
| ⏸ Deferred | quick taxonomy sheet · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | brandBackground | `--add-cat-bg` | PASS |
| 2 | AppBar title brandPrimary w800 | AppBar | `.add-category-page__title` | PASS |
| 3 | Toolbar ~56 | Material AppBar | `--add-cat-toolbar: 56px` | PASS |
| 4 | Body pad 16 | KeyboardSafeFormViewport | body padding 16 | PASS |
| 5 | Name Outline radius 12 | `OutlineInputBorder` | `.add-category-page__field` | PASS |
| 6 | Input border `#E5E7EB` · hint `#9CA3AF` | HexaColors | tokens | PASS |
| 7 | Label muted · hint chrome | labelText / hintText | field-label / field-hint | PASS |
| 8 | Error loss `#E53935` chrome (hidden) | `HexaColors.loss` | `--add-cat-loss` | PASS |
| 9 | Footer gap 12 · equal Expanded | `SizedBox(width: 12)` | gap 12 · flex 1 | PASS |
| 10 | Cancel outlined · Create filled accent | Outlined / Filled | btn--cancel / btn--create | PASS |
| 11 | Controls inert | N/A | `pointer-events: none` | PASS |
| 12 | Staff allowed | yes | no `<Navigate` | PASS |
| 13 | Live input / handlers / API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-new-category-layout
npm run build
```

## Rollback

Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS — Name input + `Enter a name` client validation (no submit/API). Stop after LAYOUT.
