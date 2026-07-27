/**
 * Catalog hub /catalog STATES smoke.
 * Run: node scripts/check-catalog-states.mjs
 * Source: ListSkeleton() · FriendlyLoadError defaults
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
const subPath = join(root, "src/features/catalog/catalogLoadSubtitle.ts");
const pagePath = join(root, "src/features/catalog/CatalogPage.tsx");
const cssPath = join(root, "src/features/catalog/CatalogPage.css");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(subPath), "subtitle exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('CATALOG_LOAD_FAILED = "Unable to load data"'), "title");
assert(copy.includes('CATALOG_RETRY_SUBTITLE = "Tap to retry."'), "sub");
assert(copy.includes('CATALOG_RETRY = "Retry"'), "Retry");
assert(copy.includes("CATALOG_SKELETON_ROWS = 6"), "skel 6");
assert(copy.includes("CATALOG_SKELETON_HEIGHT_PX = 84"), "h84");

assert(sub.includes("mapCatalogLoadTitle"), "title mapper");
assert(sub.includes("mapCatalogLoadSubtitle"), "sub mapper");
assert(sub.includes("CATALOG_LOAD_FAILED"), "fixed title");
assert(sub.includes("CATALOG_RETRY_SUBTITLE"), "fixed sub");

assert(page.includes("STATES"), "STATES header");
assert(page.includes("mapCatalogLoadTitle"), "uses title");
assert(page.includes("mapCatalogLoadSubtitle"), "uses subtitle");
assert(page.includes("showInitialSkeleton"), "skeleton gate");
assert(page.includes("catalog-page__skeleton"), "skeleton class");
assert(page.includes("ListSkeleton"), "ListSkeleton aria");
assert(page.includes("catalog-page__friendly-error"), "FriendlyLoadError");
assert(page.includes('data-testid="catalog-loading"'), "loading testid");
assert(page.includes('data-testid="catalog-error"'), "error testid");
assert(page.includes('data-testid="catalog-retry"'), "retry testid");
assert(page.includes("CATALOG_SKELETON_ROWS"), "uses row count");
assert(page.includes("listItemCategories"), "still wired");
assert(page.includes("hasData"), "null gate");
assert(!page.includes("Loading…"), "no plain Loading text");

assert(css.includes("catalog-page__skeleton"), "skeleton css");
assert(css.includes("catalog-page__friendly-error"), "friendly css");
assert(css.includes("#eff2f1") || css.includes("#EFF2F1"), "skeleton base");

assert(pkg.includes("test:catalog-states"), "package script");

for (const name of [
  "check-catalog-scaffold.mjs",
  "check-catalog-layout.mjs",
  "check-catalog-fields.mjs",
  "check-catalog-buttons.mjs",
  "check-catalog-wire.mjs",
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
  console.error("Catalog STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog STATES checks PASS");
