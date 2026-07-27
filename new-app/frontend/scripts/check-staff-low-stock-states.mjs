/**
 * Staff low stock /staff/low-stock STATES smoke.
 * Run: node scripts/check-staff-low-stock-states.mjs
 * Source: CircularProgressIndicator + 10s slow · FriendlyLoadError · RefreshIndicator
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
const subPath = join(
  root,
  "src/features/staff/lowStock/staffLowStockLoadSubtitle.ts",
);
const pagePath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/lowStock/StaffLowStockPage.css",
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

assert(
  copy.includes('STAFF_LS_LOAD_FAILED = "Could not load low stock"'),
  "exact title",
);
assert(
  copy.includes('STAFF_LS_RETRY_SUBTITLE = "Tap to retry."'),
  "Tap to retry",
);
assert(
  copy.includes('STAFF_LS_SLOW_LOAD = "Taking longer than usual"'),
  "slow load",
);
assert(copy.includes('STAFF_LS_REFRESH = "Refresh"'), "Refresh");
assert(copy.includes("STAFF_LS_LOAD_SLOW_MS = 10_000"), "10s");
assert(
  copy.includes("No connection. Check your network and try again."),
  "no connection",
);
assert(copy.includes("Session expired. Please log in again."), "401 sub");

assert(sub.includes("mapStaffLsLoadTitle"), "title mapper");
assert(sub.includes("mapStaffLsLoadSubtitle"), "subtitle mapper");
assert(sub.includes("STAFF_LS_SUBTITLE_NO_CONNECTION"), "net sub");
assert(sub.includes("StaffLsNetworkError"), "network");
assert(sub.includes("return STAFF_LS_LOAD_FAILED"), "fixed title");

assert(page.includes("showDataChrome"), "data chrome gate");
assert(page.includes("showInitialLoading"), "loading gate");
assert(page.includes("showError"), "error gate");
assert(page.includes("loadTimedOut"), "slow timer state");
assert(page.includes("STAFF_LS_LOAD_SLOW_MS"), "uses slow ms");
assert(page.includes("STAFF_LS_SLOW_LOAD"), "slow copy");
assert(page.includes("onTouchEnd"), "pull refresh");
assert(page.includes("onPullTouchEnd"), "pull handler");
assert(page.includes("staff-ls-friendly-error"), "FriendlyLoadError chrome");
assert(page.includes("staff-ls-spinner"), "spinner");
assert(page.includes("CircularProgressIndicator"), "spinner aria");
assert(page.includes("mapStaffLsLoadTitle"), "uses title");
assert(page.includes("mapStaffLsLoadSubtitle"), "uses subtitle");
assert(page.includes('data-testid="staff-ls-retry"'), "retry testid");
assert(
  !page.includes("Could not load low stock items"),
  "no WIRE wrong title",
);

assert(css.includes("staff-ls-spinner"), "spinner css");
assert(css.includes("staff-ls-friendly-error"), "friendly css");
assert(css.includes("staff-ls-slow"), "slow css");

assert(pkg.includes("test:staff-low-stock-states"), "package script");

for (const name of [
  "check-staff-low-stock-scaffold.mjs",
  "check-staff-low-stock-layout.mjs",
  "check-staff-low-stock-fields.mjs",
  "check-staff-low-stock-buttons.mjs",
  "check-staff-low-stock-wire.mjs",
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
  console.error("Staff low-stock STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff low-stock STATES checks PASS");
