/**
 * Staff activity page formatters — staff_activity_page.dart
 * `_staffActivityLabel` / `_timeAgo` / DateFormat.MMMd().add_Hm()
 * (Page _timeAgo includes `d ago`; home widget timeAgo does not.)
 */

/** Flutter _staffActivityLabel */
export function staffActLabel(actionType: string): string {
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

/** Flutter staff_activity_page._timeAgo (includes days &lt; 7) */
export function staffActTimeAgo(at: Date, now = new Date()): string {
  const ms = now.getTime() - at.getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return at.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Flutter DateFormat.MMMd().add_Hm() on local DateTime */
export function staffActWhenStamp(at: Date): string {
  const datePart = at.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timePart = at.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart} ${timePart}`;
}

export function staffActParseWhen(raw: unknown, fallback = new Date()): Date {
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

/** Flutter: actionRaw.toUpperCase().contains('PURCHASE') → cart icon */
export function staffActRowKind(actionRaw: string): "purchase" | "history" {
  return actionRaw.toUpperCase().includes("PURCHASE") ? "purchase" : "history";
}
