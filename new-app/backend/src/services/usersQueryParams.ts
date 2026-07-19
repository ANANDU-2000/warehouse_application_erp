/**
 * Shared query param parsers for Users satellite list endpoints.
 * Source: FastAPI Query(limit=..., ge=..., le=...) on users.py
 */
import { HttpError } from "../errors/httpError";

/**
 * Parse integer limit query — default / min / max inclusive.
 * Missing or empty → default. Invalid → 422.
 */
export function parseLimitQuery(
  raw: unknown,
  opts: { default: number; min: number; max: number },
): number {
  if (raw === undefined || raw === null || raw === "") {
    return opts.default;
  }
  const s = Array.isArray(raw) ? String(raw[0]) : String(raw);
  if (!/^\d+$/.test(s)) {
    throw new HttpError(
      422,
      `limit must be an integer between ${opts.min} and ${opts.max}`,
    );
  }
  const n = Number(s);
  if (!Number.isInteger(n) || n < opts.min || n > opts.max) {
    throw new HttpError(
      422,
      `limit must be an integer between ${opts.min} and ${opts.max}`,
    );
  }
  return n;
}

/** created-items / stock-adjustments: Query(50, ge=1, le=200) */
export function parseUsersListLimit50to200(raw: unknown): number {
  return parseLimitQuery(raw, { default: 50, min: 1, max: 200 });
}

/** purchases: Query(50, ge=1, le=100) */
export function parseUsersListLimit50to100(raw: unknown): number {
  return parseLimitQuery(raw, { default: 50, min: 1, max: 100 });
}

/** ledger: Query(80, ge=1, le=200) */
export function parseLedgerLimit(raw: unknown): number {
  return parseLimitQuery(raw, { default: 80, min: 1, max: 200 });
}

/**
 * FastAPI Query(False) bool for grouped.
 * Missing/empty → false. Invalid → 422.
 */
export function parseGroupedQuery(raw: unknown): boolean {
  if (Array.isArray(raw)) {
    return parseGroupedQuery(raw[0]);
  }
  if (raw === undefined || raw === null || raw === "") return false;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") {
    if (raw === 1) return true;
    if (raw === 0) return false;
  }
  if (typeof raw === "string") {
    const t = raw.trim().toLowerCase();
    if (t === "true" || t === "1") return true;
    if (t === "false" || t === "0") return false;
  }
  throw new HttpError(422, "grouped must be a boolean");
}
