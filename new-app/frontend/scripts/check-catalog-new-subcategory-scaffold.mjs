/**
 * Catalog new subcategory /catalog/category/:categoryId/new-subcategory SCAFFOLD smoke.
 * Run: node scripts/check-catalog-new-subcategory-scaffold.mjs
 * Source: catalog_add_subcategory_page.dart; categories.md § Add subcategory
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/catalog/catalogAddSubcategoryCopy.ts");
const pagePath = join(
  root,
  "src/features/catalog/CatalogAddSubcategoryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/catalog/CatalogAddSubcategoryPage.css",
);
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

assert(copy.includes('ADD_SUBCATEGORY_TITLE = "New subcategory"'), "title");
assert(copy.includes('ADD_SUBCATEGORY_NAME_LABEL = "Name"'), "name label");
assert(
  copy.includes('ADD_SUBCATEGORY_NAME_HINT = "e.g. Biriyani rice"'),
  "hint",
);
assert(copy.includes('ADD_SUBCATEGORY_NAME_ERROR = "Enter a name"'), "error");
assert(copy.includes('ADD_SUBCATEGORY_CANCEL = "Cancel"'), "cancel");
assert(copy.includes('ADD_SUBCATEGORY_CREATE = "Create"'), "create");
assert(
  copy.includes('ADD_SUBCATEGORY_CREATED_SNACK = "Subcategory created"'),
  "created snack",
);
assert(
  copy.includes('ADD_SUBCATEGORY_SIMILAR_TITLE = "Similar subcategory exists"'),
  "similar title",
);
assert(
  copy.includes('ADD_SUBCATEGORY_BACK_FALLBACK_OWNER = "/catalog/taxonomy"'),
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
assert(page.includes("data-category-id"), "categoryId param slot");
assert(
  page.includes('data-deferred="close"') || page.includes('data-action="close"'),
  "close deferred or BUTTONS",
);
assert(
  page.includes('data-deferred="name-field"') ||
    page.includes('data-testid="add-subcategory-name"'),
  "name deferred or FIELDS input",
);
assert(
  page.includes('data-deferred="cancel"') ||
    page.includes('data-action="cancel"'),
  "cancel deferred or BUTTONS",
);
assert(
  page.includes('data-deferred="create"') ||
    page.includes('data-action="create"'),
  "create deferred or BUTTONS",
);
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

assert(css.includes("add-subcategory-page"), "page css");
assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "scaffold bg");

assert(router.includes("CatalogAddSubcategoryPage"), "router import");
assert(
  router.includes('path="/catalog/category/:categoryId/new-subcategory"'),
  "route",
);
assert(
  router.includes("element={<CatalogAddSubcategoryPage />}"),
  "uses page not stub",
);

assert(pkg.includes("test:catalog-new-subcategory-scaffold"), "package script");

if (failures.length) {
  console.error("Catalog new-subcategory SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog new-subcategory SCAFFOLD checks PASS");
