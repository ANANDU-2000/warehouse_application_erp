/**
 * Owner /home LAYOUT smoke checks.
 * Run: node scripts/check-home-layout.mjs
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
assert(home.includes("Warehouse"), "header title");
assert(home.includes("Synced"), "sync label");
assert(home.includes("OWNER"), "role chip");
assert(home.includes("home-page__card"), "card sections");
assert(home.includes('data-slot="compact-header"'), "header slot");
assert(!home.includes("fetch("), "no fetch");
assert(!home.includes("useNavigate"), "no navigate");

const css = readFileSync(
  join(root, "src/features/home/HomePage.css"),
  "utf8",
);
assert(css.includes("height: 48px") || css.includes("min-height: 48px"), "header 48");
assert(css.includes("#0e4f46") || css.includes("#0E4F46"), "brand primary");
assert(css.includes("#2e7d32") || css.includes("#2E7D32"), "sync green");
assert(css.includes("border-radius: 12px"), "card radius 12");
assert(css.includes("#f7f9f6") || css.includes("#F7F9F6"), "page bg");

if (failures.length) {
  console.error("Home LAYOUT checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Home LAYOUT checks PASS");
