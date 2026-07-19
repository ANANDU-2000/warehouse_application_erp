/**
 * Users /settings/users COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-users-management-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/users_management_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "users_management_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(compare.includes("users_management_scaffold_compare.md"), "links scaffold");
assert(compare.includes("users_management_layout_compare.md"), "links layout");
assert(compare.includes("users_management_fields_compare.md"), "links fields");
assert(compare.includes("users_management_buttons_compare.md"), "links buttons");
assert(compare.includes("users_management_wire_compare.md"), "links wire");
assert(compare.includes("users_management_states_compare.md"), "links states");
assert(compare.includes("Overall (in-scope"), "overall verdict section");
assert(compare.includes("/users/bulk") || compare.includes("bulk"), "bulk covered");

const scripts = [
  "check-users-management-layout.mjs",
  "check-users-management-fields.mjs",
  "check-users-management-buttons.mjs",
  "check-users-management-wire.mjs",
  "check-users-management-states.mjs",
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
  pkg.includes("test:users-management-compare"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Users management COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Users management COMPARE checks PASS (all slice smokes)");
