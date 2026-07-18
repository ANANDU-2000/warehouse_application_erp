/**
 * Collision-safe username allocation for staff users.
 * Source: source-app/backend/app/services/user_username.py — port 1:1.
 */
import { randomUUID } from "node:crypto";

export function slugFromName(name: string): string {
  let s = name.trim().toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, "_");
  s = s.replace(/_+/g, "_").replace(/^_|_$/g, "");
  return (s.slice(0, 48) || "staff");
}

export type UsernameLookup = {
  usernameExists: (username: string) => Promise<boolean>;
};

/**
 * allocate_username — when requested is set and taken, throws ValueError equivalent.
 * When requested is null, tries slug/phone bases then staff_{hex}.
 */
export async function allocateUsername(
  lookup: UsernameLookup,
  opts: {
    requested: string | null | undefined;
    phoneDigits: string;
    fullName: string;
  },
): Promise<string> {
  const { requested, phoneDigits, fullName } = opts;
  if (requested && requested.trim()) {
    const candidate = requested.trim().toLowerCase().replace(/ /g, "_").slice(0, 64);
    if (/^[a-z0-9_]{3,64}$/.test(candidate)) {
      if (!(await lookup.usernameExists(candidate))) {
        return candidate;
      }
      throw new Error("username_taken");
    }
  }

  let base =
    phoneDigits.length >= 4 ? `staff_${phoneDigits.slice(-4)}` : "staff";
  const slug = slugFromName(fullName);
  if (slug && slug !== "staff") {
    base = slug.slice(0, 48);
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const suffix = attempt === 0 ? "" : `_${randomUUID().replace(/-/g, "").slice(0, 4)}`;
    const candidate = `${base}${suffix}`.slice(0, 64);
    if (!(await lookup.usernameExists(candidate))) {
      return candidate;
    }
  }
  return `staff_${randomUUID().replace(/-/g, "").slice(0, 8)}`.slice(0, 64);
}
