/**
 * Staff purchase history period ranges —
 * staffTradePurchasesHistoryProvider StaffPurchaseHistoryPeriod.
 */

export type StaffPhPeriod = "today" | "week" | "allTime";

/** YYYY-MM-DD — Flutter `_todayApiDate` */
export function staffPhApiDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Period → purchase_from / purchase_to.
 * Week: Monday start (Dart DateTime.weekday Monday=1).
 */
export function staffPhPeriodRange(
  period: StaffPhPeriod,
  now: Date = new Date(),
): { purchaseFrom: string | null; purchaseTo: string | null } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "allTime") {
    return { purchaseFrom: null, purchaseTo: null };
  }
  if (period === "today") {
    const s = staffPhApiDate(today);
    return { purchaseFrom: s, purchaseTo: s };
  }
  const dow = today.getDay(); // 0=Sun … 6=Sat
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - mondayOffset);
  return {
    purchaseFrom: staffPhApiDate(weekStart),
    purchaseTo: staffPhApiDate(today),
  };
}

export function staffPhTabToPeriod(
  tab: "today" | "week" | "allTime" | "lowStock",
): StaffPhPeriod | null {
  if (tab === "lowStock") return null;
  return tab;
}
