/**
 * Staff low stock /staff/low-stock BUTTONS smoke.
 * Run: node scripts/check-staff-low-stock-buttons.mjs
 * Source: Inform/Receive/Item profile/export empty snack · detail sheet
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
  "src/features/staff/lowStock/staffLowStockCopy.ts",
);
const rowPath = join(
  root,
  "src/features/staff/lowStock/staffLowStockRow.ts",
);
const pagePath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.tsx",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(rowPath), "row helpers exist");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const row = readFileSync(rowPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_LS_INFORM = "Inform"'), "Inform");
assert(copy.includes('STAFF_LS_INFORM_OWNER = "Inform owner"'), "Inform owner");
assert(copy.includes('STAFF_LS_SENT = "Sent"'), "Sent");
assert(copy.includes('STAFF_LS_RECEIVE = "Receive delivery"'), "Receive");
assert(copy.includes('STAFF_LS_ITEM_PROFILE = "Item profile"'), "profile");
assert(
  copy.includes('STAFF_LS_EXPORT_EMPTY = "No items in this view to export"'),
  "export empty",
);
assert(copy.includes("staffLsOwnerNotified"), "notified snack");
assert(copy.includes("staffLsReceivePath"), "receive path");
assert(copy.includes("staffLsItemPath"), "item path");
assert(copy.includes('STAFF_LS_RECEIVE_PATH = "/staff/receive"'), "receive base");

assert(row.includes("staffLsStatusKind"), "status kind");
assert(row.includes("staffLsStatusLabel"), "status label");
assert(row.includes("formatStaffLsQtyDisplay"), "qty format");
assert(row.includes('"OUT"'), "OUT");
assert(row.includes('"PENDING"'), "PENDING");
assert(row.includes('"LOW"'), "LOW");

assert(page.includes("onNotifyOwner"), "onNotifyOwner");
assert(page.includes("onReceive"), "onReceive");
assert(page.includes("openItemProfile"), "openItemProfile");
assert(page.includes("openDetails"), "openDetails");
assert(page.includes("onExportPdf"), "onExportPdf");
assert(page.includes("onExportCsv"), "onExportCsv");
assert(page.includes("STAFF_LS_EXPORT_EMPTY"), "uses export empty");
assert(page.includes("staffLsReceivePath"), "uses receive path");
assert(page.includes("staffLsItemPath"), "uses item path");
assert(page.includes('data-action="inform-owner"'), "inform action");
assert(page.includes('data-action="export-pdf"'), "pdf action");
assert(page.includes('data-action="export-csv"'), "csv action");
assert(page.includes('data-action="receive"'), "receive action");
assert(page.includes('data-action="item-profile"'), "profile action");
assert(page.includes('data-slot="detailSheet"'), "detail sheet");
assert(page.includes('data-slot="toast"'), "toast");
assert(page.includes('data-deferred="notify-owner-api"'), "notify api deferred");
assert(page.includes('data-deferred="pdf-bytes"'), "pdf bytes deferred");
assert(page.includes('data-deferred="plus-stock"'), "plus stock deferred");
assert(page.includes('data-deferred="set-reorder"'), "reorder deferred");
assert(page.includes("toggleCat"), "category toggle");
assert(!page.includes("fetch("), "no fetch");

assert(pkg.includes("test:staff-low-stock-buttons"), "buttons script");

for (const name of [
  "check-staff-low-stock-scaffold.mjs",
  "check-staff-low-stock-layout.mjs",
  "check-staff-low-stock-fields.mjs",
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
  console.error("Staff low-stock BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff low-stock BUTTONS checks PASS");
