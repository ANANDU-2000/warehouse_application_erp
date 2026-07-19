/**
 * Staff purchase history /staff/purchase-history LAYOUT smoke.
 * Run: node scripts/check-staff-purchase-history-layout.mjs
 * Source: staff_purchase_history_page.dart · StaffPurchaseHistoryRow · HexaColors
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

const pagePath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/purchaseHistory/StaffPurchaseHistoryPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="tabs"'), "tabs");
assert(page.includes('data-slot="statusChips"'), "statusChips");
assert(page.includes('data-slot="search"'), "search");
assert(page.includes('data-slot="results"'), "results");
assert(page.includes('data-slot="empty"'), "empty");
assert(page.includes('data-slot="list"'), "list");
assert(page.includes("staff-ph-chip--all"), "chip all mod");
assert(page.includes("staff-ph-chip--pending"), "chip pending mod");
assert(page.includes("staff-ph-chip--delivered"), "chip delivered mod");
assert(page.includes("staff-ph-chip--critical"), "chip critical mod");
assert(page.includes("staff-ph-tabs--inert"), "tabs inert class");
assert(page.includes("staff-ph-search--inert"), "search inert class");
assert(page.includes("readOnly"), "search inert");
assert(page.includes("STAFF_PH_EMPTY_PERIOD"), "empty copy");

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "page bg F7F9F6");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brandPrimary");
assert(css.includes("#e2e8e6") || css.includes("#E2E8E6"), "brandBorder");
assert(css.includes("#9ca3af") || css.includes("#9CA3AF"), "hint");
assert(css.includes("#64748b") || css.includes("#64748B"), "muted");
assert(css.includes("#0d9488") || css.includes("#0D9488"), "pack teal");
assert(css.includes("#f0a500") || css.includes("#F0A500"), "warning");
assert(css.includes("#dc2626") || css.includes("#DC2626"), "critical");
assert(css.includes("#159a8a") || css.includes("#159A8A"), "brandAccent");
assert(css.includes("--sph-gutter: 12px"), "gutter 12");
assert(css.includes("border-radius: 10px"), "search radius 10");
assert(css.includes("min-height: 56px"), "appBar 56");
assert(css.includes("min-height: 48px"), "tab bar 48");
assert(css.includes("min-height: 40px"), "search 40");
assert(css.includes("min-height: 72px"), "row min 72");
assert(css.includes("font-size: 20px"), "title 20");
assert(css.includes("font-size: 11px"), "chip 11");
assert(css.includes("gap: 6px"), "chip gap 6");
assert(css.includes("pointer-events: none"), "inert chrome");
assert(css.includes("staff-ph-row"), "row chrome");
assert(css.includes("staff-ph-date-header"), "date header");
assert(css.includes("staff-ph-status-chip"), "status chip");
assert(css.includes("staff-ph-low-row"), "low row");
assert(css.includes("--sph-list-pad-bottom: 88px"), "list pad 88");

assert(pkg.includes("test:staff-purchase-history-layout"), "layout script");
assert(pkg.includes("test:staff-purchase-history-scaffold"), "scaffold script");

const scaffold = spawnSync(
  process.execPath,
  [join(root, "scripts/check-staff-purchase-history-scaffold.mjs")],
  { cwd: root, encoding: "utf8" },
);
if (scaffold.status !== 0) {
  failures.push("scaffold smoke FAILED");
  if (scaffold.stdout) process.stdout.write(scaffold.stdout);
  if (scaffold.stderr) process.stderr.write(scaffold.stderr);
}

if (failures.length) {
  console.error("Staff purchase-history LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff purchase-history LAYOUT checks PASS");
