/**
 * bulk_users — POST …/users/bulk
 * Source: source-app/backend/app/routers/users.py:bulk_users
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
  createMembershipsRepository,
  type MembershipsRepository,
} from "../repositories/memberships.repository";
import {
  createBusinessUsersRepository,
  type BusinessUsersRepository,
} from "../repositories/businessUsers.repository";
import type { UserRow } from "../repositories/types";
import { ROLE_DEFAULTS } from "./permissions.service";
import {
  guardActorTarget,
  type PatchUserActor,
} from "./usersPatch.service";
import type { UserBulkIn } from "../validation/users.schemas";

export type UserBulkOut = {
  updated: number;
  failed: string[];
};

export type BulkUserTxRepos = {
  users: UsersRepository;
  memberships: MembershipsRepository;
  businessUsers: BusinessUsersRepository;
};

export type BulkUserDeps = {
  pool?: ConnectionPool;
  businessUsers: BusinessUsersRepository;
  runInTransaction?: <T>(
    fn: (repos: BulkUserTxRepos) => Promise<T>,
  ) => Promise<T>;
};

type PendingAction =
  | { kind: "activate"; userId: string }
  | { kind: "deactivate"; userId: string }
  | { kind: "unblock"; userId: string }
  | {
      kind: "block";
      userId: string;
      token_version: number;
      target_name: string | null;
      target_email: string;
    }
  | {
      kind: "delete";
      userId: string;
      token_version: number;
      target_name: string | null;
      target_email: string;
    }
  | {
      kind: "set_role";
      membershipId: string;
      role: string;
      permissionsJson: string;
    };

/**
 * Port of bulk_users — per-id failures append to failed; single commit.
 */
export async function bulkUsersForBusiness(
  deps: BulkUserDeps,
  opts: {
    businessId: string;
    body: UserBulkIn;
    actorMembershipRole: string;
    actor: PatchUserActor;
  },
): Promise<UserBulkOut> {
  const { businessId, body, actor, actorMembershipRole } = opts;
  const failed: string[] = [];
  const pending: PendingAction[] = [];

  for (const uid of body.user_ids) {
    const loaded = await deps.businessUsers.findMemberForPatch(
      businessId,
      uid,
    );
    if (!loaded) {
      failed.push(uid);
      continue;
    }

    try {
      guardActorTarget({
        actorRole: actorMembershipRole,
        targetRole: loaded.role,
        actorIsSuperAdmin: actor.is_super_admin,
      });
    } catch (e) {
      if (e instanceof HttpError) {
        failed.push(uid);
        continue;
      }
      throw e;
    }

    if (
      uid === actor.id &&
      (body.action === "deactivate" ||
        body.action === "delete" ||
        body.action === "block")
    ) {
      failed.push(uid);
      continue;
    }

    if (body.action === "activate") {
      pending.push({ kind: "activate", userId: uid });
    } else if (body.action === "deactivate") {
      pending.push({ kind: "deactivate", userId: uid });
    } else if (body.action === "block") {
      pending.push({
        kind: "block",
        userId: uid,
        token_version: loaded.token_version,
        target_name: loaded.name,
        target_email: loaded.email,
      });
    } else if (body.action === "unblock") {
      pending.push({ kind: "unblock", userId: uid });
    } else if (body.action === "delete") {
      pending.push({
        kind: "delete",
        userId: uid,
        token_version: loaded.token_version,
        target_name: loaded.name,
        target_email: loaded.email,
      });
    } else if (body.action === "set_role") {
      if (!body.role) {
        failed.push(uid);
        continue;
      }
      if (actorMembershipRole === "admin" && body.role === "owner") {
        failed.push(uid);
        continue;
      }
      const defaults =
        ROLE_DEFAULTS[body.role] ?? ROLE_DEFAULTS.staff!;
      pending.push({
        kind: "set_role",
        membershipId: loaded.membership_id,
        role: body.role,
        permissionsJson: JSON.stringify({ ...defaults }),
      });
    }
  }

  const run =
    deps.runInTransaction ??
    (async <T>(fn: (repos: BulkUserTxRepos) => Promise<T>): Promise<T> => {
      if (!deps.pool) {
        throw new Error("Database pool not connected. Call connect() first.");
      }
      return withTransaction(deps.pool, async (tx) =>
        fn({
          users: createUsersRepository(tx),
          memberships: createMembershipsRepository(tx),
          businessUsers: createBusinessUsersRepository(tx),
        }),
      );
    });

  if (pending.length > 0) {
    await run(async ({ users, memberships, businessUsers }) => {
      const now = new Date();
      const display = actor.name || actor.username;
      for (const op of pending) {
        if (op.kind === "activate") {
          await users.patchById(op.userId, {
            is_active: true,
            deleted_at: null,
            is_blocked: false,
          });
        } else if (op.kind === "deactivate") {
          await users.patchById(op.userId, { is_active: false });
        } else if (op.kind === "unblock") {
          await users.patchById(op.userId, { is_blocked: false });
        } else if (op.kind === "block") {
          await users.patchById(op.userId, {
            is_blocked: true,
            token_version: op.token_version + 1,
          });
          await businessUsers.insertActivityLog({
            id: randomUUID(),
            business_id: businessId,
            user_id: actor.id,
            user_name: display,
            action_type: "USER_BLOCK",
            details: JSON.stringify({
              target_user_id: op.userId,
              target_name: op.target_name || op.target_email,
            }),
            created_at: now,
          });
        } else if (op.kind === "delete") {
          await users.patchById(op.userId, {
            is_active: false,
            deleted_at: now,
            token_version: op.token_version + 1,
          });
          await businessUsers.insertActivityLog({
            id: randomUUID(),
            business_id: businessId,
            user_id: actor.id,
            user_name: display,
            action_type: "USER_DELETE",
            details: JSON.stringify({
              target_user_id: op.userId,
              target_name: op.target_name || op.target_email,
            }),
            created_at: now,
          });
        } else if (op.kind === "set_role") {
          await memberships.updateRoleAndPermissions(
            op.membershipId,
            op.role,
            op.permissionsJson,
          );
        }
      }
    });
  }

  return { updated: pending.length, failed };
}

export function bulkActorFromUser(user: UserRow): PatchUserActor {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    is_super_admin: Boolean(user.is_super_admin),
  };
}
