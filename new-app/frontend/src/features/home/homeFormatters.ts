/**
 * Display helpers — home_analytics_helpers / purchase control center.
 */

export function homeFmtQty(n: number): string {
  if (!Number.isFinite(n) || Math.abs(n) < 0.001) return "0";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(1).replace(/\.0$/, "");
}

export function packUnitWord(kind: "BAG" | "BOX" | "TIN", qty: number): string {
  const plural = Math.abs(qty) !== 1;
  if (kind === "BAG") return plural ? "bags" : "bag";
  if (kind === "BOX") return plural ? "boxes" : "box";
  return plural ? "tins" : "tin";
}

export function inventoryUnitsLine(inv: {
  bags: number;
  boxes: number;
  tins: number;
  kg: number;
}): string {
  const parts: string[] = [];
  if (inv.bags > 0) {
    parts.push(`${homeFmtQty(inv.bags)} ${packUnitWord("BAG", inv.bags)}`);
  }
  if (inv.boxes > 0) {
    parts.push(`${homeFmtQty(inv.boxes)} ${packUnitWord("BOX", inv.boxes)}`);
  }
  if (inv.tins > 0) {
    parts.push(`${homeFmtQty(inv.tins)} ${packUnitWord("TIN", inv.tins)}`);
  }
  if (inv.kg > 0) parts.push(`${homeFmtQty(inv.kg)} KG`);
  return parts.length === 0 ? "No stock on hand" : parts.join(" · ");
}

export function purchasedUnitsLine(u: {
  total_bags: number;
  total_boxes: number;
  total_tins: number;
  total_kg: number;
}): string {
  const parts: string[] = [];
  if (u.total_bags > 0.001) {
    parts.push(
      `${homeFmtQty(u.total_bags)} ${packUnitWord("BAG", u.total_bags)}`,
    );
  }
  if (u.total_boxes > 0.001) {
    parts.push(
      `${homeFmtQty(u.total_boxes)} ${packUnitWord("BOX", u.total_boxes)}`,
    );
  }
  if (u.total_tins > 0.001) {
    parts.push(
      `${homeFmtQty(u.total_tins)} ${packUnitWord("TIN", u.total_tins)}`,
    );
  }
  if (u.total_kg > 0.001) parts.push(`${homeFmtQty(u.total_kg)} KG`);
  return parts.join(" · ");
}

export function formatRupee(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `₹${n.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}
