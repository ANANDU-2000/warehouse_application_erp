/**
 * Staff item gallery /staff/items BUTTONS smoke.
 * Run: node scripts/check-staff-items-buttons.mjs
 * Source: staff_item_gallery_page.dart expand / sub tabs / row menu / nav
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

const copyPath = join(
  root,
  "src/features/staff/items/staffItemGalleryCopy.ts",
);
const logicPath = join(
  root,
  "src/features/staff/items/staffItemGalleryLogic.ts",
);
const pagePath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.tsx",
);
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(logicPath), "logic exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const logic = readFileSync(logicPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_GALLERY_MENU_STOCK = "Update stock"'), "menu stock");
assert(
  copy.includes('STAFF_GALLERY_MENU_REORDER = "Reorder / opening"'),
  "menu reorder",
);
assert(copy.includes('STAFF_GALLERY_MENU_ITEM = "Item profile"'), "menu item");
assert(copy.includes('STAFF_GALLERY_NO_CODE = "No code"'), "No code");
assert(copy.includes('STAFF_GALLERY_NO_BARCODE = "No barcode"'), "No barcode");
assert(copy.includes('STAFF_GALLERY_SUB_TAB_ALL = "All"'), "sub All");
assert(copy.includes('STAFF_GALLERY_DEFAULT_UNIT = "bag"'), "default bag");

assert(logic.includes("formatGalleryStockLine"), "stock line helper");
assert(page.includes("toggleCat"), "category expand");
assert(page.includes("expandedCats"), "expanded state");
assert(page.includes("subTabByCat"), "sub tabs state");
assert(page.includes("openItemProfile"), "item profile nav");
assert(page.includes("openItemEdit"), "item edit nav");
assert(page.includes("`/catalog/item/${id}`"), "catalog path");
assert(page.includes("`/catalog/item/${id}/edit`"), "edit path");
assert(page.includes('data-action="stock"'), "stock menu action");
assert(page.includes('data-action="reorder"'), "reorder menu action");
assert(page.includes('data-action="item"'), "item menu action");
assert(page.includes('data-deferred="quick-stock-sheet"'), "stock sheet deferred");
assert(page.includes("formatStockQtyNumber"), "qty format");
assert(page.includes("formatGalleryStockLine"), "uses stock line");
assert(page.includes("STAFF_GALLERY_SUB_DASH"), "dash sub hide");
assert(page.includes('data-slot="categoryCard"'), "category card slot");
assert(page.includes('data-slot="itemRow"'), "item row slot");
assert(page.includes('data-slot="itemMenu"'), "item menu slot");
assert(page.includes("onUpdateStock"), "stock handler present");

assert(router.includes("/catalog/item/:itemId/edit"), "edit route stub");
assert(router.includes('title="Edit catalog item"'), "edit stub title");

assert(pkg.includes("test:staff-items-buttons"), "package.json script");

for (const name of [
  "check-staff-items-scaffold.mjs",
  "check-staff-items-layout.mjs",
  "check-staff-items-fields.mjs",
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
  console.error("Staff items BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff items BUTTONS checks PASS");
