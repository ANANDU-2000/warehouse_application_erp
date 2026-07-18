/**
 * Activity units helpers — port of home_activity_units.dart + purchase_units_subtitle map path.
 */
import { homeFmtQty } from "./homeFormatters";

function coerceToDouble(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function coerceToDoubleNullable(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function homePackUnitWord(kind: "BAG" | "BOX" | "TIN", qty: number): string {
  if (kind === "BAG") return qty === 1 ? "BAG" : "BAGS";
  if (kind === "BOX") return qty === 1 ? "BOX" : "BOXES";
  return qty === 1 ? "TIN" : "TINS";
}

export function purchaseActivityUnitsLine(
  p: Record<string, unknown>,
): string | null {
  const parts: string[] = [];
  const bags = coerceToDouble(p.total_bags ?? p.bags);
  const boxes = coerceToDouble(p.total_boxes ?? p.boxes);
  const tins = coerceToDouble(p.total_tins ?? p.tins);
  const kg = coerceToDouble(p.total_kg ?? p.kg);
  if (bags > 0) parts.push(`${homeFmtQty(bags)} ${homePackUnitWord("BAG", bags)}`);
  if (boxes > 0)
    parts.push(`${homeFmtQty(boxes)} ${homePackUnitWord("BOX", boxes)}`);
  if (tins > 0) parts.push(`${homeFmtQty(tins)} ${homePackUnitWord("TIN", tins)}`);
  if (kg > 0) parts.push(`${homeFmtQty(kg)} KG`);
  if (parts.length > 0) return parts.join(" · ");
  const qty = coerceToDouble(p.total_qty ?? p.qty);
  const unit = (p.unit?.toString() ?? "").trim();
  if (qty > 0 && unit) return `${homeFmtQty(qty)} ${unit.toUpperCase()}`;
  return null;
}

export function stockAuditActivityUnitsLine(
  a: Record<string, unknown>,
): string | null {
  const oldQ = coerceToDouble(a.old_qty);
  const newQ = coerceToDouble(a.new_qty);
  const rawDelta = a.delta_qty ?? a.qty_change ?? a.change;
  let delta = coerceToDoubleNullable(rawDelta);
  delta ??= newQ - oldQ;
  if (Math.abs(delta) < 0.001) return null;
  const unitRaw = (a.unit ?? a.stock_unit ?? "").toString().trim();
  const sign = delta >= 0 ? "+" : "-";
  const qty = homeFmtQty(Math.abs(delta));
  if (unitRaw) return `${sign}${qty} ${unitRaw.toUpperCase()}`;
  const item = a.item_name?.toString().trim();
  if (item) return `${sign}${qty} · ${item}`;
  return `${sign}${qty}`;
}

export function dedupeActivityUnitsLine(raw: string | null | undefined): string {
  if (raw == null) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const seen = new Set<string>();
  const display: string[] = [];
  for (const part of trimmed.split("·")) {
    const p = part.trim();
    if (!p) continue;
    const norm = normalizeActivityUnitSegment(p);
    if (!norm || seen.has(norm)) continue;
    seen.add(norm);
    display.push(preferActivityUnitDisplay(p));
  }
  return display.join(" · ");
}

function normalizeActivityUnitSegment(segment: string): string {
  let t = segment.trim();
  if (t.startsWith("+") || t.startsWith("-")) t = t.slice(1).trim();
  const m = /^([\d.,]+)\s+(.+)$/.exec(t);
  if (!m) return t.toLowerCase();
  const qty = m[1].replace(/,/g, "");
  let unit = m[2].trim().toLowerCase();
  if (unit === "bags" || unit === "sacks") unit = "bag";
  if (unit === "boxes") unit = "box";
  if (unit === "tins") unit = "tin";
  if (unit === "kilogram" || unit === "kilograms") unit = "kg";
  return `${qty} ${unit}`;
}

function preferActivityUnitDisplay(segment: string): string {
  const t = segment.trim();
  if (t.startsWith("+") || t.startsWith("-")) return t.slice(1).trim();
  return t;
}

export function activityUnitsLineQualityScore(line: string | null | undefined): number {
  const u = line?.trim();
  if (!u) return 0;
  let score = u.length;
  if (!u.includes("+") && !u.includes("-")) score += 20;
  const parts = u.split("·").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) score += 8;
  return score;
}

export function warehouseActivityRowScore(args: {
  unitsLine?: string | null;
  verifiedBy?: string | null;
  amountInr?: number | null;
  supplierName?: string | null;
}): number {
  let score = 0;
  if (args.unitsLine?.trim()) score += 4;
  if (args.verifiedBy?.trim()) score += 2;
  if (args.amountInr != null && args.amountInr > 0) score += 2;
  if (args.supplierName?.trim()) score += 1;
  return score;
}

/** Center-column label for delivery-style activity rows. */
export function warehouseActivityDeliveryUnitsLabel(args: {
  unitsLine?: string | null;
  qtyChange?: string | null;
}): string {
  const line = dedupeActivityUnitsLine(args.unitsLine);
  if (line) return line;
  const qc = args.qtyChange?.trim();
  if (!qc) return "—";
  if (/^PUR-/i.test(qc)) return "—";
  return qc;
}
