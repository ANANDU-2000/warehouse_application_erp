/**
 * reset_password — POST …/users/:userId/reset-password
 * Source: source-app/backend/app/routers/users.py:reset_password
 *         staff_audit.py:log_password_reset
 */
import { randomUUID } from "node:crypto";
import type { ConnectionPool } from "mssql";
import { HttpError } from "../errors/httpError";
import { withTransaction } from "../db/withTransaction";
import {
  createUsersRepository,
  type UsersRepository,
} from "../repositories/users.repository";
import {
  createBusinessUsersRepository,
  type BusinessUsersRepository,
} from "../repositories/businessUsers.repository";
import type { UserRow } from "../repositories/types";
import { hashPassword } from "./passwords.service";
import { generateReadablePassword } from "./readablePassword.service";
import { guardActorTarget, type PatchUserActor } from "./usersPatch.service";

export type ResetPasswordOut = {
  new_password: string;
  login_email: string | null;
};

export type ResetPasswordTxRepos = {
  users: UsersRepository;
  businessUsers: BusinessUsersRepository;
};

export type ResetPasswordDeps = {
  pool?: ConnectionPool;
  businessUsers: BusinessUsersRepository;
  runInTransaction?: <T>(
    fn: (repos: ResetPasswordTxRepos) => Promise<T>,
  ) => Promise<T>;
};

/**
 * Port of reset_password.
 * Returns plaintext new_password once + login_email.
 */
export async function resetPasswordForBusiness(
  deps: ResetPasswordDeps,
  opts: {
    businessId: string;
    userId: string;
    actorMembershipRole: string;
    actor: PatchUserActor;
  },
): Promise<ResetPasswordOut> {
  const { businessId, userId, actor, actorMembershipRole } = opts;

  const loaded = await deps.businessUsers.findMemberForPatch(
    businessId,
    userId,
  );
  if (!loaded) {
    throw new HttpError(404, "User not found");
  }

  guardActorTarget({
    actorRole: actorMembershipRole,
    targetRole: loaded.role,
    actorIsSuperAdmin: actor.is_super_admin,
  });

  const plain = generateReadablePassword(loaded.name);
  const password_hash = hashPassword(plain);

  const run =
    deps.runInTransaction ??
    (async <T>(
      fn: (repos: ResetPasswordTxRepos) => Promise<T>,
    ): Promise<T> => {
      if (!deps.pool) {
        throw new Error("Database pool not connected. Call connect() first.");
      }
      return withTransaction(deps.pool, async (tx) =>
        fn({
          users: createUsersRepository(tx),
          businessUsers: createBusinessUsersRepository(tx),
        }),
      );
    });

  await run(async ({ users, businessUsers }) => {
    await users.patchById(userId, { password_hash });
    const display = actor.name || actor.username;
    const targetName = loaded.name || loaded.username;
    await businessUsers.insertActivityLog({
      id: randomUUID(),
      business_id: businessId,
      user_id: actor.id,
      user_name: display,
      action_type: "PASSWORD_RESET",
      details: JSON.stringify({
        target_user_id: userId,
        target_name: targetName,
      }),
      created_at: new Date(),
    });
  });

  return {
    new_password: plain,
    login_email: loaded.email,
  };
}

export function resetActorFromUser(user: UserRow): PatchUserActor {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    is_super_admin: Boolean(user.is_super_admin),
  };
}
