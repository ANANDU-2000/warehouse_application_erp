/**
 * Staff shift summary — port of summarizeStaffToday in staff_home_providers.dart
 */
export type StaffTodayActivitySummary = {
  scanned: number;
  stockUpdates: number;
  itemsCreated: number;
  verifications: number;
  purchases: number;
  itemsChecked: number;
};

export function emptyStaffTodaySummary(): StaffTodayActivitySummary {
  return {
    scanned: 0,
    stockUpdates: 0,
    itemsCreated: 0,
    verifications: 0,
    purchases: 0,
    itemsChecked: 0,
  };
}

export function staffTodayTotal(s: StaffTodayActivitySummary): number {
  return (
    s.scanned +
    s.stockUpdates +
    s.itemsCreated +
    s.verifications +
    s.purchases
  );
}

/** Flutter summarizeStaffToday */
export function summarizeStaffToday(args: {
  activityRows: Record<string, unknown>[];
  auditRows: Record<string, unknown>[];
}): StaffTodayActivitySummary {
  let scan = 0;
  let create = 0;
  let verify = 0;
  let purchases = 0;
  for (const r of args.activityRows) {
    const a = String(r.action_type ?? r.action ?? "")
      .toUpperCase();
    if (a.includes("SCAN")) {
      scan++;
    } else if (a.includes("ITEM") && a.includes("CREATE")) {
      create++;
    } else if (a.includes("VERIF")) {
      verify++;
    } else if (a.includes("PURCHASE")) {
      purchases++;
    }
  }
  const itemIds = new Set<string>();
  for (const a of args.auditRows) {
    const id = String(a.item_id ?? "").trim();
    if (id) itemIds.add(id);
  }
  return {
    scanned: scan,
    stockUpdates: args.auditRows.length,
    itemsCreated: create,
    verifications: verify,
    purchases,
    itemsChecked: itemIds.size,
  };
}

/** Local calendar YYYY-MM-DD for audit on= (Flutter _todayApiDate). */
export function staffTodayApiDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
