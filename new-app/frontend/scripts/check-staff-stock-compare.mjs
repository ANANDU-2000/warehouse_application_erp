/**
 * Staff stock /staff/stock COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-staff-stock-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/staff_stock_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "staff_stock_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(compare.includes("staff_stock_scaffold_compare.md"), "links scaffold");
assert(compare.includes("staff_stock_layout_compare.md"), "links layout");
assert(compare.includes("staff_stock_fields_compare.md"), "links fields");
assert(compare.includes("staff_stock_buttons_compare.md"), "links buttons");
assert(compare.includes("staff_stock_wire_compare.md"), "links wire");
assert(compare.includes("staff_stock_states_compare.md"), "links states");
assert(compare.includes("Overall (in-scope"), "overall verdict section");
assert(
  compare.includes("delivery-indicator") ||
    compare.includes("Delivery indicator"),
  "delivery deferral noted",
);
assert(
  compare.includes("Activity") || compare.includes("activity-feed"),
  "activity deferral noted",
);
assert(
  compare.includes("shell-bundle") || compare.includes("period purchased"),
  "shell/period deferral noted",
);

const scripts = [
  "check-staff-stock-scaffold.mjs",
  "check-staff-stock-layout.mjs",
  "check-staff-stock-fields.mjs",
  "check-staff-stock-buttons.mjs",
  "check-staff-stock-wire.mjs",
  "check-staff-stock-states.mjs",
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
assert(
  pkg.includes("test:staff-stock-compare"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Staff stock COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff stock COMPARE checks PASS (all slice smokes)");
