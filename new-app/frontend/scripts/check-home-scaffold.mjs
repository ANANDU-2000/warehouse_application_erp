/**
 * Owner /home SCAFFOLD smoke checks.
 * Run: node scripts/check-home-scaffold.mjs
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

const home = readFileSync(
  join(root, "src/features/home/HomePage.tsx"),
  "utf8",
);
assert(home.includes('data-slot="compact-header"'), "header slot");
assert(home.includes('data-slot="sticky-period"'), "period slot");
assert(
  home.includes('data-slot="alerts"') || home.includes('slot="alerts"'),
  "alerts slot",
);
assert(
  home.includes('data-slot="kpi-grid"') || home.includes('slot="kpi-grid"'),
  "kpi slot",
);
assert(
  home.includes('data-slot="delivery"') || home.includes('slot="delivery"'),
  "delivery slot",
);
assert(
  home.includes('data-slot="purchase-center"') ||
    home.includes('slot="purchase-center"'),
  "purchase slot",
);
assert(
  home.includes('data-slot="tools"') || home.includes('slot="tools"'),
  "tools slot",
);
assert(
  home.includes('data-slot="activity"') || home.includes('slot="activity"'),
  "activity slot",
);
assert(!home.includes("fetch("), "no fetch");
assert(!home.includes("home-overview"), "no home-overview");
assert(!home.includes("useEffect"), "no boot effects");

const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");
assert(router.includes("HomePage"), "router imports HomePage");
assert(router.includes('path="/home"'), "home route");
assert(router.includes("StaffHomeStubPage"), "staff stub kept");

const css = readFileSync(
  join(root, "src/features/home/HomePage.css"),
  "utf8",
);
assert(
  css.includes("#f5f7f6") ||
    css.includes("#F5F7F6") ||
    css.includes("#f7f9f6") ||
    css.includes("#F7F9F6"),
  "scaffold bg",
);

if (failures.length) {
  console.error("Home SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home SCAFFOLD checks PASS");
