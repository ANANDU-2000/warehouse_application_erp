/**
 * Last-active + role/status labels — user_last_active.dart UserLastActive / UserRoleStyle.
 */

function parseUtc(iso: string | null | undefined): Date | null {
  if (iso == null || iso === "") return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatJm(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** UserLastActive.label */
export function userLastActiveLabel(
  lastActiveIso: string | null | undefined,
  createdAtIso?: string | null,
): string {
  const d = parseUtc(lastActiveIso);
  if (d == null) {
    const created = parseUtc(createdAtIso);
    if (created != null) {
      const ageMs = Date.now() - created.getTime();
      if (ageMs < 14 * 24 * 60 * 60 * 1000) {
        return "Created recently";
      }
    }
    return "Never active";
  }
  const local = d;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(local.getFullYear(), local.getMonth(), local.getDate());
  if (day.getTime() === today.getTime()) {
    return `Today ${formatJm(local)}`;
  }
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (day.getTime() === yesterday.getTime()) {
    return `Yesterday ${formatJm(local)}`;
  }
  if (now.getTime() - local.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return local.toLocaleString(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return local.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** UserLastActive.isOnlineNow — 5 minute window */
export function userIsOnlineNow(lastActiveIso: string | null | undefined): boolean {
  const d = parseUtc(lastActiveIso);
  if (d == null) return false;
  return Date.now() - d.getTime() < 5 * 60 * 1000;
}

/** UserRoleStyle.displayRole */
export function displayUserRole(role: string | null | undefined): string {
  const r = (role ?? "").toLowerCase();
  switch (r) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "manager":
      return "Manager";
    case "staff":
      return "Staff";
    default:
      if (!r) return "—";
      return r[0]!.toUpperCase() + r.slice(1);
  }
}

/** UserRoleStyle.statusLabel */
export function userStatusLabel(opts: {
  blocked: boolean;
  active: boolean;
}): string {
  if (opts.blocked) return "Blocked";
  if (opts.active) return "Active";
  return "Inactive";
}
