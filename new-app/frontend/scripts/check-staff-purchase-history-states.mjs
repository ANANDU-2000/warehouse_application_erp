/**
 * Staff purchase history /staff/purchase-history STATES smoke.
 * Run: node scripts/check-staff-purchase-history-states.mjs
 * Source: ListSkeleton / FriendlyLoadError / keepAlive 2m / RefreshIndicator
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
  "src/features/staff/purchaseHistory/staffPurchaseHistoryCopy.ts",
);
const subPath = join(
  root,
  "src/features/staff/purchaseHistory/staffPurchaseHistoryLoadSubtitle.ts",
);
const pagePath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(subPath), "load subtitle exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

const required = [
  ["Could not load purchase history", "LOAD"],
  ["Could not load low stock items", "LOW_LOAD"],
  ["Session expired — sign in again", "SESSION"],
  ["Tap to retry.", "RETRY_SUB"],
  ["Retry", "RETRY"],
  ["No connection. Changes will sync when online.", "NET"],
];

for (const [literal, name] of required) {
  assert(
    copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`),
    name,
  );
}

assert(copy.includes("STAFF_PH_CACHE_TTL_MS = 120_000"), "2m TTL");
assert(copy.includes("STAFF_PH_SKELETON_PURCHASE_ROWS = 10"), "skel 10");
assert(copy.includes("STAFF_PH_SKELETON_LOW_ROWS = 8"), "skel 8");
assert(copy.includes("STAFF_PH_SKELETON_PURCHASE_HEIGHT_PX = 88"), "h88");
assert(copy.includes("STAFF_PH_SKELETON_LOW_HEIGHT_PX = 72"), "h72");

assert(sub.includes("mapStaffPhLoadTitle"), "title mapper");
assert(sub.includes("mapStaffPhLoadSubtitle"), "subtitle mapper");
assert(sub.includes("STAFF_PH_RETRY_SUBTITLE"), "subtitle constant");
assert(sub.includes("StaffPhNetworkError"), "network");

assert(page.includes("mapStaffPhLoadTitle"), "uses title mapper");
assert(page.includes("mapStaffPhLoadSubtitle"), "uses subtitle mapper");
assert(page.includes("staff-ph-loading"), "loading testid");
assert(page.includes("staff-ph-error"), "error testid");
assert(page.includes("staff-ph-retry"), "retry");
assert(page.includes("showInitialSkeleton"), "skeleton gate");
assert(page.includes("staff-ph-friendly-error"), "FriendlyLoadError chrome");
assert(page.includes("staff-ph-skeleton"), "skeleton class");
assert(page.includes("STAFF_PH_CACHE_TTL_MS"), "uses TTL");
assert(page.includes("purchasesCache"), "purchases cache");
assert(page.includes("lowStockCache"), "low cache");
assert(page.includes("onTouchEnd"), "pull refresh");
assert(page.includes("ListSkeleton"), "ListSkeleton aria");
assert(
  !page.includes("setLoadError(lowErr.message") &&
    !page.includes("setLoadError(purchaseErr.detail") &&
    !page.includes("setLoadError(STAFF_PH_LOAD_FAILED)"),
  "no raw WIRE string error",
);

assert(css.includes("staff-ph-skeleton"), "skeleton css");
assert(css.includes("staff-ph-friendly-error"), "friendly error css");

assert(pkg.includes("test:staff-purchase-history-states"), "package script");

for (const name of [
  "check-staff-purchase-history-scaffold.mjs",
  "check-staff-purchase-history-layout.mjs",
  "check-staff-purchase-history-fields.mjs",
  "check-staff-purchase-history-buttons.mjs",
  "check-staff-purchase-history-wire.mjs",
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
  console.error("Staff purchase-history STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff purchase-history STATES checks PASS");
