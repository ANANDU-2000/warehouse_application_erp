/**
 * GET /v1/me/businesses — list BusinessBrief for the authenticated user.
 * Source: source-app/backend/app/routers/me.py — my_businesses + BusinessBrief.
 */
import type { MembershipsRepository } from "../repositories/memberships.repository";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import {
  membershipPermissions,
  type PermissionsMap,
} from "./permissions.service";

/** Snake_case JSON matching FastAPI BusinessBrief. */
export type BusinessBrief = {
  id: string;
  name: string;
  role: string;
  permissions: PermissionsMap;
  branding_title: string | null;
  branding_logo_url: string | null;
  gst_number: string | null;
  address: string | null;
  phone: string | null;
  contact_email: string | null;
};

export type ListMyBusinessesDeps = {
  memberships: MembershipsRepository;
  businesses: BusinessesRepository;
};

/**
 * For each membership: load business by id; skip if missing;
 * attach membershipPermissions(m). Mirrors me.py my_businesses.
 */
export async function listMyBusinesses(
  deps: ListMyBusinessesDeps,
  userId: string,
): Promise<BusinessBrief[]> {
  const rows = await deps.memberships.listByUserId(userId);
  const out: BusinessBrief[] = [];
  for (const m of rows) {
    const b = await deps.businesses.findById(m.business_id);
    if (!b) {
      continue;
    }
    const permissions = membershipPermissions(m);
    out.push({
      id: b.id,
      name: b.name,
      role: m.role,
      permissions,
      branding_title: b.branding_title,
      branding_logo_url: b.branding_logo_url,
      gst_number: b.gst_number,
      address: b.address,
      phone: b.phone,
      contact_email: b.contact_email,
    });
  }
  return out;
}
