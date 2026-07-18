/**
 * Post-auth home path — post_auth_route.dart authenticatedHomePath.
 * primaryBusiness = businesses.first (session.dart).
 */
import type { BusinessBrief } from "../api/authApi";

export function sessionIsStaff(businesses: BusinessBrief[]): boolean {
  if (businesses.length === 0) return false;
  return businesses[0].role.toLowerCase() === "staff";
}

export function authenticatedHomePath(businesses: BusinessBrief[]): string {
  return sessionIsStaff(businesses) ? "/staff/home" : "/home";
}
