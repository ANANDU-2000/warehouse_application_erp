/**
 * Breakdown units/qty lines — port of home_breakdown_list_page.dart helpers.
 * Uses Flutter uppercase pack words + " • " separators (not homeFormatters ·).
 */
import type { HomeOverviewUnitTotals } from "./homeOverviewApi";

function fmtQty(q: number): string {
  if (!Number.isFinite(q)) return "0";
  if (Math.abs(q - Math.round(q)) < 1e-9) return String(Math.round(q));
  return q.toFixed(1);
}

/** Flutter `homePackUnitWord` — BAG/BOX/TIN uppercase plurals. */
export function homePackUnitWord(unit: string, qty: number): string {
  const upper = unit.toUpperCase();
  const plural = qty !== 1;
  if (!plural) return upper;
  if (upper === "BOX") return "BOXES";
  return `${upper}S`;
}

export function homePackQtyWithDbUnit(qty: number, rawUnit: string | null | undefined): string {
  const u = (rawUnit ?? "").trim();
  if (u === "" || u === "—") return `${fmtQty(qty)} QTY`;
  const up = u.toUpperCase();
  if (up === "KG" || up === "KGS") return `${fmtQty(qty)} KG`;
  for (const key of ["BOX", "BAG", "TIN"] as const) {
    if (up === key || up.includes(key)) {
      return `${fmtQty(qty)} ${homePackUnitWord(key, qty)}`;
    }
  }
  if (up.includes("PIECE")) {
    return `${fmtQty(qty)} ${qty === 1 ? "PIECE" : "PIECES"}`;
  }
  return `${fmtQty(qty)} ${homePackUnitWord(up, qty)}`;
}

/** Flutter `_dashboardUnitsLineFromTotals` — 0 KG when empty. */
export function dashboardUnitsLineFromTotals(u: {
  bags: number;
  boxes: number;
  tins: number;
  kg: number;
}): string {
  const parts: string[] = [];
  if (u.bags > 0) {
    parts.push(`${fmtQty(u.bags)} ${homePackUnitWord("BAG", u.bags)}`);
  }
  if (u.boxes > 0) {
    parts.push(`${fmtQty(u.boxes)} ${homePackUnitWord("BOX", u.boxes)}`);
  }
  if (u.tins > 0) {
    parts.push(`${fmtQty(u.tins)} ${homePackUnitWord("TIN", u.tins)}`);
  }
  if (u.kg > 0) parts.push(`${fmtQty(u.kg)} KG`);
  if (parts.length > 0) return parts.join(" • ");
  return "0 KG";
}

export function dashboardUnitsLineFromOverview(
  ut: HomeOverviewUnitTotals,
): string {
  return dashboardUnitsLineFromTotals({
    bags: Number(ut.total_bags ?? 0),
    boxes: Number(ut.total_boxes ?? 0),
    tins: Number(ut.total_tins ?? 0),
    kg: Number(ut.total_kg ?? 0),
  });
}

export function categoryQtyLabel(units: {
  bags: number;
  boxes: number;
  tins: number;
}, totalQty: number, firstItemUnit?: string): string {
  const parts: string[] = [];
  if (units.bags > 0) {
    parts.push(`${fmtQty(units.bags)} ${homePackUnitWord("BAG", units.bags)}`);
  }
  if (units.boxes > 0) {
    parts.push(
      `${fmtQty(units.boxes)} ${homePackUnitWord("BOX", units.boxes)}`,
    );
  }
  if (units.tins > 0) {
    parts.push(`${fmtQty(units.tins)} ${homePackUnitWord("TIN", units.tins)}`);
  }
  if (parts.length > 0) return parts.join(" • ");
  const u = (firstItemUnit ?? "").trim();
  if (u !== "" && u !== "—") {
    return homePackQtyWithDbUnit(totalQty, u);
  }
  return `${fmtQty(totalQty)} QTY`;
}

function coerceNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Flutter `_itemUpperQtyLine` (without kg-only bag inference). */
export function itemUpperQtyLine(
  m: Record<string, unknown>,
  itemTitle?: string,
): string {
  const tb = coerceNum(m.total_bags);
  const txb = coerceNum(m.total_boxes);
  const ttn = coerceNum(m.total_tins);
  const tkg = coerceNum(m.total_kg);
  const parts: string[] = [];
  if (tb > 0) {
    parts.push(`${fmtQty(tb)} ${homePackUnitWord("BAG", tb)}`);
  }
  void itemTitle;
  if (txb > 0) parts.push(`${fmtQty(txb)} ${homePackUnitWord("BOX", txb)}`);
  if (ttn > 0) parts.push(`${fmtQty(ttn)} ${homePackUnitWord("TIN", ttn)}`);
  if (tkg > 0) parts.push(`${fmtQty(tkg)} KG`);
  if (parts.length > 0) return parts.join(" • ");
  const q = coerceNum(m.total_qty);
  return homePackQtyWithDbUnit(q, m.unit?.toString());
}

export const BREAKDOWN_DOT_COLORS = [
  "#0D9488",
  "#6366F1",
  "#EA580C",
  "#7C3AED",
  "#0EA5E9",
  "#DB2777",
  "#CA8A04",
  "#16A34A",
] as const;
