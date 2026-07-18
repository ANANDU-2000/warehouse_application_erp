/**
 * Owner /home/activity COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-home-activity-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/home_activity_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "home_activity_compare.md exists");

const scripts = [
  "check-home-activity-scaffold.mjs",
  "check-home-activity-layout.mjs",
  "check-home-activity-fields.mjs",
  "check-home-activity-buttons.mjs",
  "check-home-activity-wire.mjs",
  "check-home-activity-states.mjs",
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
  console.error("Home activity COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home activity COMPARE checks PASS (all slice smokes)");
