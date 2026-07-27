/**
 * Catalog new category /catalog/new-category COMPARE smoke.
 * Run: node scripts/check-catalog-new-category-compare.mjs
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

const comparePath = join(
  root,
  "../../docs/modules/catalog_new_category_compare.md",
);
const pkgPath = join(root, "package.json");

assert(existsSync(comparePath), "compare doc exists");
const compare = readFileSync(comparePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(compare.includes("**PASS**"), "verdict PASS");
assert(compare.includes("catalog_new_category_scaffold_compare.md"), "scaffold");
assert(compare.includes("catalog_new_category_layout_compare.md"), "layout");
assert(compare.includes("catalog_new_category_fields_compare.md"), "fields");
assert(compare.includes("catalog_new_category_buttons_compare.md"), "buttons");
assert(compare.includes("catalog_new_category_wire_compare.md"), "wire");
assert(compare.includes("catalog_new_category_states_compare.md"), "states");
assert(pkg.includes("test:catalog-new-category-compare"), "package script");

for (const name of [
  "check-catalog-new-category-scaffold.mjs",
  "check-catalog-new-category-layout.mjs",
  "check-catalog-new-category-fields.mjs",
  "check-catalog-new-category-buttons.mjs",
  "check-catalog-new-category-wire.mjs",
  "check-catalog-new-category-states.mjs",
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
  console.error("Catalog new-category COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog new-category COMPARE checks PASS");
