/**
 * Primary business session — Flutter session.primaryBusiness after me/businesses.
 * Needed for /v1/businesses/:id/reports/home-overview.
 */
import type { BusinessBrief } from "../api/authApi";

const KEY = "hexa_primary_business_bk";

export type PrimaryBusinessSession = {
  id: string;
  name: string;
  role: string;
  branding_title: string | null;
};

export function writePrimaryBusiness(b: BusinessBrief): void {
  const payload: PrimaryBusinessSession = {
    id: b.id,
    name: b.name,
    role: b.role,
    branding_title: b.branding_title,
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function readPrimaryBusiness(): PrimaryBusinessSession | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as PrimaryBusinessSession).id !== "string"
    ) {
      return null;
    }
    return parsed as PrimaryBusinessSession;
  } catch {
    return null;
  }
}

export function clearPrimaryBusiness(): void {
  localStorage.removeItem(KEY);
}

/** Flutter home_compact_header._warehouseCode */
export function warehouseCodeFromBusinessId(businessId: string): string {
  const clean = businessId.replaceAll("-", "");
  if (clean.length >= 4) return `WH-${clean.slice(0, 4).toUpperCase()}`;
  if (clean.length === 0) return "WH";
  return `WH-${clean.toUpperCase()}`;
}

/** Flutter home_compact_header._shortWarehouseName */
export function shortWarehouseName(raw: string): string {
  const cleaned = raw
    .replace(/\b(Purchase|Purchases|Assistant|Agency)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length === 0) return raw;
  if (cleaned.length <= 18) return cleaned;
  return cleaned.slice(0, 18).trim();
}

export function displayWarehouseTitle(b: PrimaryBusinessSession): string {
  const raw = (b.branding_title ?? b.name ?? "Warehouse").trim() || "Warehouse";
  return shortWarehouseName(raw);
}
