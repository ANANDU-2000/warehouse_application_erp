/**
 * Staff /staff/home COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-staff-home-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/staff_home_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "staff_home_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(compare.includes("staff_home_scaffold_compare.md"), "links scaffold");
assert(compare.includes("staff_home_states_compare.md"), "links states");
assert(compare.includes("home-overview"), "mentions no home-overview deferral/check");

const scripts = [
  "check-staff-home-scaffold.mjs",
  "check-staff-home-layout.mjs",
  "check-staff-home-fields.mjs",
  "check-staff-home-buttons.mjs",
  "check-staff-home-wire.mjs",
  "check-staff-home-states.mjs",
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

if (failures.length) {
  console.error("Staff home COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home COMPARE checks PASS (all slice smokes)");
