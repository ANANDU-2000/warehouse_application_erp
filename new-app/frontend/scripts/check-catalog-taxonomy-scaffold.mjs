/**
 * Catalog taxonomy hub /catalog/taxonomy SCAFFOLD smoke.
 * Run: node scripts/check-catalog-taxonomy-scaffold.mjs
 * Source: catalog_taxonomy_hub_page.dart; categories.md § Taxonomy hub
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/catalog/catalogTaxonomyCopy.ts");
const pagePath = join(root, "src/features/catalog/CatalogTaxonomyHubPage.tsx");
const cssPath = join(root, "src/features/catalog/CatalogTaxonomyHubPage.css");
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('TAXONOMY_TITLE = "Categories"'), "title Categories");
assert(
  copy.includes('TAXONOMY_BACK_FALLBACK_OWNER = "/home"'),
  "owner back /home",
);
assert(
  copy.includes('TAXONOMY_BACK_FALLBACK_STAFF = "/staff/home"'),
  "staff back /staff/home",
);
assert(
  copy.includes('TAXONOMY_TOOLTIP_FULL_CATALOG = "Full catalog"'),
  "full catalog tip",
);
assert(
  copy.includes(
    "Categories group your items. Subcategories are the type under each category (e.g. Rice → Biriyani rice).",
  ),
  "explainer",
);
assert(copy.includes('TAXONOMY_CHIP_CATEGORY = "Category"'), "chip Category");
assert(
  copy.includes('TAXONOMY_CHIP_SUBCATEGORY = "Subcategory"'),
  "chip Subcategory",
);
assert(copy.includes('TAXONOMY_SEARCH_HINT = "Search categories"'), "search hint");
assert(copy.includes('TAXONOMY_EMPTY_TITLE = "No categories yet"'), "empty title");
assert(copy.includes('TAXONOMY_NO_MATCHES_TITLE = "No matches"'), "no matches");
assert(
  copy.includes('TAXONOMY_EMPTY_SUB = "Tap Category to add your first one."'),
  "empty sub",
);
assert(copy.includes('TAXONOMY_EMPTY_PRIMARY = "Add category"'), "empty primary");
assert(
  copy.includes(
    'TAXONOMY_ROW_NO_SUBS =\n  "No subcategories · General created automatically"',
  ) ||
    copy.includes(
      'TAXONOMY_ROW_NO_SUBS = "No subcategories · General created automatically"',
    ),
  "row no-subs subtitle",
);
assert(
  copy.includes('TAXONOMY_FAB_TOOLTIP = "Quick add category"'),
  "fab tooltip",
);
assert(
  copy.includes('TAXONOMY_ROW_ADD_SUB_TOOLTIP = "Add subcategory"'),
  "row add-sub tip",
);
assert(copy.includes('TAXONOMY_PATH_CATALOG = "/catalog"'), "path catalog");

assert(
  page.includes("SCAFFOLD") ||
    page.includes("LAYOUT") ||
    page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    page.includes("COMPARE"),
  "SCAFFOLD…STATES header",
);
assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="explainer"'), "explainer slot");
assert(page.includes('data-slot="chips"'), "chips");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="categoryList"'), "categoryList");
assert(page.includes('data-slot="empty"'), "empty");
assert(page.includes('data-slot="fab"'), "fab");
assert(page.includes('data-deferred="back"'), "back deferred");
assert(page.includes('data-deferred="full-catalog"'), "full-catalog deferred");
assert(page.includes('data-role="owner-only"'), "owner-only full catalog");
assert(page.includes('data-deferred="chip-category"'), "chip category deferred");
assert(
  page.includes('data-deferred="chip-subcategory"'),
  "chip subcategory deferred",
);
assert(
  page.includes('data-deferred="search-field"') ||
    page.includes('data-testid="taxonomy-search"'),
  "search deferred or FIELDS input",
);
assert(page.includes('data-deferred="quick-add"'), "fab deferred");
assert(page.includes("isStaff"), "staff role awareness");
assert(
  page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    (!page.includes("onClick") && !page.includes("<input")),
  "no click/input until FIELDS+",
);
assert(
  page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    !page.includes("<button"),
  "no button until FIELDS+",
);

assert(css.includes("taxonomy-hub-page"), "page css");
assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "scaffold bg");

assert(router.includes("CatalogTaxonomyHubPage"), "router import");
assert(router.includes('path="/catalog/taxonomy"'), "route");
assert(
  !router.includes('title="Categories"') ||
    router.includes("CatalogTaxonomyHubPage"),
  "taxonomy uses page not stub",
);
assert(
  /path="\/catalog\/taxonomy"\s+element=\{<CatalogTaxonomyHubPage/.test(
    router.replace(/\s+/g, " "),
  ) || router.includes("element={<CatalogTaxonomyHubPage />}"),
  "taxonomy element CatalogTaxonomyHubPage",
);

assert(pkg.includes("test:catalog-taxonomy-scaffold"), "package script");

if (failures.length) {
  console.error("Catalog taxonomy SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog taxonomy SCAFFOLD checks PASS");
