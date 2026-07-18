/**
 * Owner /home/activity STATES smoke checks.
 * Run: node scripts/check-home-activity-states.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/home/homeActivityCopy.ts");
assert(existsSync(copyPath), "homeActivityCopy.ts exists");
const copy = readFileSync(copyPath, "utf8");

assert(
  copy.includes("Could not load activity"),
  "HOME_ACTIVITY_LOAD_ERROR",
);
assert(
  copy.includes("No activity in this period"),
  "HOME_ACTIVITY_EMPTY_TITLE",
);
assert(
  copy.includes("Deliveries, purchases, and stock updates appear here."),
  "full-page empty subtitle",
);
assert(
  !copy.includes("Stock updates and purchases will appear here."),
  "must not use compact-feed empty subtitle",
);

const page = readFileSync(
  join(root, "src/features/home/HomeWarehouseActivityPage.tsx"),
  "utf8",
);
assert(page.includes("HomeSectionSkeleton"), "skeleton");
assert(page.includes("rows={8}"), "skeleton rows 8");
assert(page.includes("FriendlyLoadError"), "FriendlyLoadError");
assert(page.includes("HOME_ACTIVITY_LOAD_ERROR"), "load error constant");
assert(page.includes("HOME_RETRY_SUBTITLE"), "Tap to retry");
assert(page.includes("HOME_RETRY_LABEL"), "Retry");
assert(page.includes("HOME_ACTIVITY_EMPTY_TITLE"), "empty title");
assert(page.includes("HOME_ACTIVITY_EMPTY_SUBTITLE"), "empty subtitle");
assert(page.includes("showRefreshBanner"), "refresh banner state");
assert(page.includes("handleRetry"), "retry handler");
assert(page.includes("cachedItems"), "cached items");
assert(page.includes("disabled={loading}"), "chips disabled while loading");
assert(!page.includes("Loading activity"), "no WIRE plain loading copy");
assert(!page.includes("/dashboard?"), "no month dashboard");

const css = readFileSync(
  join(root, "src/features/home/HomeWarehouseActivityPage.css"),
  "utf8",
);
assert(css.includes("home-activity-page__skeleton-bar"), "skeleton CSS");
assert(css.includes("height: 44px"), "skeleton bar height 44");
assert(css.includes("#f1f5f9") || css.includes("#F1F5F9"), "skeleton color");
assert(css.includes("home-activity-page__friendly-error"), "error CSS");
assert(css.includes("home-activity-page__refresh-banner"), "banner CSS");
assert(css.includes("height: 2px"), "banner height 2");

if (failures.length) {
  console.error("Home activity STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home activity STATES checks PASS");
