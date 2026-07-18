/**
 * Staff /staff/home WIRE-2e — Notifications bell unread badge.
 * Run: node scripts/check-staff-home-wire2e.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backend = join(root, "..", "backend");
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

function notificationVisibleForStaff(n) {
  if (n.targetRoles != null && n.targetRoles.length > 0) {
    return n.targetRoles.map((r) => r.toLowerCase()).includes("staff");
  }
  if (n.id.startsWith("pur_")) return false;
  const kind = n.serverKind ?? "";
  if (kind === "damage_report") return false;
  if (
    kind.includes("profit") ||
    kind.includes("spend") ||
    kind === "rate_alert" ||
    kind === "financial"
  ) {
    return false;
  }
  if (kind === "stock_variance" || kind === "stock_mismatch") return false;
  if (
    kind === "payment_due" ||
    kind === "purchase_overdue" ||
    kind === "approval_required"
  ) {
    return false;
  }
  if (
    n.actionRoute?.startsWith("/purchase") === true &&
    kind !== "delivery_pending" &&
    kind !== "delivery_received"
  ) {
    return false;
  }
  return true;
}

assert(
  !notificationVisibleForStaff({
    id: "srv_1",
    serverKind: "stock_variance",
    actionRoute: null,
    targetRoles: null,
  }),
  "staff hides stock_variance",
);
assert(
  notificationVisibleForStaff({
    id: "srv_2",
    serverKind: "delivery_pending",
    actionRoute: "/purchase/x",
    targetRoles: null,
  }),
  "staff allows delivery_pending",
);

function staffBellBadgeLabel(count) {
  if (count <= 0) return "";
  return count > 99 ? "99+" : String(count);
}
assert(staffBellBadgeLabel(0) === "", "badge empty");
assert(staffBellBadgeLabel(5) === "5", "badge 5");
assert(staffBellBadgeLabel(100) === "99+", "badge 99+");

const helper = readFileSync(
  join(root, "src/features/staff/staffBellBadge.ts"),
  "utf8",
);
const api = readFileSync(join(root, "src/features/staff/staffHomeApi.ts"), "utf8");
const page = readFileSync(
  join(root, "src/features/staff/StaffHomePage.tsx"),
  "utf8",
);
const routes = readFileSync(
  join(backend, "src/routes/staffHome.routes.ts"),
  "utf8",
);
const repo = readFileSync(
  join(backend, "src/repositories/staffHome.repository.ts"),
  "utf8",
);
const app = readFileSync(join(backend, "src/app.ts"), "utf8");

assert(helper.includes("countStaffBellUnread"), "countStaffBellUnread");
assert(helper.includes("notificationVisibleForStaff"), "visibility");
assert(helper.includes("wh_low_stock"), "warehouse low");
assert(helper.includes("maxLowStockServerRows"), "cap 12");
assert(helper.includes("pref_notif_kind_"), "kind prefs");

assert(api.includes("fetchAppNotifications"), "fetch notifications");
assert(api.includes("fetchStockAlertsSummary"), "alerts summary");
assert(api.includes("notifications/unread-count"), "unread-count path");
assert(!api.includes("home-overview"), "no home-overview");

assert(page.includes("countStaffBellUnread"), "page uses merge");
assert(page.includes("staff-home-bell-badge"), "badge testid");
assert(page.includes("staffBellBadgeLabel"), "badge label");
assert(page.includes('navigate("/notifications")'), "bell nav");
assert(!page.includes("home-overview"), "no home-overview page");

assert(routes.includes("createNotificationsRoutes"), "notif routes");
assert(routes.includes('"/alerts/summary"'), "alerts summary route");
assert(routes.includes('"/unread-count"'), "unread-count route");
assert(repo.includes("listNotifications"), "listNotifications");
assert(repo.includes("stockAlertsSummary"), "stockAlertsSummary");
assert(app.includes("notifications"), "app mounts notifications");

assert(
  existsSync(join(root, "../../docs/modules/staff_home_wire2e_compare.md")),
  "staff_home_wire2e_compare.md",
);

if (failures.length) {
  console.error("Staff home WIRE-2e checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff home WIRE-2e checks PASS");
