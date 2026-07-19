/**
 * Staff item gallery /staff/items STATES smoke.
 * Run: node scripts/check-staff-items-states.mjs
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

const copyPath = join(
  root,
  "src/features/staff/items/staffItemGalleryCopy.ts",
);
const subPath = join(
  root,
  "src/features/staff/items/staffItemGalleryLoadSubtitle.ts",
);
const pagePath = join(
  root,
  "src/features/staff/items/StaffItemGalleryPage.tsx",
);
const pkgPath = join(root, "package.json");

assert(existsSync(copyPath), "copy exists");
assert(existsSync(subPath), "load subtitle exists");
assert(existsSync(pagePath), "page exists");

const copy = readFileSync(copyPath, "utf8");
const sub = readFileSync(subPath, "utf8");
const page = readFileSync(pagePath, "utf8");
const pkg = readFileSync(pkgPath, "utf8");

const required = [
  ["Could not load items", "FAILED"],
  ["Tap to retry.", "RETRY_SUB"],
  ["Retry", "RETRY_BTN"],
  ["Session expired. Please log in again.", "401"],
  ["No connection. Check your network and try again.", "NET"],
  ["Server error. Please try again shortly.", "5XX"],
];

for (const [literal, name] of required) {
  assert(
    copy.includes(`"${literal}"`) || copy.includes(`'${literal}'`),
    name,
  );
}

assert(copy.includes("STAFF_GALLERY_CACHE_TTL_MS = 180_000"), "3m TTL");
assert(sub.includes("mapStaffGalleryLoadSubtitle"), "subtitle mapper");
assert(sub.includes("StaffGalleryNetworkError"), "network");
assert(sub.includes("case 401"), "401");

assert(page.includes("mapStaffGalleryLoadSubtitle"), "uses mapper");
assert(page.includes("staff-gallery-error"), "error testid");
assert(page.includes("staff-gallery-retry"), "retry");
assert(page.includes("staff-gallery-loading"), "loading");
assert(page.includes("showData"), "data gate");
assert(page.includes("friendly-error"), "FriendlyLoadError chrome");
assert(page.includes("STAFF_GALLERY_CACHE_TTL_MS"), "uses TTL");
assert(page.includes("onTouchEnd"), "pull refresh");
assert(page.includes("galleryCache"), "cache map");
assert(
  !page.includes("setLoadError(err.message") &&
    !page.includes("setLoadError(STAFF_GALLERY_LOAD_FAILED)"),
  "no raw WIRE string error",
);

assert(pkg.includes("test:staff-items-states"), "package script");

for (const name of [
  "check-staff-items-scaffold.mjs",
  "check-staff-items-layout.mjs",
  "check-staff-items-fields.mjs",
  "check-staff-items-buttons.mjs",
  "check-staff-items-wire.mjs",
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
  console.error("Staff items STATES checks FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}
console.log("Staff items STATES checks PASS");
