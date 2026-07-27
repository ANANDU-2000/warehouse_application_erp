/**
 * Catalog taxonomy hub /catalog/taxonomy BUTTONS smoke.
 * Run: node scripts/check-catalog-taxonomy-buttons.mjs
 * Source: catalog_taxonomy_hub_page.dart back · full catalog · chips · FAB · row
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

assert(
  copy.includes('TAXONOMY_BACK_FALLBACK_OWNER = "/home"'),
  "owner back",
);
assert(
  copy.includes('TAXONOMY_BACK_FALLBACK_STAFF = "/staff/home"'),
  "staff back",
);
assert(copy.includes('TAXONOMY_PATH_CATALOG = "/catalog"'), "full catalog path");
assert(
  copy.includes('TAXONOMY_PATH_NEW_CATEGORY = "/catalog/new-category"'),
  "new category",
);
assert(copy.includes("taxonomyCategoryPath"), "category path helper");
assert(copy.includes("taxonomyNewSubcategoryPath"), "new-sub path helper");
assert(copy.includes("TAXONOMY_SAMPLE_CATEGORY_ID"), "sample id");

assert(
  page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("STATES") ||
    page.includes("COMPARE"),
  "BUTTONS+ header",
);
assert(page.includes("onBack"), "onBack");
assert(page.includes("onFullCatalog"), "onFullCatalog");
assert(page.includes("onAddCategory"), "onAddCategory");
assert(page.includes("onAddSubcategory"), "onAddSubcategory");
assert(page.includes("onOpenCategory"), "onOpenCategory");
assert(page.includes("popOrGo"), "popOrGo");
assert(page.includes("useNavigate"), "navigate");
assert(page.includes('data-action="back"'), "back action");
assert(page.includes('data-action="full-catalog"'), "full-catalog action");
assert(page.includes('data-action="chip-category"'), "chip category");
assert(page.includes('data-action="chip-subcategory"'), "chip subcategory");
assert(page.includes('data-action="quick-add"'), "fab action");
assert(page.includes('data-action="empty-add"'), "empty add");
assert(page.includes('data-action="open-category"'), "row open");
assert(page.includes('data-action="add-subcategory"'), "row add-sub");
assert(page.includes("TAXONOMY_PATH_NEW_CATEGORY"), "uses new category");
assert(page.includes("taxonomyCategoryPath"), "uses category path");
assert(page.includes("taxonomyNewSubcategoryPath"), "uses new-sub path");
assert(page.includes("isStaff"), "staff branch for row tap");
assert(!page.includes("fetch("), "no fetch");
assert(
  page.includes("data-sample") ||
    page.includes("listItemCategories") ||
    page.includes("WIRE") ||
    page.includes("STATES"),
  "sample rows or WIRE",
);

assert(css.includes("taxonomy-hub-page__icon-btn--active"), "icon active");
assert(css.includes("taxonomy-hub-page__action-chip--active"), "chip active");
assert(css.includes("taxonomy-hub-page__fab--active"), "fab active");
assert(css.includes("taxonomy-hub-page__row--hit"), "row hit");
assert(
  css.includes("taxonomy-hub-page__empty-primary--active"),
  "empty primary active",
);

assert(router.includes('path="/catalog/new-category"'), "new-category route");
assert(
  router.includes('path="/catalog/category/:categoryId/new-subcategory"'),
  "new-subcategory route",
);
assert(
  router.includes('path="/catalog/category/:categoryId"'),
  "category detail route",
);

assert(pkg.includes("test:catalog-taxonomy-buttons"), "package script");

for (const name of [
  "check-catalog-taxonomy-scaffold.mjs",
  "check-catalog-taxonomy-layout.mjs",
  "check-catalog-taxonomy-fields.mjs",
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
  console.error("Catalog taxonomy BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog taxonomy BUTTONS checks PASS");
