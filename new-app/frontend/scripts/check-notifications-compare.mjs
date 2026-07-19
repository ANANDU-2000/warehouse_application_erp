/**
 * Notifications /notifications COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-notifications-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/notifications_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "notifications_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(compare.includes("notifications_scaffold_compare.md"), "links scaffold");
assert(compare.includes("notifications_layout_compare.md"), "links layout");
assert(compare.includes("notifications_fields_compare.md"), "links fields");
assert(compare.includes("notifications_buttons_compare.md"), "links buttons");
assert(compare.includes("notifications_wire_compare.md"), "links wire");
assert(compare.includes("notifications_states_compare.md"), "links states");
assert(compare.includes("Overall (in-scope"), "overall verdict section");
assert(
  compare.includes("Purchase due") || compare.includes("remaining"),
  "purchase-due deferral noted",
);

const scripts = [
  "check-notifications-scaffold.mjs",
  "check-notifications-layout.mjs",
  "check-notifications-fields.mjs",
  "check-notifications-buttons.mjs",
  "check-notifications-wire.mjs",
  "check-notifications-states.mjs",
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
  pkg.includes("test:notifications-compare"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Notifications COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Notifications COMPARE checks PASS (all slice smokes)");
