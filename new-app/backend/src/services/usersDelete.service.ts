/**
 * delete_user — DELETE …/users/:userId
 * Source: source-app/backend/app/routers/users.py:delete_user
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
import { guardActorTarget, type PatchUserActor } from "./usersPatch.service";

export type DeleteUserTxRepos = {
  users: UsersRepository;
  businessUsers: BusinessUsersRepository;
};

export type DeleteUserDeps = {
  pool?: ConnectionPool;
  businessUsers: BusinessUsersRepository;
  runInTransaction?: <T>(
    fn: (repos: DeleteUserTxRepos) => Promise<T>,
  ) => Promise<T>;
};

/**
 * Port of delete_user — soft-delete, revoke tokens, USER_DELETE audit.
 * No return body (HTTP 204).
 */
export async function deleteUserForBusiness(
  deps: DeleteUserDeps,
  opts: {
    businessId: string;
    userId: string;
    actorMembershipRole: string;
    actor: PatchUserActor;
  },
): Promise<void> {
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

  if (userId === actor.id) {
    throw new HttpError(400, "Cannot delete your own account");
  }

  const run =
    deps.runInTransaction ??
    (async <T>(fn: (repos: DeleteUserTxRepos) => Promise<T>): Promise<T> => {
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
    const now = new Date();
    await users.patchById(userId, {
      is_active: false,
      deleted_at: now,
      token_version: loaded.token_version + 1,
    });
    const display = actor.name || actor.username;
    await businessUsers.insertActivityLog({
      id: randomUUID(),
      business_id: businessId,
      user_id: actor.id,
      user_name: display,
      action_type: "USER_DELETE",
      details: JSON.stringify({
        target_user_id: userId,
        target_name: loaded.name || loaded.email,
      }),
      created_at: now,
    });
  });
}

export function deleteActorFromUser(user: UserRow): PatchUserActor {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    is_super_admin: Boolean(user.is_super_admin),
  };
}
