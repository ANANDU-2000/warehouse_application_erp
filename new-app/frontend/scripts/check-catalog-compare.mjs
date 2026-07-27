/**
 * Catalog hub /catalog COMPARE aggregator.
 * Run: node scripts/check-catalog-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/catalog_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "catalog_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(compare.includes("catalog_scaffold_compare.md"), "links scaffold");
assert(compare.includes("catalog_layout_compare.md"), "links layout");
assert(compare.includes("catalog_fields_compare.md"), "links fields");
assert(compare.includes("catalog_buttons_compare.md"), "links buttons");
assert(compare.includes("catalog_wire_compare.md"), "links wire");
assert(compare.includes("catalog_states_compare.md"), "links states");
assert(compare.includes("Overall (in-scope"), "overall verdict section");
assert(
  compare.includes("purchase") || compare.includes("Purchase entry"),
  "purchase deferral noted",
);
assert(
  compare.includes("barcode") || compare.includes("bulk print"),
  "barcode deferral noted",
);
assert(
  compare.includes("taxonomy") || compare.includes("/catalog/taxonomy"),
  "taxonomy next noted",
);

const scripts = [
  "check-catalog-scaffold.mjs",
  "check-catalog-layout.mjs",
  "check-catalog-fields.mjs",
  "check-catalog-buttons.mjs",
  "check-catalog-wire.mjs",
  "check-catalog-states.mjs",
];

for (const name of scripts) {
  const path = join(root, "scripts", name);
  assert(existsSync(path), `${name} exists`);
  const r = spawnSync(process.execPath, [path], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    failures.push(`${name} FAILED`);
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
  }
}

const pkg = readFileSync(join(root, "package.json"), "utf8");
assert(pkg.includes("test:catalog-compare"), "package.json script registered");

if (failures.length) {
  console.error("Catalog COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Catalog COMPARE checks PASS (all slice smokes)");
