/**
 * Staff item gallery /staff/items LAYOUT smoke.
 * Run: node scripts/check-staff-items-layout.mjs
 * Source: staff_item_gallery_page.dart; app_theme chipTheme; HexaColors
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

const pagePath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(page.includes('data-slot="appBar"'), "appBar slot");
assert(page.includes('data-slot="search"'), "search slot");
assert(page.includes('data-slot="filters"'), "filters slot");
assert(page.includes('data-slot="summary"'), "summary slot");
assert(page.includes('data-slot="results"'), "results slot");
assert(page.includes('data-slot="list"'), "list slot");
assert(page.includes('data-slot="empty"'), "empty slot");
assert(page.includes("STAFF_GALLERY_EMPTY"), "empty copy");
assert(page.includes("readOnly"), "search inert");

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "brand background");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand primary");
assert(css.includes("#d8ece8") || css.includes("#D8ECE8"), "primaryContainer");
assert(css.includes("#d7e7e3") || css.includes("#D7E7E3"), "outlineVariant");
assert(css.includes("#9ca3af") || css.includes("#9CA3AF"), "input hint");
assert(css.includes("#64748b") || css.includes("#64748B"), "textMuted / neutral");
assert(css.includes("#e5e7eb") || css.includes("#E5E7EB"), "inputBorderGrey");
assert(css.includes("#e2e8e6") || css.includes("#E2E8E6"), "card border");
assert(css.includes("#94a3b8") || css.includes("#94A3B8"), "subcategory muted");
assert(css.includes("#dc2626") || css.includes("#DC2626"), "low stock red");
assert(css.includes("border-radius: 10px"), "search/card radius 10");
assert(css.includes("border-radius: 12px"), "chip radius 12");
assert(css.includes("min-height: 44px") || css.includes("height: 44px"), "filter row 44");
assert(css.includes("padding: 0 12px 88px"), "list pad bottom 88");
assert(css.includes("padding: 4px 16px 8px"), "summary padding");
assert(css.includes("pointer-events: none"), "inert chrome");
assert(css.includes("font-weight: 800"), "category title w800");
assert(css.includes("staff-gallery-page__category-card"), "category card chrome CSS");
assert(css.includes("staff-gallery-page__item-stock--low"), "low stock row CSS");

assert(pkg.includes("test:staff-items-layout"), "package.json script registered");
assert(pkg.includes("test:staff-items-scaffold"), "scaffold script still registered");

const scaffold = spawnSync(
  process.execPath,
  [join(root, "scripts/check-staff-items-scaffold.mjs")],
  { cwd: root, encoding: "utf8" },
);
if (scaffold.status !== 0) {
  failures.push("scaffold smoke FAILED");
  if (scaffold.stdout) process.stdout.write(scaffold.stdout);
  if (scaffold.stderr) process.stderr.write(scaffold.stderr);
}

if (failures.length) {
  console.error("Staff items LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff items LAYOUT checks PASS");
