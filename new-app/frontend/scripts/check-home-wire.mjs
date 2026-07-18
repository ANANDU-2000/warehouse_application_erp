/**
 * Owner /home WIRE smoke checks.
 * Run: node scripts/check-home-wire.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

assert(
  existsSync(join(root, "src/features/home/homeOverviewApi.ts")),
  "homeOverviewApi exists",
);
assert(
  existsSync(join(root, "src/shared/auth/sessionStore.ts")),
  "sessionStore exists",
);

const api = readFileSync(
  join(root, "src/features/home/homeOverviewApi.ts"),
  "utf8",
);
assert(api.includes("reports/home-overview"), "home-overview path");
assert(api.includes("shell_bundle"), "shell_bundle");
assert(api.includes("compact"), "compact");
assert(!api.includes("/dashboard?"), "no month dashboard UI call");

const period = readFileSync(
  join(root, "src/features/home/homePeriod.ts"),
  "utf8",
);
assert(period.includes("homePeriodApiDates"), "api dates helper");

const home = readFileSync(
  join(root, "src/features/home/HomePage.tsx"),
  "utf8",
);
assert(home.includes("fetchHomeOverview"), "calls overview");
assert(home.includes("useEffect"), "fetch effect");
assert(home.includes("homePeriodApiDates"), "uses api dates");
assert(home.includes("Loading dashboard"), "minimal loading");
assert(!home.includes("/dashboard?"), "no dashboard month path");

const login = readFileSync(
  join(root, "src/features/auth/LoginPage.tsx"),
  "utf8",
);
assert(login.includes("writePrimaryBusiness"), "login writes business");
assert(login.includes("clearPrimaryBusiness"), "login clears business");

if (failures.length) {
  console.error("Home WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home WIRE checks PASS");
