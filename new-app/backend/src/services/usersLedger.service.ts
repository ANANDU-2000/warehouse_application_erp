/**
 * user_ledger — GET …/users/:userId/ledger
 * Source: source-app/backend/app/routers/users.py:user_ledger
 *         schemas/users.py:LedgerEntryOut, LedgerGroupedOut
 */
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";
import {
  parseGroupedQuery,
  parseLedgerLimit,
} from "./usersQueryParams";

export type LedgerEntryOut = {
  kind: string;
  at: string;
  title: string;
  subtitle: string | null;
  details: Record<string, unknown> | null;
};

export type LedgerGroupedOut = {
  today: LedgerEntryOut[];
  yesterday: LedgerEntryOut[];
  this_week: LedgerEntryOut[];
};

export { parseLedgerLimit, parseGroupedQuery };

type LedgerEntryInternal = {
  kind: string;
  at: Date;
  title: string;
  subtitle: string | null;
  details: Record<string, unknown> | null;
};

function parseDetailsJson(
  raw: string | null | undefined,
): Record<string, unknown> | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function toOut(e: LedgerEntryInternal): LedgerEntryOut {
  return {
    kind: e.kind,
    at: e.at.toISOString(),
    title: e.title,
    subtitle: e.subtitle,
    details: e.details,
  };
}

/**
 * Merge activity + stock, sort by at desc, trim to limit.
 */
export function buildLedgerEntries(
  activity: {
    created_at: Date;
    action_type: string;
    item_name: string | null;
    details: string | null;
  }[],
  stock: {
    updated_at: Date;
    item_name: string | null;
    old_qty: number;
    new_qty: number;
  }[],
  limit: number,
): LedgerEntryInternal[] {
  const entries: LedgerEntryInternal[] = [];
  for (const row of activity) {
    entries.push({
      kind: "activity",
      at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
      title: row.action_type,
      subtitle: row.item_name,
      details: parseDetailsJson(row.details),
    });
  }
  for (const log of stock) {
    entries.push({
      kind: "stock",
      at: log.updated_at instanceof Date ? log.updated_at : new Date(log.updated_at),
      title: "STOCK_UPDATE",
      subtitle: log.item_name,
      details: {
        old_qty: Number(log.old_qty),
        new_qty: Number(log.new_qty),
      },
    });
  }
  entries.sort((a, b) => b.at.getTime() - a.at.getTime());
  return entries.slice(0, limit);
}

/**
 * Bucket entries into today / yesterday / this_week (UTC).
 * Older than week_start dropped — matches FastAPI user_ledger.
 */
export function groupLedgerEntries(
  entries: LedgerEntryInternal[],
  nowUtc: Date = new Date(),
): LedgerGroupedOut {
  const todayStart = new Date(
    Date.UTC(
      nowUtc.getUTCFullYear(),
      nowUtc.getUTCMonth(),
      nowUtc.getUTCDate(),
    ),
  );
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const out: LedgerGroupedOut = { today: [], yesterday: [], this_week: [] };
  for (const e of entries) {
    const at = e.at;
    if (at >= todayStart) {
      out.today.push(toOut(e));
    } else if (at >= yesterdayStart) {
      out.yesterday.push(toOut(e));
    } else if (at >= weekStart) {
      out.this_week.push(toOut(e));
    }
  }
  return out;
}

/**
 * Port of user_ledger — no membership 404; empty list OK.
 */
export async function getLedgerForBusiness(
  businessUsers: BusinessUsersRepository,
  businessId: string,
  userId: string,
  opts: {
    limit: number;
    grouped: boolean;
    /** Test seam for grouped buckets. */
    now?: Date;
  },
): Promise<LedgerEntryOut[] | LedgerGroupedOut> {
  const [activity, stock] = await Promise.all([
    businessUsers.listActivityLogByUser(businessId, userId, opts.limit),
    businessUsers.listStockAdjustmentsByUser(businessId, userId, opts.limit),
  ]);
  const trimmed = buildLedgerEntries(activity, stock, opts.limit);
  if (!opts.grouped) {
    return trimmed.map(toOut);
  }
  return groupLedgerEntries(trimmed, opts.now ?? new Date());
}
