/**
 * Staff deliveries /staff/deliveries SCAFFOLD smoke.
 * Run: node scripts/check-staff-deliveries-scaffold.mjs
 * Source: staff_pending_deliveries_page.dart
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const copyPath = join(
  root,
  "src/features/staff/deliveries/staffDeliveriesCopy.ts",
);
const pagePath = join(
  root,
  "src/features/staff/deliveries/StaffDeliveriesPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/deliveries/StaffDeliveriesPage.css",
);
const routerPath = join(root, "src/app/router.tsx");
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const copy = readFileSync(copyPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(copy.includes('STAFF_DEL_TITLE = "Pending deliveries"'), "title");
assert(
  copy.includes('STAFF_DEL_BACK_FALLBACK = "/staff/home"'),
  "back fallback",
);
assert(copy.includes('STAFF_DEL_SCAN_TOOLTIP = "Scan purchase"'), "scan tip");
assert(copy.includes('STAFF_DEL_SECTION_DISPATCHED = "Dispatched"'), "dispatched");
assert(copy.includes('STAFF_DEL_SECTION_ARRIVED = "Arrived"'), "arrived");
assert(
  copy.includes('STAFF_DEL_SECTION_PENDING_VERIFY = "Pending verification"'),
  "pending verify",
);
assert(
  copy.includes('STAFF_DEL_EMPTY_DISPATCHED = "No dispatches in transit."'),
  "empty dispatched",
);
assert(
  copy.includes('STAFF_DEL_EMPTY_ARRIVED = "Nothing waiting at the warehouse."'),
  "empty arrived",
);
assert(
  copy.includes("No purchases awaiting owner commit."),
  "empty pending",
);
assert(
  copy.includes('STAFF_DEL_EMPTY_ALL = "No pending deliveries right now."'),
  "empty all",
);
assert(
  copy.includes('STAFF_DEL_LOAD_FAILED = "Could not load pending deliveries"'),
  "load failed",
);

assert(
  page.includes("SCAFFOLD") ||
    page.includes("LAYOUT") ||
    page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE"),
  "SCAFFOLD+ header",
);
assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="section"'), "sections");
assert(
  page.includes('data-section={sec.key}') ||
    page.includes("data-section={key}") ||
    page.includes("STAFF_DEL_SECTION_ORDER"),
  "section key binding",
);
assert(
  page.includes('"dispatched"') ||
    page.includes("dispatched") ||
    page.includes("STAFF_DEL_SECTION_ORDER"),
  "dispatched section",
);
assert(
  page.includes('"arrived"') ||
    page.includes("arrived") ||
    page.includes("STAFF_DEL_SECTION_ORDER"),
  "arrived section",
);
assert(
  page.includes('"pendingVerify"') ||
    page.includes("pendingVerify") ||
    page.includes("STAFF_DEL_SECTION_ORDER"),
  "pending section",
);
assert(page.includes('data-slot="emptyAll"'), "empty all");
assert(page.includes('data-deferred="scan-barcode"') || page.includes('data-action="scan-barcode"'), "scan slot");
assert(
  page.includes('data-deferred="delivery-rows"') ||
    page.includes("onOpenReceive") ||
    page.includes("staffDeliverySectionsFromRows"),
  "rows deferred or WIRE",
);
assert(page.includes('data-deferred="back"') || page.includes('data-action="back"'), "back slot");
assert(page.includes("STAFF_DEL_EMPTY_ALL"), "empty copy");
assert(
  page.includes("fetchTradePurchasesRecent") || !page.includes("fetch("),
  "no raw fetch unless WIRE",
);
assert(
  page.includes("onClick") === false ||
    page.includes("onBack") ||
    page.includes("onScan") ||
    page.includes("onOpenReceive"),
  "click only via BUTTONS handlers",
);

assert(css.includes("staff-del-page"), "page css");
assert(css.includes("staff-del-section"), "section css");
assert(css.includes("staff-del-empty-all"), "empty css");

assert(router.includes("StaffDeliveriesPage"), "router import");
assert(router.includes('path="/staff/deliveries"'), "route");
assert(!router.includes('title="Staff deliveries"'), "no stub title");

assert(pkg.includes("test:staff-deliveries-scaffold"), "package script");

if (failures.length) {
  console.error("Staff deliveries SCAFFOLD checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff deliveries SCAFFOLD checks PASS");
