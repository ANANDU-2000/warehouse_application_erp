/**
 * Staff deliveries /staff/deliveries LAYOUT smoke.
 * Run: node scripts/check-staff-deliveries-layout.mjs
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
  "src/features/staff/deliveries/StaffDeliveriesPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/deliveries/StaffDeliveriesPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  page.includes("LAYOUT") ||
    page.includes("SCAFFOLD") ||
    page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE"),
  "step header",
);
assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="section"'), "sections");
assert(page.includes("staff-del-section--highlight"), "highlight class");
assert(page.includes("staff-del-section__title--hot"), "hot title class");
assert(page.includes('data-title-hot'), "title-hot attr");
assert(
  page.includes('data-deferred="scan-barcode"') ||
    page.includes('data-action="scan-barcode"'),
  "scan deferred or BUTTONS",
);
assert(
  page.includes('data-deferred="delivery-rows"') ||
    page.includes("onOpenReceive") ||
    page.includes("staffDeliverySectionsFromRows"),
  "rows deferred or WIRE",
);
assert(
  page.includes("fetchTradePurchasesRecent") || !page.includes("fetch("),
  "no raw fetch unless WIRE",
);
assert(
  !page.includes("onClick") ||
    page.includes("onBack") ||
    page.includes("onScan") ||
    page.includes("onOpenReceive"),
  "click only BUTTONS",
);

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "page bg");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brandPrimary");
assert(css.includes("#0f172a") || css.includes("#0F172A"), "onSurface");
assert(css.includes("#e2e8e6") || css.includes("#E2E8E6"), "brandBorder");
assert(css.includes("#64748b") || css.includes("#64748B"), "muted");
assert(css.includes("#159a8a") || css.includes("#159A8A"), "brandAccent");
assert(css.includes("#e65100") || css.includes("#E65100"), "arrived hot");
assert(css.includes("--sd-gutter: 16px"), "gutter 16");
assert(css.includes("--sd-section-gap: 16px"), "section gap 16");
assert(css.includes("--sd-toolbar: 56px"), "toolbar 56");
assert(css.includes("88px"), "bottom pad 88");
assert(css.includes("rgba(14, 79, 70, 0.1)"), "avatar tint 10%");
assert(css.includes("border-radius: 12px"), "radius 12");
assert(css.includes("padding: 14px"), "empty pad 14");
assert(css.includes("font-size: 11px"), "bags/index 11");
assert(css.includes("font-weight: 800"), "title w800");
assert(css.includes("font-weight: 900"), "index w900");
assert(css.includes("pointer-events: none"), "inert controls");

assert(pkg.includes("test:staff-deliveries-layout"), "package script");

const r = spawnSync(
  process.execPath,
  [join(root, "scripts", "check-staff-deliveries-scaffold.mjs")],
  { cwd: root, encoding: "utf8" },
);
if (r.status !== 0) {
  failures.push("scaffold FAILED");
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
}

if (failures.length) {
  console.error("Staff deliveries LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff deliveries LAYOUT checks PASS");
