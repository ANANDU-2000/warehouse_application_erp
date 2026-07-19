# Catalog hub `/catalog` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-19)  
**Branch:** `ops/products-module`  
**Route scope:** Owner catalog hub `/catalog` only — not taxonomy hub, not item create/edit, not purchase entry, not barcode/print body  
**Sources:** `catalog_page.dart` · `catalog_providers.dart` · `catalog_fuzzy.dart` · `catalog_taxonomy_utils.dart` · `app_router.dart` staff block · slice compares below

**Verdict:** **PASS** for in-scope catalog hub page loop (SCAFFOLD→STATES). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub **SCAFFOLD→COMPARE** |
| 🟡 Current | Catalog hub **COMPARE PASS** — ask before next `/catalog/*` (taxonomy SCAFFOLD) |
| ⬜ Pending | `/catalog/taxonomy` · `/catalog/new-category` · category detail · item routes · trade-summary |
| ⏸ Deferred | purchase entry · barcode/print · receive **bodies** · Settings · pull gesture · keepAlive 3m · merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + staff gate + slots | `CatalogPage` · staff blocked | `/catalog` + Navigate staff | PASS | [`catalog_scaffold_compare.md`](catalog_scaffold_compare.md) |
| 2 | LAYOUT Hexa chrome | brand tokens · card 14 · FAB | CSS `--cat-*` | PASS | [`catalog_layout_compare.md`](catalog_layout_compare.md) |
| 3 | FIELDS search 150ms + empty catalogs | TextField debounce | `CATALOG_SEARCH_DEBOUNCE_MS` | PASS | [`catalog_fields_compare.md`](catalog_fields_compare.md) |
| 4 | BUTTONS local nav | back/taxonomy/stock/scan/FAB/card | `data-action` handlers | PASS | [`catalog_buttons_compare.md`](catalog_buttons_compare.md) |
| 5 | WIRE lists + fuzzy + rename/delete | providers + hexa_api | `catalogApi` + `catalogFuzzy` | PASS | [`catalog_wire_compare.md`](catalog_wire_compare.md) |
| 6 | WIRE meta counts | subcategories · items | `catalogCategoryMeta` | PASS | wire compare |
| 7 | STATES ListSkeleton 6 × 84 | default ListSkeleton | `CATALOG_SKELETON_*` | PASS | [`catalog_states_compare.md`](catalog_states_compare.md) |
| 8 | STATES FriendlyLoadError | Unable to load data / Tap to retry. | `mapCatalogLoad*` | PASS | states compare |

**Overall (in-scope `/catalog`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| `/catalog/taxonomy` · `/catalog/new-category` · category detail bodies | Next page-loop routes (stubs OK) |
| Quick taxonomy sheet (FAB sheet) | FAB uses `/catalog/new-category` stub until sheet port |
| Pull RefreshIndicator gesture | Retry covers; gesture polish deferred |
| Provider keepAlive 3m/5m | Page remount refetch OK |
| Purchase entry `/purchase` · `/purchase/new` | Backend blocked (docs/06 Seq 7) |
| Barcode scan / bulk print **bodies** | Backend blocked (docs/06 Seq 11); nav stubs OK |
| `/staff/receive` **bodies** | Backend blocked (docs/06 Seq 8) |
| `/staff/settings` · `/settings` | Settings **implement locked** |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:catalog-compare
# runs scaffold → layout → fields → buttons → wire → states (+ compare doc)
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. **`/catalog/taxonomy` SCAFFOLD** (page loop step 1 — ask first), **or**  
2. Hold — purchase / barcode / receive need backends (docs/06 Seq 7–8 / 11), **or**  
3. Hold / merge review of `ops/products-module` → `main`.

**Do not merge to `main` unless asked. Do not invent purchase/barcode UI.**
