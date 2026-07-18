/**
 * Readable password generator for staff create / reset.
 * Source: source-app/backend/app/services/readable_password.py — port 1:1.
 */
import { randomInt } from "node:crypto";

/** Readable alphabet (no 0/O, 1/l/I confusion). */
const ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

function choice(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)]!;
}

/**
 * Generate password like krishna@123 when name is provided.
 */
export function generateReadablePassword(
  fullName: string | null | undefined = null,
  length = 8,
): string {
  if (fullName) {
    const first = fullName.trim().toLowerCase().split(/\s+/)[0] ?? "";
    const token = first.replace(/[^a-z0-9]/g, "");
    if (token.length >= 2) {
      let suffix = "";
      for (let i = 0; i < 3; i++) {
        suffix += String(randomInt(10));
      }
      return `${token.slice(0, 12)}@${suffix}`;
    }
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += choice(ALPHABET);
  }
  return out;
}
