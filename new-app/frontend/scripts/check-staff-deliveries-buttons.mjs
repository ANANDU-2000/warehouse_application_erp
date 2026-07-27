/**
 * Staff deliveries /staff/deliveries BUTTONS smoke.
 * Run: node scripts/check-staff-deliveries-buttons.mjs
 * Source: back · scan → /barcode/scan · row → /staff/receive/:id
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

const copyPath = join(
  root,
  "src/features/staff/deliveries/staffDeliveriesCopy.ts",
);
const pagePath = join(
  root,
  "src/features/staff/deliveries/StaffDeliveriesPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/deliveries/StaffDeliveriesPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_DEL_SCAN_PATH = "/barcode/scan"'), "scan path");
assert(copy.includes("staffDelReceivePath"), "receive path helper");
assert(copy.includes("/staff/receive/"), "receive base");

assert(
  page.includes("BUTTONS") || page.includes("WIRE") || page.includes("STATES"),
  "BUTTONS+ header",
);
assert(page.includes("onBack"), "onBack");
assert(page.includes("onScan"), "onScan");
assert(page.includes("onOpenReceive"), "onOpenReceive");
assert(page.includes('data-action="back"'), "back action");
assert(page.includes('data-action="scan-barcode"'), "scan action");
assert(page.includes('data-action="open-receive"'), "receive action");
assert(page.includes("STAFF_DEL_SCAN_PATH"), "uses scan path");
assert(page.includes("staffDelReceivePath"), "uses receive path");
assert(page.includes("popOrGo"), "popOrGo");
assert(page.includes("STAFF_DEL_BACK_FALLBACK"), "back fallback");
assert(page.includes("useNavigate"), "navigate");
assert(
  page.includes("fetchTradePurchasesRecent") || !page.includes("fetch("),
  "no raw fetch unless WIRE",
);
assert(
  page.includes('data-deferred="delivery-rows"') ||
    page.includes("staffDeliverySectionsFromRows"),
  "rows deferred or WIRE",
);

assert(css.includes("staff-del-appbar__back--active"), "back active css");
assert(css.includes("staff-del-row__hit"), "row hit target");

assert(pkg.includes("test:staff-deliveries-buttons"), "package script");

for (const name of [
  "check-staff-deliveries-scaffold.mjs",
  "check-staff-deliveries-layout.mjs",
  "check-staff-deliveries-fields.mjs",
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
  console.error("Staff deliveries BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff deliveries BUTTONS checks PASS");
