/**
 * patch_user — PATCH …/users/:userId
 * Source: source-app/backend/app/routers/users.py:patch_user, _guard_actor_target
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
  type BusinessUserMemberRow,
} from "../repositories/businessUsers.repository";
import type { BusinessesRepository } from "../repositories/businesses.repository";
import type { UserRow } from "../repositories/types";
import {
  actorCanManageTarget,
  ROLE_DEFAULTS,
} from "./permissions.service";
import {
  buildUserListOut,
  type UserListOut,
} from "./usersList.service";
import type { UserPatchIn } from "../validation/users.schemas";

export type PatchUserActor = {
  id: string;
  name: string | null;
  username: string;
  email: string;
  is_super_admin: boolean;
};

export type PatchUserTxRepos = {
  users: UsersRepository;
  memberships: MembershipsRepository;
  businessUsers: BusinessUsersRepository;
};

export type PatchUserDeps = {
  pool?: ConnectionPool;
  businesses: BusinessesRepository;
  businessUsers: BusinessUsersRepository;
  runInTransaction?: <T>(
    fn: (repos: PatchUserTxRepos) => Promise<T>,
  ) => Promise<T>;
};

/** Port of _guard_actor_target. */
export function guardActorTarget(opts: {
  actorRole: string;
  targetRole: string;
  actorIsSuperAdmin: boolean;
}): void {
  if (opts.actorIsSuperAdmin) return;
  if (!actorCanManageTarget(opts.actorRole, opts.targetRole)) {
    throw new HttpError(403, "You cannot modify this user");
  }
  if (opts.targetRole === "owner" && opts.actorRole !== "owner") {
    throw new HttpError(403, "Owner account is protected");
  }
}

/**
 * Port of patch_user. Returns UserListOut.
 */
export async function patchUserForBusiness(
  deps: PatchUserDeps,
  opts: {
    businessId: string;
    userId: string;
    body: UserPatchIn;
    actorMembershipRole: string;
    actor: PatchUserActor;
  },
): Promise<UserListOut> {
  const { businessId, userId, body, actor, actorMembershipRole } = opts;

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

  const userFields: Parameters<UsersRepository["patchById"]>[1] = {};
  let newRole: string | null = null;
  let newPermsJson: string | null = null;
  let logBlock = false;
  let nextTokenVersion = loaded.token_version;

  if (body.full_name != null) {
    userFields.name = body.full_name.trim();
  }
  if (body.email != null) {
    const email = body.email.trim().toLowerCase();
    // email uniqueness checked inside txn with users repo
    userFields.email = email;
  }
  if (body.phone != null) {
    userFields.phone = body.phone.trim();
  }
  if (body.role != null) {
    if (actorMembershipRole === "admin" && body.role === "owner") {
      throw new HttpError(403, "Cannot assign owner role");
    }
    newRole = body.role;
    const defaults =
      ROLE_DEFAULTS[body.role] ?? ROLE_DEFAULTS.staff!;
    newPermsJson = JSON.stringify({ ...defaults });
  }
  if (body.is_active != null) {
    userFields.is_active = body.is_active;
    if (body.is_active) {
      userFields.deleted_at = null;
      userFields.is_blocked = false;
    }
  }
  if (body.is_blocked != null) {
    userFields.is_blocked = body.is_blocked;
    if (body.is_blocked) {
      nextTokenVersion = loaded.token_version + 1;
      userFields.token_version = nextTokenVersion;
      logBlock = true;
    }
  }
  if (body.notes != null) {
    const n = body.notes.trim();
    userFields.notes = n.length > 0 ? n : null;
  }

  const run =
    deps.runInTransaction ??
    (async <T>(fn: (repos: PatchUserTxRepos) => Promise<T>): Promise<T> => {
      if (!deps.pool) {
        throw new Error("Database pool not connected. Call connect() first.");
      }
      return withTransaction(deps.pool, async (tx) => {
        return fn({
          users: createUsersRepository(tx),
          memberships: createMembershipsRepository(tx),
          businessUsers: createBusinessUsersRepository(tx),
        });
      });
    });

  const updatedMember = await run(async ({ users, memberships, businessUsers }) => {
    if (userFields.email !== undefined) {
      if (
        await users.emailExistsActiveExcluding(userFields.email, userId)
      ) {
        throw new HttpError(409, "Email already registered");
      }
    }

    if (Object.keys(userFields).length > 0) {
      await users.patchById(userId, userFields);
    }
    if (newRole != null && newPermsJson != null) {
      await memberships.updateRoleAndPermissions(
        loaded.membership_id,
        newRole,
        newPermsJson,
      );
    }
    if (logBlock) {
      const display = actor.name || actor.username;
      await businessUsers.insertActivityLog({
        id: randomUUID(),
        business_id: businessId,
        user_id: actor.id,
        user_name: display,
        action_type: "USER_BLOCK",
        details: JSON.stringify({
          target_user_id: userId,
          target_name: (userFields.name ?? loaded.name) || loaded.email,
        }),
        created_at: new Date(),
      });
    }

    const member: BusinessUserMemberRow = {
      id: loaded.id,
      name: userFields.name ?? loaded.name,
      phone: userFields.phone ?? loaded.phone,
      email: userFields.email ?? loaded.email,
      username: loaded.username,
      role: newRole ?? loaded.role,
      is_active: userFields.is_active ?? loaded.is_active,
      is_blocked: userFields.is_blocked ?? loaded.is_blocked,
      last_login_at: loaded.last_login_at,
      last_active_at: loaded.last_active_at,
      notes:
        userFields.notes !== undefined ? userFields.notes : loaded.notes,
      created_at: loaded.created_at,
    };
    return member;
  });

  const biz = await deps.businesses.findById(businessId);
  return buildUserListOut(
    deps.businessUsers,
    businessId,
    updatedMember,
    biz?.name ?? null,
  );
}

export function patchActorFromUser(user: UserRow): PatchUserActor {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    is_super_admin: Boolean(user.is_super_admin),
  };
}
