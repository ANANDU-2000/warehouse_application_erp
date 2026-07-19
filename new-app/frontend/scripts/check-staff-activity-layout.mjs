/**
 * Staff activity /staff/activity LAYOUT smoke.
 * Run: node scripts/check-staff-activity-layout.mjs
 * Source: staff_activity_page.dart · HexaColors · HexaDsLayout
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
  "src/features/staff/activity/StaffActivityPage.tsx",
);
const cssPath = join(
  root,
  "src/features/staff/activity/StaffActivityPage.css",
);
const pkgPath = join(root, "package.json");

assert(existsSync(pagePath), "page exists");
assert(existsSync(cssPath), "css exists");

const page = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

assert(
  page.includes("LAYOUT") ||
    page.includes("FIELDS") ||
    page.includes("BUTTONS") ||
    page.includes("WIRE") ||
    page.includes("SCAFFOLD"),
  "step header",
);
assert(page.includes('data-slot="appBar"'), "appBar");
assert(page.includes('data-slot="periods"'), "periods");
assert(page.includes('data-slot="empty"'), "empty");
assert(page.includes('data-slot="emptyIcon"'), "empty icon");
assert(page.includes("staff-act-periods--inert") || page.includes("staff-act-periods--active"), "periods class");
assert(
  page.includes('data-kind="history"') ||
    page.includes("staff-act-row__avatar--history") ||
    css.includes("staff-act-row__avatar--history"),
  "history row chrome",
);
assert(
  page.includes('data-kind="purchase"') ||
    page.includes("staff-act-row__avatar--purchase") ||
    css.includes("staff-act-row__avatar--purchase"),
  "purchase row chrome",
);
assert(
  page.includes("staff-act-row__avatar--history") ||
    css.includes("staff-act-row__avatar--history"),
  "history avatar",
);
assert(
  page.includes("staff-act-row__avatar--purchase") ||
    css.includes("staff-act-row__avatar--purchase"),
  "purchase avatar",
);
assert(
  page.includes("disabled") || page.includes("setPeriod") || page.includes("data-action=\"select-period\""),
  "period control present (FIELDS may activate)",
);
assert(
  page.includes("fetchStaffActivityLog") || !page.includes("fetch("),
  "no raw fetch unless WIRE",
);

assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "page bg");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brandPrimary");
assert(css.includes("#0f172a") || css.includes("#0F172A"), "onSurface");
assert(css.includes("#e2e8e6") || css.includes("#E2E8E6"), "brandBorder");
assert(css.includes("#64748b") || css.includes("#64748B"), "muted");
assert(css.includes("#159a8a") || css.includes("#159A8A"), "brandAccent");
assert(css.includes("#065f46") || css.includes("#065F46"), "tab selected");
assert(css.includes("#f1f5f4") || css.includes("#F1F5F4"), "tab bg");
assert(css.includes("#334155"), "tab fg");
assert(css.includes("24px") || css.includes("--sa-gutter: 24"), "gutter 24");
assert(css.includes("--sa-toolbar: 56px"), "toolbar 56");
assert(css.includes("rgba(14, 79, 70, 0.12)"), "avatar tint");
assert(css.includes("pointer-events: none"), "inert pointer");
assert(css.includes("font-weight: 800"), "title w800");
assert(css.includes("font-size: 20px"), "title 20");

assert(pkg.includes("test:staff-activity-layout"), "package script");

const r = spawnSync(
  process.execPath,
  [join(root, "scripts", "check-staff-activity-scaffold.mjs")],
  { cwd: root, encoding: "utf8" },
);
if (r.status !== 0) {
  failures.push("scaffold FAILED");
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
}

if (failures.length) {
  console.error("Staff activity LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff activity LAYOUT checks PASS");
