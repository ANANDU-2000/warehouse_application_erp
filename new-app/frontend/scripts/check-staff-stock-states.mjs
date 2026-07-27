/**
 * Staff stock /staff/stock STATES smoke.
 * Run: node scripts/check-staff-stock-states.mjs
 * Source: stock_page.dart ListSkeleton / FriendlyLoadError / kStockListCacheTtl
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

const copyPath = join(root, "src/features/staff/stock/staffStockCopy.ts");
const subPath = join(
  root,
  "src/features/staff/stock/staffStockLoadSubtitle.ts",
);
const pagePath = join(root, "src/features/staff/stock/StaffStockPage.tsx");
const cssPath = join(root, "src/features/staff/stock/StaffStockPage.css");
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
  ["Unable to load stock", "UNABLE"],
  ["Sign in to load stock", "SIGN_IN"],
  ["Warehouse list needs a valid session. Sign in and try again.", "SIGN_IN_SUB"],
  ["Tap to retry.", "RETRY_SUB"],
  ["Retry", "RETRY_BTN"],
  ["Session expired. Please log in again.", "401"],
  ["No connection. Check your network and try again.", "NET"],
  ["Server error. Please try again shortly.", "5XX"],
];

for (const [literal, name] of required) {
  assert(
    copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`),
    name,
  );
}

assert(copy.includes("STAFF_STOCK_CACHE_TTL_MS = 180_000"), "3m TTL");
assert(sub.includes("mapStaffStockLoadSubtitle"), "subtitle mapper");
assert(sub.includes("mapStaffStockLoadTitle"), "title mapper");
assert(sub.includes("StaffStockNetworkError"), "network");
assert(sub.includes("case 401"), "401");

assert(page.includes("mapStaffStockLoadSubtitle"), "uses subtitle mapper");
assert(page.includes("mapStaffStockLoadTitle"), "uses title mapper");
assert(page.includes("staff-stock-error"), "error testid");
assert(page.includes("staff-stock-retry"), "retry");
assert(page.includes("staff-stock-loading"), "loading");
assert(page.includes("showInitialSkeleton"), "skeleton gate");
assert(page.includes("showListChrome"), "list chrome gate");
assert(page.includes("friendly-error"), "FriendlyLoadError chrome");
assert(page.includes("STAFF_STOCK_CACHE_TTL_MS"), "uses TTL");
assert(page.includes("stockListCache"), "cache map");
assert(page.includes("onTouchEnd"), "pull refresh");
assert(page.includes("isReloading"), "isReloading");
assert(page.includes("ListSkeleton") || page.includes("staff-stock-skeleton"), "skeleton");
assert(
  !page.includes("setLoadError(err.message") &&
    !page.includes("setLoadError(err.detail") &&
    !page.includes("setLoadError(STAFF_STOCK_LOAD_FAILED)"),
  "no raw WIRE string error",
);

assert(css.includes("staff-stock-skeleton"), "skeleton css");
assert(css.includes("staff-stock-friendly-error"), "friendly error css");

assert(pkg.includes("test:staff-stock-states"), "package script");

for (const name of [
  "check-staff-stock-scaffold.mjs",
  "check-staff-stock-layout.mjs",
  "check-staff-stock-fields.mjs",
  "check-staff-stock-buttons.mjs",
  "check-staff-stock-wire.mjs",
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
  console.error("Staff stock STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff stock STATES checks PASS");
