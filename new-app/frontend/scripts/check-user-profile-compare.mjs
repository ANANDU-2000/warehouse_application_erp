/**
 * Users /settings/users/:userId COMPARE aggregator — runs all page-loop smokes.
 * Run: node scripts/check-user-profile-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(root, "../../docs/modules/user_profile_compare.md");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "user_profile_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(compare.includes("user_profile_scaffold_compare.md"), "links scaffold");
assert(compare.includes("user_profile_layout_compare.md"), "links layout");
assert(compare.includes("user_profile_fields_compare.md"), "links fields");
assert(compare.includes("user_profile_buttons_compare.md"), "links buttons");
assert(compare.includes("user_profile_wire_compare.md"), "links wire");
assert(compare.includes("user_profile_states_compare.md"), "links states");
assert(compare.includes("Overall (in-scope"), "overall verdict section");
assert(compare.includes("Notes") || compare.includes("notes"), "notes covered");
assert(
  compare.includes("Activity tab feed") || compare.includes("activity"),
  "activity deferral noted",
);

const copyPath = join(root, "src/features/users/userProfileCopy.ts");
const pagePath = join(root, "src/features/users/UserProfilePage.tsx");
assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
assert(copy.includes('USER_PROFILE_NOTES_LABEL = "Notes"'), "Notes label");
assert(page.includes("user-profile-notes"), "notes testid");
assert(page.includes("profile?.notes"), "notes bind");

const scripts = [
  "check-user-profile-scaffold.mjs",
  "check-user-profile-layout.mjs",
  "check-user-profile-fields.mjs",
  "check-user-profile-buttons.mjs",
  "check-user-profile-wire.mjs",
  "check-user-profile-states.mjs",
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
  pkg.includes("test:user-profile-compare"),
  "package.json script registered",
);

if (failures.length) {
  console.error("User profile COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("User profile COMPARE checks PASS (all slice smokes)");
