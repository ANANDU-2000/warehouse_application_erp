# Catalog hub `/catalog` — LAYOUT compare (Step 2)

**Branch:** `ops/products-module`  
**Sources:** `catalog_page.dart` · `HexaColors` · DesktopPageShell max 900 · search Outline radius 12 · grid `fromLTRB(16,8,16,100)` · card radius 14 / pad 12 · avatar `primaryMid`@20%

## Task board

| State | Step |
|---|---|
| ✅ Completed | Catalog SCAFFOLD → LAYOUT · **FIELDS** |
| 🟡 Current | superseded — see [`catalog_fields_compare.md`](catalog_fields_compare.md) |
| ⬜ Pending | BUTTONS → COMPARE · other `/catalog/*` |
| ⏸ Deferred | rename/delete · FAB sheet · API · purchase entry · barcode/print · receive · Settings · merge to `main` |

## Legacy vs New

| # | Check | Legacy | New | Status |
|---|---|---|---|---|
| 1 | Page bg `#F7F9F6` | brandBackground | `--cat-bg` | PASS |
| 2 | AppBar title brandPrimary `#0E4F46` w800 | AppBar | `.catalog-page__title` | PASS |
| 3 | Toolbar ~56 | Material AppBar | `--cat-toolbar: 56px` | PASS |
| 4 | Shell max 900 | DesktopPageShell | `--cat-shell-max: 900px` | PASS |
| 5 | Body pad 8 / 16 / 100 | Column + grid bottom 100 | shell padding | PASS |
| 6 | Search Outline radius 12 | InputDecoration | `.catalog-page__search` | PASS |
| 7 | Input border `#E5E7EB` · hint `#9CA3AF` | HexaColors | tokens | PASS |
| 8 | Card radius 14 · pad 12 · border | Card shape | `.catalog-page__card` | PASS |
| 9 | Avatar primaryMid @20% | CircleAvatar | `rgba(21,154,138,0.2)` | PASS |
| 10 | Name w800 · 16px | TextStyle | `.catalog-page__card-name` | PASS |
| 11 | Meta muted · 4px gap | bodySmall | `.catalog-page__card-meta` | PASS |
| 12 | Empty icon 48 · title w800 | folder_outlined | empty chrome | PASS |
| 13 | FAB extended accent | FloatingActionButton.extended | `.catalog-page__fab` | PASS |
| 14 | brandAccent `#159A8A` | primaryMid | `--cat-accent` | PASS |
| 15 | Controls inert | N/A | `pointer-events: none` | PASS |
| 16 | Staff gate | blocked | `Navigate` `/staff/home` | PASS |
| 17 | Search input / handlers / API | Yes | **Deferred** FIELDS/BUTTONS/WIRE | N/A |

## Smoke

```bash
cd new-app/frontend
npm run test:catalog-layout
npm run build
```

## Rollback

Revert LAYOUT commit; restore SCAFFOLD page/CSS; remove layout script + this compare; boards → ask before LAYOUT.

**Next (ask first):** FIELDS — done → [`catalog_fields_compare.md`](catalog_fields_compare.md). Ask before BUTTONS.
