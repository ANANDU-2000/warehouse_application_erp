/**
 * user_credentials — GET …/users/:userId/credentials
 * Source: source-app/backend/app/routers/users.py:user_credentials
 */
import { HttpError } from "../errors/httpError";
import type { BusinessUsersRepository } from "../repositories/businessUsers.repository";

/** FastAPI dict response — no password. */
export type UserCredentialsOut = {
  username: string | null;
  login_email: string | null;
  phone: string | null;
  note: string;
};

const CREDENTIALS_NOTE =
  "Passwords cannot be retrieved. Use reset-password to issue a new one.";

/**
 * Port of user_credentials.
 * Roles enforced on route (owner/admin/super_admin). No guardActorTarget.
 */
export async function getUserCredentialsForBusiness(
  businessUsers: BusinessUsersRepository,
  businessId: string,
  userId: string,
): Promise<UserCredentialsOut> {
  const loaded = await businessUsers.findMemberForPatch(businessId, userId);
  if (!loaded) {
    throw new HttpError(404, "User not found");
  }
  return {
    username: loaded.username,
    login_email: loaded.email,
    phone: loaded.phone,
    note: CREDENTIALS_NOTE,
  };
}
