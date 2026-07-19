/**
 * Staff activity /staff/activity WIRE smoke.
 * Run: node scripts/check-staff-activity-wire.mjs
 * Source: staffActivityLogProvider · listActivityLog · labels/_timeAgo
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

const apiPath = join(
  root,
  "src/features/staff/activity/staffActivityApi.ts",
);
const fmtPath = join(
  root,
  "src/features/staff/activity/staffActivityFormat.ts",
);
const pagePath = join(
  root,
  "src/features/staff/activity/StaffActivityPage.tsx",
);
const repoPath = join(
  root,
  "../backend/src/repositories/staffHome.repository.ts",
);
const routesPath = join(
  root,
  "../backend/src/routes/staffHome.routes.ts",
);
const controllerPath = join(
  root,
  "../backend/src/controllers/staffHome.controller.ts",
);
const appPath = join(root, "../backend/src/app.ts");
const pkgPath = join(root, "package.json");

assert(existsSync(apiPath), "api exists");
assert(existsSync(fmtPath), "format exists");
assert(existsSync(pagePath), "page exists");
assert(existsSync(repoPath), "repo exists");
assert(existsSync(routesPath), "routes exist");
assert(existsSync(controllerPath), "controller exists");
assert(existsSync(appPath), "app exists");

const api = readFileSync(apiPath, "utf8");
const fmt = readFileSync(fmtPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const repo = readFileSync(repoPath, "utf8");
const routes = readFileSync(routesPath, "utf8");
const controller = readFileSync(controllerPath, "utf8");
const app = readFileSync(appPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(api.includes("fetchStaffActivityLog"), "fetch fn");
assert(api.includes("/activity-log"), "activity-log path");
assert(api.includes("STAFF_ACT_PER_PAGE = 50"), "per_page 50");
assert(api.includes("STAFF_ACT_PAGE = 1"), "page 1");
assert(api.includes("period"), "period query");

assert(fmt.includes("staffActLabel"), "label");
assert(fmt.includes("STAFF_LOGIN"), "login label");
assert(fmt.includes("PURCHASE_CREATE"), "purchase label");
assert(fmt.includes("BARCODE_SCAN"), "scan label");
assert(fmt.includes("staffActTimeAgo"), "timeAgo");
assert(fmt.includes("d ago"), "days ago branch");
assert(fmt.includes("staffActWhenStamp"), "when stamp");
assert(fmt.includes("staffActRowKind"), "row kind");

assert(page.includes("WIRE"), "WIRE header");
assert(page.includes("fetchStaffActivityLog"), "page fetch");
assert(page.includes("staffActLabel") || page.includes("mapRows"), "labels used");
assert(page.includes('data-slot="loading"'), "loading");
assert(page.includes('data-slot="error"'), "error");
assert(page.includes("retryLoad"), "retry");
assert(page.includes("STAFF_ACT_LOAD_FAILED"), "load failed");
assert(page.includes('data-interactive="false"'), "rows not interactive");
assert(!page.includes('data-deferred="activity-rows"'), "rows not deferred");
assert(page.includes("setPeriod"), "period still FIELDS");
assert(page.includes("onBack"), "back still BUTTONS");

assert(repo.includes("listActivityLog"), "repo listActivityLog");
assert(controller.includes("listActivityLog"), "ctrl listActivityLog");
assert(routes.includes("createActivityLogRoutes") || routes.includes("listActivityLog"), "routes");
assert(app.includes("activity-log"), "app mounts activity-log");

assert(pkg.includes("test:staff-activity-wire"), "wire script");

/* Label parity unit checks (mirror staff_activity_page.dart) */
function staffActLabel(actionType) {
  switch (actionType.toUpperCase()) {
    case "STAFF_LOGIN":
      return "Signed in";
    case "STAFF_LOGOUT":
      return "Signed out";
    case "PURCHASE_CREATE":
      return "Purchase saved";
    case "SCAN":
    case "BARCODE_SCAN":
      return "Barcode scan";
    default:
      return actionType.replaceAll("_", " ");
  }
}
assert(staffActLabel("STAFF_LOGIN") === "Signed in", "label login");
assert(staffActLabel("PURCHASE_CREATE") === "Purchase saved", "label purchase");
assert(staffActLabel("BARCODE_SCAN") === "Barcode scan", "label scan");
assert(staffActLabel("FOO_BAR") === "FOO BAR", "label default");

function staffActTimeAgo(at, now) {
  const ms = now.getTime() - at.getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return at.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
const now = new Date("2026-07-19T12:00:00Z");
assert(
  staffActTimeAgo(new Date("2026-07-19T11:59:30Z"), now) === "just now",
  "ago just now",
);
assert(
  staffActTimeAgo(new Date("2026-07-19T11:45:00Z"), now) === "15m ago",
  "ago minutes",
);
assert(
  staffActTimeAgo(new Date("2026-07-17T12:00:00Z"), now) === "2d ago",
  "ago days",
);

for (const name of [
  "check-staff-activity-scaffold.mjs",
  "check-staff-activity-layout.mjs",
  "check-staff-activity-fields.mjs",
  "check-staff-activity-buttons.mjs",
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
  console.error("Staff activity WIRE checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff activity WIRE checks PASS");
