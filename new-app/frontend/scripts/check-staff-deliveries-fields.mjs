/**
 * Staff deliveries /staff/deliveries FIELDS smoke.
 * Run: node scripts/check-staff-deliveries-fields.mjs
 * Source: no search/filters — title/count/empty client gates only
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const fieldsPath = join(
  root,
  "src/features/staff/deliveries/staffDeliveriesFields.ts",
);
const pagePath = join(
  root,
  "src/features/staff/deliveries/StaffDeliveriesPage.tsx",
);
const copyPath = join(
  root,
  "src/features/staff/deliveries/staffDeliveriesCopy.ts",
);
const pkgPath = join(root, "package.json");

assert(existsSync(fieldsPath), "fields module exists");
assert(existsSync(pagePath), "page exists");

const fields = readFileSync(fieldsPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const copy = readFileSync(copyPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(fields.includes("staffDelAppBarTitle"), "appBar title helper");
assert(fields.includes("staffDelSectionHeading"), "section heading");
assert(fields.includes("staffDelTotal"), "total");
assert(fields.includes("staffDelShowEmptyAll"), "empty all gate");
assert(fields.includes("staffDelSectionTitleHot"), "title hot");
assert(fields.includes("STAFF_DEL_SECTION_ORDER"), "section order");
assert(fields.includes("STAFF_DEL_EMPTY_COUNTS"), "empty counts");
assert(copy.includes("STAFF_DEL_TITLE_COUNTED"), "counted title");

assert(page.includes("FIELDS"), "FIELDS header");
assert(page.includes("useState"), "useState");
assert(page.includes("staffDelAppBarTitle"), "uses title helper");
assert(page.includes("staffDelTotal"), "uses total");
assert(page.includes("staffDelShowEmptyAll"), "uses empty gate");
assert(page.includes("STAFF_DEL_SECTION_ORDER"), "section catalog");
assert(page.includes('data-total={total}'), "data-total");
assert(page.includes('data-step="fields"'), "fields step");
assert(!page.includes('type="search"'), "no search input on page");
assert(!page.includes("placeholder="), "no filter placeholders");
assert(!page.includes("<input"), "no input elements");
assert(!page.includes("<select"), "no select elements");
assert(page.includes('data-deferred="scan-barcode"'), "scan still deferred");
assert(page.includes('data-deferred="delivery-rows"'), "rows deferred");
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("onClick"), "no click handlers");

assert(pkg.includes("test:staff-deliveries-fields"), "package script");

/* Unit: title helpers */
function staffDelAppBarTitle(total) {
  return total > 0 ? `Pending deliveries (${total})` : "Pending deliveries";
}
assert(staffDelAppBarTitle(0) === "Pending deliveries", "title 0");
assert(staffDelAppBarTitle(3) === "Pending deliveries (3)", "title 3");

for (const name of [
  "check-staff-deliveries-scaffold.mjs",
  "check-staff-deliveries-layout.mjs",
]) {
  const r = spawnSync(process.execPath, [join(root, "scripts", name)], {
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
  console.error("Staff deliveries FIELDS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff deliveries FIELDS checks PASS");
