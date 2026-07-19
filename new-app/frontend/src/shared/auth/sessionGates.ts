/**
 * Session role gates — source-app/.../post_auth_route.dart
 * Super-admin user flag not on PrimaryBusinessSession yet (deferred).
 */
import type { PrimaryBusinessSession } from "./sessionStore";

function roleOf(session: PrimaryBusinessSession | null): string {
  return (session?.role ?? "").toLowerCase();
}

/** Owner / admin / manager may view the user list. */
export function sessionCanManageUsers(
  session: PrimaryBusinessSession | null,
): boolean {
  const r = roleOf(session);
  return r === "owner" || r === "admin" || r === "manager";
}

/** Owner / admin may create staff logins. */
export function sessionCanCreateUsers(
  session: PrimaryBusinessSession | null,
): boolean {
  const r = roleOf(session);
  return r === "owner" || r === "admin";
}

/** Owner / admin may mutate users (patch/delete/reset/bulk). */
export function sessionCanAdminUsers(
  session: PrimaryBusinessSession | null,
): boolean {
  const r = roleOf(session);
  return r === "owner" || r === "admin";
}
