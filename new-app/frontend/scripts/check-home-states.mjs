/**
 * Owner /home STATES — exact Flutter string match.
 * Run: node scripts/check-home-states.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(root, "src/features/home/homeLoadCopy.ts");
assert(existsSync(copyPath), "homeLoadCopy.ts exists");

const copy = readFileSync(copyPath, "utf8");

const required = [
  ["Loading dashboard…", "HOME_LOADING_DASHBOARD"],
  ["No connection", "HOME_NO_CONNECTION"],
  ["Tap to retry.", "HOME_RETRY_SUBTITLE"],
  ["Session expired", "HOME_SESSION_EXPIRED"],
  [
    "Your sign-in is no longer valid. Tap below to sign in again and load warehouse data.",
    "HOME_SESSION_EXPIRED_SUBTITLE",
  ],
  ["Could not load delivery pipeline", "HOME_DELIVERY_LOAD_ERROR"],
  ["Activity unavailable", "HOME_ACTIVITY_UNAVAILABLE"],
  ["No activity in this period", "HOME_ACTIVITY_EMPTY_TITLE"],
  [
    "Stock updates and purchases will appear here.",
    "HOME_ACTIVITY_EMPTY_SUBTITLE",
  ],
  ["No purchases in period", "HOME_NO_PURCHASES_IN_PERIOD"],
  ["Clear", "HOME_KPI_PENDING_CLEAR"],
];

for (const [literal, name] of required) {
  assert(copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`), name);
}

const home = readFileSync(
  join(root, "src/features/home/HomePage.tsx"),
  "utf8",
);
assert(home.includes("HOME_LOADING_DASHBOARD"), "uses loading copy");
assert(home.includes("HOME_SESSION_EXPIRED"), "uses session expired");
assert(home.includes("HOME_NO_CONNECTION"), "uses no connection");
assert(home.includes("HOME_RETRY_LABEL"), "uses retry label");
assert(home.includes("HOME_ACTIVITY_EMPTY_TITLE"), "uses activity empty");
assert(home.includes("HOME_DELIVERY_LOAD_ERROR"), "uses delivery error");
assert(home.includes("HomeSectionSkeleton"), "skeleton component");
assert(home.includes("FriendlyLoadError"), "friendly error");
assert(home.includes("disabled={loading}"), "chips disabled while loading");
assert(home.includes("showDeliveryPipeline"), "hide empty delivery");
assert(home.includes("onSessionExpiredRetry"), "session retry to login");
assert(home.includes('navigate("/login")'), "session → login");
assert(!home.includes("/dashboard?"), "no month dashboard path");

const css = readFileSync(
  join(root, "src/features/home/HomePage.css"),
  "utf8",
);
assert(css.includes("home-page__skeleton-bar"), "skeleton CSS");
assert(css.includes("height: 44px"), "skeleton bar height 44");
assert(css.includes("#f1f5f9") || css.includes("#F1F5F9"), "skeleton color");

if (failures.length) {
  console.error("Home STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home STATES checks PASS");
