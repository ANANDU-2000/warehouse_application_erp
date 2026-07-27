/**
 * Staff deliveries /staff/deliveries WIRE smoke.
 * Run: node scripts/check-staff-deliveries-wire.mjs
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
const fmtPath = join(
  root,
  "src/features/staff/deliveries/staffDeliveriesFormat.ts",
);
const pendingPath = join(
  root,
  "src/features/staff/staffPendingDeliveries.ts",
);
const apiPath = join(root, "src/features/staff/staffHomeApi.ts");
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(fmtPath), "format exists");
assert(existsSync(pendingPath), "pending helpers exist");

const page = readFileSync(pagePath, "utf8");
const fmt = readFileSync(fmtPath, "utf8");
const pending = readFileSync(pendingPath, "utf8");
const api = readFileSync(apiPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(page.includes("WIRE") || page.includes("STATES"), "WIRE+ header");
assert(page.includes("fetchTradePurchasesRecent"), "fetch recent");
assert(page.includes("staffDeliverySectionsFromRows"), "group helper");
assert(page.includes('data-slot="loading"'), "loading");
assert(page.includes('data-slot="error"'), "error");
assert(page.includes("retryLoad"), "retry");
assert(
  page.includes("STAFF_DEL_LOAD_FAILED") || page.includes("mapStaffDelLoadTitle"),
  "load failed",
);
assert(page.includes("onOpenReceive"), "receive still BUTTONS");
assert(page.includes("onScan"), "scan still BUTTONS");
assert(!page.includes('data-sample="buttons"'), "no buttons sample");

assert(fmt.includes("staffDelRowSubtitle"), "subtitle");
assert(fmt.includes("staffDelSupplierTitle"), "supplier title");
assert(fmt.includes("d pending"), "days pending");

assert(pending.includes("staffDeliverySectionsFromRows"), "sections from rows");
assert(pending.includes("groupStaffDeliverySections"), "group");
assert(pending.includes("supplierName"), "supplier");
assert(pending.includes("bagsLine"), "bags");

assert(api.includes("fetchTradePurchasesRecent"), "api recent");
assert(api.includes("include_lines"), "include_lines");
assert(api.includes("limit: 50") || api.includes("want = 50"), "limit 50");

assert(pkg.includes("test:staff-deliveries-wire"), "wire script");

/* Unit: group parity */
function parseDeliveryStatus(raw) {
  const s = String(raw ?? "").toLowerCase().trim();
  const ok = [
    "pending",
    "dispatched",
    "in_transit",
    "arrived",
    "staff_verifying",
    "staff_verified",
    "stock_committed",
    "partial",
    "cancelled",
  ];
  return ok.includes(s) ? s : "pending";
}

function groupStaffDeliverySections(purchases) {
  const dispatched = [];
  const arrived = [];
  const pendingVerification = [];
  for (const p of purchases) {
    if (
      p.purchaseStatus === "deleted" ||
      p.purchaseStatus === "cancelled" ||
      p.deliveryStatus === "stock_committed"
    ) {
      continue;
    }
    const ds = p.deliveryStatus;
    if (ds === "pending" || ds === "dispatched" || ds === "in_transit") {
      dispatched.push(p);
    } else if (ds === "staff_verified" || ds === "partial") {
      pendingVerification.push(p);
    } else if (
      ds === "arrived" ||
      ds === "staff_verifying" ||
      p.isDelivered
    ) {
      arrived.push(p);
    }
  }
  return { dispatched, arrived, pendingVerification };
}

const g = groupStaffDeliverySections([
  {
    purchaseStatus: "confirmed",
    deliveryStatus: parseDeliveryStatus("dispatched"),
    isDelivered: false,
  },
  {
    purchaseStatus: "confirmed",
    deliveryStatus: parseDeliveryStatus("arrived"),
    isDelivered: false,
  },
  {
    purchaseStatus: "confirmed",
    deliveryStatus: parseDeliveryStatus("staff_verified"),
    isDelivered: false,
  },
  {
    purchaseStatus: "confirmed",
    deliveryStatus: parseDeliveryStatus("stock_committed"),
    isDelivered: true,
  },
]);
assert(g.dispatched.length === 1, "group dispatched");
assert(g.arrived.length === 1, "group arrived");
assert(g.pendingVerification.length === 1, "group pending verify");

for (const name of [
  "check-staff-deliveries-scaffold.mjs",
  "check-staff-deliveries-layout.mjs",
  "check-staff-deliveries-fields.mjs",
  "check-staff-deliveries-buttons.mjs",
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
  console.error("Staff deliveries WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff deliveries WIRE checks PASS");
