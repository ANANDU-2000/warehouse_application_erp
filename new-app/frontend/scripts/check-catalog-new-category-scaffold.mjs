/**
 * Catalog new category /catalog/new-category SCAFFOLD smoke.
 * Run: node scripts/check-catalog-new-category-scaffold.mjs
 * Source: catalog_add_category_page.dart; categories.md § Add category
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/catalog/catalogAddCategoryCopy.ts");
const pagePath = join(root, "src/features/catalog/CatalogAddCategoryPage.tsx");
const cssPath = join(root, "src/features/catalog/CatalogAddCategoryPage.css");
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

assert(copy.includes('ADD_CATEGORY_TITLE = "New category"'), "title");
assert(copy.includes('ADD_CATEGORY_NAME_LABEL = "Name"'), "name label");
assert(copy.includes('ADD_CATEGORY_NAME_HINT = "e.g. Rice, Oil"'), "hint");
assert(copy.includes('ADD_CATEGORY_NAME_ERROR = "Enter a name"'), "error");
assert(copy.includes('ADD_CATEGORY_CANCEL = "Cancel"'), "cancel");
assert(copy.includes('ADD_CATEGORY_CREATE = "Create"'), "create");
assert(
  copy.includes('ADD_CATEGORY_CREATED_SNACK = "Category created"'),
  "created snack",
);
assert(
  copy.includes('ADD_CATEGORY_BACK_FALLBACK_OWNER = "/catalog/taxonomy"'),
  "back taxonomy",
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
assert(page.includes('data-slot="nameField"'), "nameField");
assert(page.includes('data-slot="footer"'), "footer");
assert(page.includes('data-deferred="close"'), "close deferred");
assert(
  page.includes('data-deferred="name-field"') ||
    page.includes('data-testid="add-category-name"'),
  "name deferred or FIELDS input",
);
assert(page.includes('data-deferred="cancel"'), "cancel deferred");
assert(page.includes('data-deferred="create"'), "create deferred");
assert(!page.includes("<Navigate"), "staff allowed — no redirect");
assert(!page.includes("fetch("), "no fetch");
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

assert(css.includes("add-category-page"), "page css");
assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "scaffold bg");

assert(router.includes("CatalogAddCategoryPage"), "router import");
assert(router.includes('path="/catalog/new-category"'), "route");
assert(
  router.includes("element={<CatalogAddCategoryPage />}"),
  "uses page not stub",
);

assert(pkg.includes("test:catalog-new-category-scaffold"), "package script");

if (failures.length) {
  console.error("Catalog new-category SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog new-category SCAFFOLD checks PASS");
