/**
 * Catalog hub /catalog BUTTONS smoke.
 * Run: node scripts/check-catalog-buttons.mjs
 * Source: catalog_page.dart back · taxonomy · stock · scan · FAB · card tap
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

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

assert(copy.includes('CATALOG_BACK_FALLBACK = "/home"'), "back fallback");
assert(copy.includes('CATALOG_PATH_TAXONOMY = "/catalog/taxonomy"'), "taxonomy");
assert(copy.includes('CATALOG_PATH_STOCK = "/stock"'), "stock");
assert(copy.includes('CATALOG_PATH_SCAN = "/barcode/scan"'), "scan");
assert(
  copy.includes('CATALOG_PATH_NEW_CATEGORY = "/catalog/new-category"'),
  "new category",
);
assert(copy.includes("catalogCategoryPath"), "category path helper");

assert(
  page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    page.includes("COMPARE"),
  "BUTTONS+ header",
);
assert(page.includes("onBack"), "onBack");
assert(page.includes("onQuickCategories"), "onQuickCategories");
assert(page.includes("onStockList"), "onStockList");
assert(page.includes("onScan"), "onScan");
assert(page.includes("onAddCategory"), "onAddCategory");
assert(page.includes("onOpenCategory"), "onOpenCategory");
assert(page.includes('data-action="back"'), "back action");
assert(page.includes('data-action="quick-categories"'), "quick action");
assert(page.includes('data-action="stock-list"'), "stock action");
assert(page.includes('data-action="scan-barcode"'), "scan action");
assert(page.includes('data-action="add-category"'), "fab action");
assert(page.includes('data-action="open-category"'), "card action");
assert(page.includes("popOrGo"), "popOrGo");
assert(page.includes("useNavigate"), "navigate");
assert(page.includes("CATALOG_PATH_TAXONOMY"), "uses taxonomy");
assert(page.includes("CATALOG_PATH_NEW_CATEGORY"), "uses new category");
assert(page.includes("catalogCategoryPath"), "uses category path");
assert(!page.includes("fetch(") || page.includes("listItemCategories"), "no fetch unless WIRE");
assert(page.includes('data-deferred="suggestion-chips"') || page.includes("catalogSuggestionCategories") || page.includes('data-action="suggestion-chip"'), "chips deferred or WIRE");
assert(
  page.includes('data-deferred="category-cards"') ||
    page.includes("data-sample") ||
    page.includes("listItemCategories"),
  "cards deferred or sample or WIRE",
);

assert(css.includes("catalog-page__icon-btn--active"), "icon active");
assert(css.includes("catalog-page__fab--active"), "fab active");
assert(css.includes("catalog-page__card--hit"), "card hit");

assert(router.includes('path="/catalog/new-category"'), "new-category route");
assert(
  router.includes('path="/catalog/category/:categoryId"'),
  "category detail route",
);

assert(pkg.includes("test:catalog-buttons"), "package script");

for (const name of [
  "check-catalog-scaffold.mjs",
  "check-catalog-layout.mjs",
  "check-catalog-fields.mjs",
]) {
  const r = spawnSync(process.execPath, [join(root, "scripts", name)], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    failures.push(`${name} FAILED`);
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
  }
}

if (failures.length) {
  console.error("Catalog BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog BUTTONS checks PASS");
