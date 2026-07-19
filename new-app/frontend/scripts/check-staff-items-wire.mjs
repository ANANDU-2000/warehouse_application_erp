/**
 * Staff item gallery /staff/items WIRE smoke.
 * Run: node scripts/check-staff-items-wire.mjs
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

const apiPath = join(root, "src/features/staff/items/staffItemGalleryApi.ts");
const pagePath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.tsx",
);
const logicPath = join(
  root,
  "src/features/staff/items/staffItemGalleryLogic.ts",
);
const repoPath = join(
  root,
  "../backend/src/repositories/staffHome.repository.ts",
);
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "api exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(repoPath), "staffHome repo exists");

const api = readFileSync(apiPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const logic = readFileSync(logicPath, "utf8");
const repo = readFileSync(repoPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("fetchAllGalleryStock"), "fetchAllGalleryStock");
assert(api.includes("STAFF_GALLERY_PAGE_SIZE = 500"), "page size 500");
assert(api.includes("STAFF_GALLERY_MAX_PAGES = 40"), "max pages 40");
assert(api.includes("/stock/list"), "stock list path");
assert(api.includes('status: "all"'), "status all");
assert(api.includes('sort: "name"'), "sort name");
assert(api.includes("normalizeGalleryStockItem"), "normalize");
assert(api.includes("opening_stock_set"), "opening_stock_set map");
assert(api.includes("needs_opening_stock"), "needs_opening_stock map");

assert(page.includes("fetchAllGalleryStock"), "page fetches");
assert(page.includes("setAllItems"), "sets items");
assert(page.includes("staff-gallery-loading"), "loading");
assert(page.includes("staff-gallery-error"), "error");
assert(page.includes("staff-gallery-retry"), "retry");
assert(page.includes("STAFF_GALLERY_LOAD_FAILED"), "load failed copy");
assert(page.includes("readPrimaryBusiness"), "session business");

assert(logic.includes("opening_stock_set_at"), "opening filter API field");

assert(repo.includes("category_name"), "repo category_name");
assert(repo.includes("subcategory_name"), "repo subcategory");
assert(repo.includes("missing_barcode"), "repo missing_barcode");
assert(repo.includes("opening_stock_set_at"), "repo opening_stock_set_at");
assert(repo.includes("computeStockStatus"), "computeStockStatus");
assert(repo.includes("LEFT JOIN item_categories"), "join categories");
assert(repo.includes("LEFT JOIN category_types"), "join types");
assert(repo.includes("Math.min(2000"), "per_page le 2000");

assert(pkg.includes("test:staff-items-wire"), "package.json script");

for (const name of [
  "check-staff-items-scaffold.mjs",
  "check-staff-items-layout.mjs",
  "check-staff-items-fields.mjs",
  "check-staff-items-buttons.mjs",
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
  console.error("Staff items WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff items WIRE checks PASS");
