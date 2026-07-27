/**
 * Staff activity /staff/activity COMPARE aggregator.
 * Run: node scripts/check-staff-activity-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/staff_activity_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "staff_activity_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(compare.includes("staff_activity_scaffold_compare.md"), "links scaffold");
assert(compare.includes("staff_activity_layout_compare.md"), "links layout");
assert(compare.includes("staff_activity_fields_compare.md"), "links fields");
assert(compare.includes("staff_activity_buttons_compare.md"), "links buttons");
assert(compare.includes("staff_activity_wire_compare.md"), "links wire");
assert(compare.includes("staff_activity_states_compare.md"), "links states");
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
  compare.includes("receive") || compare.includes("Receive"),
  "receive deferral noted",
);

const scripts = [
  "check-staff-activity-scaffold.mjs",
  "check-staff-activity-layout.mjs",
  "check-staff-activity-fields.mjs",
  "check-staff-activity-buttons.mjs",
  "check-staff-activity-wire.mjs",
  "check-staff-activity-states.mjs",
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
  pkg.includes("test:staff-activity-compare"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Staff activity COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff activity COMPARE checks PASS (all slice smokes)");
