/**
 * Staff /staff/home SCAFFOLD smoke checks.
 * Run: node scripts/check-staff-home-scaffold.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const pagePath = join(root, "src/features/staff/StaffHomePage.tsx");
assert(existsSync(pagePath), "StaffHomePage exists");

const page = readFileSync(pagePath, "utf8");
const slots = [
  "greeting",
  "floor-kpis",
  "warehouse",
  "pending-deliveries",
  "shift-today",
  "tools",
  "quick-actions",
  "scan-cta",
  "needs-attention",
  "recent-activity",
];
for (const slot of slots) {
  assert(
    page.includes(`slot: "${slot}"`) || page.includes(`data-slot="${slot}"`),
    `slot ${slot}`,
  );
}
assert(!page.includes("fetch("), "no fetch");
assert(!page.includes("home-overview"), "no home-overview");
assert(!page.includes("useEffect"), "no boot effects");

const css = readFileSync(
  join(root, "src/features/staff/StaffHomePage.css"),
  "utf8",
);
assert(css.includes("560px") || css.includes("max-width: 560"), "max width 560");

const router = readFileSync(join(root, "src/app/router.tsx"), "utf8");
assert(router.includes("StaffHomePage"), "router imports StaffHomePage");
assert(router.includes('path="/staff/home"'), "staff home route");
assert(!router.includes("StaffHomeStubPage"), "stub replaced");

if (failures.length) {
  console.error("Staff home SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home SCAFFOLD checks PASS");
