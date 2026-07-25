# Catalog new category `/catalog/new-category` — COMPARE (Step 7)

**Status:** In-scope **PASS** (2026-07-25)  
**Branch:** `ops/products-module`  
**Route scope:** New category form `/catalog/new-category` only — not taxonomy hub body, not new-subcategory, not category detail, not purchase/barcode  
**Sources:** `catalog_add_category_page.dart` · `catalog_fuzzy.dart` · `form_feedback.dart` · Categories Slice 1 POST · slice compares below

**Verdict:** **PASS** for in-scope new-category page loop (SCAFFOLD→STATES). Known deferrals listed as N/A (not FAIL).

---

## Task board

| State | Step |
|---|---|
| ✅ Completed | Products Slice 1–7 · Categories Slice 1–2 · Catalog hub COMPARE · taxonomy COMPARE · new-category **SCAFFOLD→COMPARE** · new-subcategory SCAFFOLD→LAYOUT→**FIELDS** |
| 🟡 Current | Ask before new-subcategory BUTTONS — [`catalog_new_subcategory_fields_compare.md`](catalog_new_subcategory_fields_compare.md) |
| ⬜ Pending | new-subcategory BUTTONS→COMPARE · category detail · item routes · trade-summary |
| ⏸ Deferred | purchase entry · barcode/print · receive **bodies** · Settings · merge to `main` |

---

## 1. Master PASS/FAIL (in scope)

| # | Area | Legacy | New | Status | Evidence |
|---|---|---|---|---|---|
| 1 | SCAFFOLD route + staff allowed + slots | `CatalogAddCategoryPage` | `/catalog/new-category` shell | PASS | [`catalog_new_category_scaffold_compare.md`](catalog_new_category_scaffold_compare.md) |
| 2 | LAYOUT Hexa chrome | Outline name + Cancel/Create | CSS + slots | PASS | [`catalog_new_category_layout_compare.md`](catalog_new_category_layout_compare.md) |
| 3 | FIELDS name + `Enter a name` | blur/touch | `addCategoryNameError` | PASS | [`catalog_new_category_fields_compare.md`](catalog_new_category_fields_compare.md) |
| 4 | BUTTONS close/cancel/create | pop + touch | `data-action` + popOrGo | PASS | [`catalog_new_category_buttons_compare.md`](catalog_new_category_buttons_compare.md) |
| 5 | WIRE POST + similar fuzzy 86/4 | create + dialog | `createItemCategory` + fuzzy | PASS | [`catalog_new_category_wire_compare.md`](catalog_new_category_wire_compare.md) |
| 6 | STATES saving + retryable error | PopScope + Retry snack | spinner + `mapAddCategoryError` | PASS | [`catalog_new_category_states_compare.md`](catalog_new_category_states_compare.md) |

**Overall (in-scope `/catalog/new-category`):** **PASS**

---

## 2. Known deferrals (N/A — not FAIL)

| Item | Why deferred |
|---|---|
| `/catalog/category/:id/new-subcategory` body | Next route in docs/06 after this COMPARE |
| Category detail / item routes | Separate page loops |
| Purchase entry `/purchase` · `/purchase/new` | Backend blocked (docs/06 Seq 7) |
| Barcode scan / bulk print **bodies** | Backend blocked (docs/06 Seq 11) |
| `/staff/receive` **bodies** | Backend blocked (docs/06 Seq 8) |
| Owner `/stock` family | Deferred on task board |
| `/staff/settings` · `/settings` | Settings **implement locked** |

---

## 3. Smoke tests (automation)

```bash
cd new-app/frontend
npm run test:catalog-new-category-compare
npm run build
```

---

## 4. Rollback

Docs/checklist + smoke script only: revert COMPARE commit. Application code unchanged by this step (unless a smoke FAIL forced a fix).

---

## 5. Next after Approve

1. **`/catalog/category/:categoryId/new-subcategory` BUTTONS** (page loop step 4 — ask first), **or**  
2. Hold — purchase / barcode / receive need backends (docs/06 Seq 7–8 / 11), **or**  
3. Hold / merge review of `ops/products-module` → `main`.

**Do not merge to `main` unless asked. Do not invent purchase/barcode UI.**
