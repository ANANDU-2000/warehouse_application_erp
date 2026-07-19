/**
 * Catalog hub /catalog SCAFFOLD smoke.
 * Run: node scripts/check-catalog-scaffold.mjs
 * Source: catalog_page.dart; categories.md §2 Catalog hub
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/catalog/catalogCopy.ts");
const pagePath = join(root, "src/features/catalog/CatalogPage.tsx");
const cssPath = join(root, "src/features/catalog/CatalogPage.css");
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

assert(copy.includes('CATALOG_TITLE = "Catalog"'), "title");
assert(copy.includes('CATALOG_BACK_FALLBACK = "/home"'), "back /home");
assert(copy.includes('CATALOG_STAFF_REDIRECT = "/staff/home"'), "staff redirect");
assert(
  copy.includes('CATALOG_TOOLTIP_QUICK_CATEGORIES = "Quick categories"'),
  "quick tip",
);
assert(copy.includes('CATALOG_TOOLTIP_STOCK_LIST = "Stock list"'), "stock tip");
assert(copy.includes('CATALOG_TOOLTIP_SCAN = "Scan barcode"'), "scan tip");
assert(copy.includes('CATALOG_FAB_LABEL = "Add category"'), "fab label");
assert(
  copy.includes('CATALOG_SEARCH_HINT = "Search categories (fuzzy)"'),
  "search hint",
);
assert(copy.includes('CATALOG_EMPTY_TITLE = "No categories yet"'), "empty title");
assert(
  copy.includes(
    "Add a category, then subcategories and items — all from this catalog.",
  ),
  "empty sub",
);

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
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="suggestions"'), "suggestions");
assert(page.includes('data-slot="categoryGrid"'), "grid");
assert(page.includes('data-slot="empty"') || page.includes('data-slot="loading"'), "empty or WIRE loading");
assert(page.includes('data-slot="fab"'), "fab");
assert(page.includes('data-deferred="back"') || page.includes('data-action="back"'), "back deferred or BUTTONS");
assert(page.includes('data-deferred="quick-categories"') || page.includes('data-action="quick-categories"'), "quick deferred or BUTTONS");
assert(page.includes('data-deferred="stock-list"') || page.includes('data-action="stock-list"'), "stock deferred or BUTTONS");
assert(page.includes('data-deferred="scan-barcode"') || page.includes('data-action="scan-barcode"'), "scan deferred or BUTTONS");
assert(
  page.includes('data-deferred="search-field"') ||
    page.includes('data-testid="catalog-search"'),
  "search deferred or FIELDS input",
);
assert(
  page.includes('data-deferred="add-category"') ||
    page.includes('data-action="add-category"'),
  "fab deferred or BUTTONS",
);
assert(page.includes("Navigate"), "staff Navigate");
assert(page.includes("CATALOG_STAFF_REDIRECT"), "staff gate");
assert(page.includes('role === "staff"'), "staff role check");
assert(!page.includes("fetch(") || page.includes("listItemCategories"), "no raw fetch unless WIRE");
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

assert(css.includes("catalog-page"), "page css");
assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "scaffold bg");

assert(router.includes("CatalogPage"), "router import");
assert(router.includes('path="/catalog"'), "route");
assert(!router.includes('title="Catalog"'), "no stub Catalog title");

assert(pkg.includes("test:catalog-scaffold"), "package script");

if (failures.length) {
  console.error("Catalog SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog SCAFFOLD checks PASS");
