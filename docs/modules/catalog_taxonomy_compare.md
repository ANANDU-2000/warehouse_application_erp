# Catalog taxonomy hub `/catalog/taxonomy` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-25)  
**Branch:** `ops/products-module`  
**Route scope:** Taxonomy hub `/catalog/taxonomy` only — not `/catalog` hub, not new-category body, not category detail, not purchase/barcode  
**Sources:** `catalog_taxonomy_hub_page.dart` · `catalog_providers.dart` · `app_router.dart` staff allowed · slice compares below

**Verdict:** **PASS** for in-scope taxonomy hub page loop (SCAFFOLD→STATES). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy **SCAFFOLD→COMPARE** |
| 🟡 Current | Taxonomy hub **COMPARE PASS** — ask before `/catalog/new-category` SCAFFOLD |
| ⬜ Pending | `/catalog/new-category` · category detail · item routes · trade-summary |
| ⏸ Deferred | purchase entry · barcode/print · receive **bodies** · Settings · pull gesture · quick sheet · merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + staff allowed + slots | `CatalogTaxonomyHubPage` | `/catalog/taxonomy` shell | PASS | [`catalog_taxonomy_scaffold_compare.md`](catalog_taxonomy_scaffold_compare.md) |
| 2 | LAYOUT Hexa chrome | ActionChip / Outline / FAB | CSS `--tax-*` | PASS | [`catalog_taxonomy_layout_compare.md`](catalog_taxonomy_layout_compare.md) |
| 3 | FIELDS contains search + empty | listener (no debounce) | `taxonomyFilterCategories` | PASS | [`catalog_taxonomy_fields_compare.md`](catalog_taxonomy_fields_compare.md) |
| 4 | BUTTONS local nav | back/catalog/chips/FAB/row | `data-action` + stubs | PASS | [`catalog_taxonomy_buttons_compare.md`](catalog_taxonomy_buttons_compare.md) |
| 5 | WIRE lists + sub counts | providers | `listItemCategories` + types-index | PASS | [`catalog_taxonomy_wire_compare.md`](catalog_taxonomy_wire_compare.md) |
| 6 | STATES ListSkeleton 6 × 84 | default ListSkeleton | `TAXONOMY_SKELETON_*` | PASS | [`catalog_taxonomy_states_compare.md`](catalog_taxonomy_states_compare.md) |
| 7 | STATES FriendlyLoadError | Unable to load data / Tap to retry. | `mapTaxonomyLoad*` | PASS | states compare |

**Overall (in-scope `/catalog/taxonomy`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| Quick taxonomy sheet create API | Chips/FAB → `/catalog/new-category` / new-sub stubs |
| `/catalog/new-category` · category detail bodies | Next page-loop routes (stubs OK) |
| Pull RefreshIndicator gesture | Retry covers; gesture polish deferred |
| Purchase entry `/purchase` · `/purchase/new` | Backend blocked (docs/06 Seq 7) |
| Barcode scan / bulk print **bodies** | Backend blocked (docs/06 Seq 11) |
| `/staff/receive` **bodies** | Backend blocked (docs/06 Seq 8) |
| `/staff/settings` · `/settings` | Settings **implement locked** |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:catalog-taxonomy-compare
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. **`/catalog/new-category` SCAFFOLD** (page loop step 1 — ask first), **or**  
2. Hold — purchase / barcode / receive need backends (docs/06 Seq 7–8 / 11), **or**  
3. Hold / merge review of `ops/products-module` → `main`.

**Do not merge to `main` unless asked. Do not invent purchase/barcode UI.**
