/**
 * Staff recent activity — port of staffRecentActivityProvider /
 * staffActivityLabel / barcode_recent_scans.dart
 */

export const BARCODE_RECENT_SCANS_PREFS_KEY = "barcode_recent_scans_v1";

export type BarcodeRecentScan = {
  id: string;
  name: string;
  code: string;
};

export type StaffRecentActivityItem = {
  label: string;
  subtitle: string | null;
  when: Date;
  itemId: string | null;
  isScan: boolean;
};

/** Flutter staffActivityLabel */
export function staffActivityLabel(actionType: string): string {
  switch (actionType.toUpperCase()) {
    case "STAFF_LOGIN":
      return "Signed in";
    case "STAFF_LOGOUT":
      return "Signed out";
    case "PURCHASE_CREATE":
      return "Purchase saved";
    case "SCAN":
    case "BARCODE_SCAN":
      return "Barcode scan";
    default:
      return actionType.replaceAll("_", " ");
  }
}

/** Flutter StaffHomeRecentActivitySection._timeAgo */
export function staffActivityTimeAgo(at: Date, now = new Date()): string {
  const ms = now.getTime() - at.getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return at.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Flutter loadBarcodeRecentScans(max) */
export function loadBarcodeRecentScans(
  max = 8,
  storage: Pick<Storage, "getItem"> = localStorage,
): BarcodeRecentScan[] {
  const raw = storage.getItem(BARCODE_RECENT_SCANS_PREFS_KEY);
  if (!raw) return [];
  try {
    const decoded: unknown = JSON.parse(raw);
    if (!Array.isArray(decoded)) return [];
    const out: BarcodeRecentScan[] = [];
    for (const e of decoded) {
      if (e && typeof e === "object") {
        const j = e as Record<string, unknown>;
        const code = String(j.code ?? "").trim();
        if (!code) continue;
        out.push({
          id: String(j.id ?? ""),
          name: String(j.name ?? ""),
          code,
        });
      } else {
        const code = String(e).trim();
        if (code) out.push({ id: "", name: code, code });
      }
    }
    return out.slice(0, max);
  } catch {
    return [];
  }
}

function parseWhen(raw: unknown, fallback: Date): Date {
  try {
    const s = String(raw ?? "");
    if (!s) return fallback;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return fallback;
    return d;
  } catch {
    return fallback;
  }
}

/**
 * Flutter staffRecentActivityProvider merge:
 * activity rows + device scans → sort by when desc → take 8
 */
export function buildStaffRecentActivity(args: {
  activityRows: Record<string, unknown>[];
  scans: BarcodeRecentScan[];
  now?: Date;
}): StaffRecentActivityItem[] {
  const now = args.now ?? new Date();
  const items: StaffRecentActivityItem[] = [];

  for (const r of args.activityRows) {
    const actionRaw = String(r.action_type ?? r.action ?? "");
    const itemName = r.item_name != null ? String(r.item_name) : null;
    const itemIdRaw = r.item_id != null ? String(r.item_id) : "";
    items.push({
      label: staffActivityLabel(actionRaw),
      subtitle:
        itemName && itemName.trim().length > 0 ? itemName : null,
      when: parseWhen(r.created_at, now),
      itemId: itemIdRaw.length > 0 ? itemIdRaw : null,
      isScan: false,
    });
  }

  for (const s of args.scans) {
    items.push({
      label: "Barcode scan",
      subtitle: s.name.length > 0 ? s.name : s.code,
      when: now,
      itemId: s.id.length > 0 ? s.id : null,
      isScan: true,
    });
  }

  items.sort((a, b) => b.when.getTime() - a.when.getTime());
  return items.slice(0, 8);
}
