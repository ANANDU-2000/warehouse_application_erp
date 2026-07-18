/**
 * Owner /home COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-home-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/home_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "home_compare.md exists");

const scripts = [
  "check-home-scaffold.mjs",
  "check-home-layout.mjs",
  "check-home-fields.mjs",
  "check-home-buttons.mjs",
  "check-home-wire.mjs",
  "check-home-states.mjs",
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
  console.error("Home COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home COMPARE checks PASS (all slice smokes)");
