/**
 * Staff purchase history /staff/purchase-history COMPARE aggregator.
 * Run: node scripts/check-staff-purchase-history-compare.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDocs = join(
  root,
  "../../docs/modules/staff_purchase_history_compare.md",
);
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(existsSync(repoDocs), "staff_purchase_history_compare.md exists");
const compare = readFileSync(repoDocs, "utf8");
assert(compare.includes("**PASS**"), "compare verdict PASS");
assert(
  compare.includes("staff_purchase_history_scaffold_compare.md"),
  "links scaffold",
);
assert(
  compare.includes("staff_purchase_history_layout_compare.md"),
  "links layout",
);
assert(
  compare.includes("staff_purchase_history_fields_compare.md"),
  "links fields",
);
assert(
  compare.includes("staff_purchase_history_buttons_compare.md"),
  "links buttons",
);
assert(
  compare.includes("staff_purchase_history_wire_compare.md"),
  "links wire",
);
assert(
  compare.includes("staff_purchase_history_states_compare.md"),
  "links states",
);
assert(compare.includes("Overall (in-scope"), "overall verdict section");
assert(
  compare.includes("pack-summary") || compare.includes("pack summary"),
  "pack deferral noted",
);
assert(
  compare.includes("delivery-badge") || compare.includes("DeliveryBadge"),
  "delivery deferral noted",
);
assert(
  compare.includes("/staff/low-stock") || compare.includes("low-stock"),
  "low-stock stub noted",
);

const scripts = [
  "check-staff-purchase-history-scaffold.mjs",
  "check-staff-purchase-history-layout.mjs",
  "check-staff-purchase-history-fields.mjs",
  "check-staff-purchase-history-buttons.mjs",
  "check-staff-purchase-history-wire.mjs",
  "check-staff-purchase-history-states.mjs",
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
  pkg.includes("test:staff-purchase-history-compare"),
  "package.json script registered",
);

if (failures.length) {
  console.error("Staff purchase-history COMPARE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff purchase-history COMPARE checks PASS (all slice smokes)");
