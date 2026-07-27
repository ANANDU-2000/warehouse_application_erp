/**
 * Owner /home BUTTONS smoke checks.
 * Run: node scripts/check-home-buttons.mjs
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
  existsSync(join(root, "src/features/home/HomePage.tsx")),
  "HomePage exists",
);
assert(
  existsSync(join(root, "src/features/home/homeOwnerTools.ts")),
  "homeOwnerTools exists",
);
assert(
  existsSync(join(root, "src/features/home/DashboardRouteStubPage.tsx")),
  "stub page exists",
);

const home = readFileSync(
  join(root, "src/features/home/HomePage.tsx"),
  "utf8",
);
assert(home.includes("useNavigate"), "uses navigate");
assert(home.includes('navigate("/notifications")'), "bell CTA");
assert(home.includes('navigate("/settings")'), "settings CTA");
assert(home.includes("HOME_OWNER_TOOLS"), "tools grid");
assert(home.includes("View all"), "activity view all");
assert(home.includes('navigate("/home/activity")'), "activity path");
assert(home.includes("HOME_OWNER_TOOLS"), "tools still present");

const tools = readFileSync(
  join(root, "src/features/home/homeOwnerTools.ts"),
  "utf8",
);
assert(tools.includes('"Purchase"'), "Purchase tool");
assert(tools.includes('"Stock"'), "Stock tool");
assert(tools.includes('"Low stock"'), "Low stock tool");
assert(tools.includes('"Deliveries"'), "Deliveries tool");
assert(tools.includes('"Reports"'), "Reports tool");
assert(tools.includes('"Users"'), "Users tool");
assert(tools.includes('"Scan"'), "Scan tool");
assert(tools.includes('"Reorder"'), "Reorder tool");
assert(tools.includes('"Daily log"'), "Daily log tool");
assert(tools.includes("/purchase/new"), "purchase new path");
assert(tools.includes("/stock/low-stock"), "low stock path");
assert(tools.includes("/barcode/scan"), "scan path");

const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");
assert(router.includes("DashboardRouteStubPage"), "stub in router");
assert(router.includes('path="/notifications"'), "notifications route");
assert(router.includes('path="/settings"'), "settings route");
assert(router.includes('path="/home/activity"'), "activity route");
assert(router.includes('path="/purchase/new"'), "purchase new route");
assert(router.includes('path="/barcode/scan"'), "scan route");

if (failures.length) {
  console.error("Home BUTTONS checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home BUTTONS checks PASS");
