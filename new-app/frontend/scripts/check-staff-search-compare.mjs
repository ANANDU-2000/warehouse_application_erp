/**
 * Staff search /staff/search COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-staff-search-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/staff_search_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "staff_search_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(compare.includes("staff_search_scaffold_compare.md"), "links scaffold");
assert(compare.includes("staff_search_layout_compare.md"), "links layout");
assert(compare.includes("staff_search_fields_compare.md"), "links fields");
assert(compare.includes("staff_search_buttons_compare.md"), "links buttons");
assert(compare.includes("staff_search_wire_compare.md"), "links wire");
assert(compare.includes("staff_search_states_compare.md"), "links states");
assert(compare.includes("Overall (in-scope"), "overall verdict section");
assert(
  compare.includes("Owner `/search`") || compare.includes("owner `/search`"),
  "owner search deferral noted",
);
assert(
  compare.includes("TradeIntel") || compare.includes("fact-rich"),
  "TradeIntel deferral noted",
);

const scripts = [
  "check-staff-search-scaffold.mjs",
  "check-staff-search-layout.mjs",
  "check-staff-search-fields.mjs",
  "check-staff-search-buttons.mjs",
  "check-staff-search-wire.mjs",
  "check-staff-search-states.mjs",
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
  pkg.includes("test:staff-search-compare"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Staff search COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff search COMPARE checks PASS (all slice smokes)");
