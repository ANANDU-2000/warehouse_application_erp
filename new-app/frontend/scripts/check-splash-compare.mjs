/**
 * Splash COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-splash-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/splash_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "splash_compare.md exists");
const doc = readFileSync(repoDocs, "utf8");
assert(doc.includes("**PASS**"), "splash_compare verdict PASS");
assert(doc.includes("Overall (in-scope Splash"), "overall verdict section");
assert(doc.includes("SessionCache"), "deferrals listed");

const sliceDocs = [
  "splash_scaffold_compare.md",
  "splash_layout_compare.md",
  "splash_buttons_compare.md",
  "splash_wire_compare.md",
];
for (const name of sliceDocs) {
  assert(
    existsSync(join(root, "../../docs/modules", name)),
    `${name} exists`,
  );
}

const scripts = [
  "check-splash-scaffold.mjs",
  "check-splash-layout.mjs",
  "check-splash-buttons.mjs",
  "check-splash-wire.mjs",
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
  console.error("Splash COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Splash COMPARE checks PASS (all slice smokes)");
