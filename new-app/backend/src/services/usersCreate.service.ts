/**
 * create_user — POST …/users
 * Source: source-app/backend/app/routers/users.py:create_user
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
import { hashPassword } from "./passwords.service";
import { effectivePermissions } from "./permissions.service";
import { allocateUsername } from "./userUsername.service";
import { generateReadablePassword } from "./readablePassword.service";
import {
  buildUserListOut,
  type UserListOut,
} from "./usersList.service";
import {
  phoneDigits,
  type UserCreateIn,
} from "../validation/users.schemas";

export type UserCreateOut = {
  user: UserListOut;
  generated_password: string | null;
  login_email: string | null;
};

export type CreateUserActor = {
  id: string;
  name: string | null;
  username: string;
  email: string;
};

export type CreateUserTxRepos = {
  users: UsersRepository;
  memberships: MembershipsRepository;
  businessUsers: BusinessUsersRepository;
};

export type CreateUserDeps = {
  /** Required for production path (withTransaction). */
  pool?: ConnectionPool;
  businesses: BusinessesRepository;
  /** Pool-backed (or mock) for post-commit UserListOut enrichment. */
  businessUsers: BusinessUsersRepository;
  /** Test seam — skip real SQL transaction. */
  runInTransaction?: <T>(
    fn: (repos: CreateUserTxRepos) => Promise<T>,
  ) => Promise<T>;
};

function memberRowFromCreate(opts: {
  id: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  notes: string | null;
  created_at: Date;
}): BusinessUserMemberRow {
  return {
    id: opts.id,
    name: opts.name,
    phone: opts.phone,
    email: opts.email,
    username: opts.username,
    role: opts.role,
    is_active: opts.is_active,
    is_blocked: false,
    last_login_at: null,
    last_active_at: null,
    notes: opts.notes,
    created_at: opts.created_at,
  };
}

/**
 * Port of create_user. Throws HttpError for 400/403/409.
 */
export async function createUserForBusiness(
  deps: CreateUserDeps,
  opts: {
    businessId: string;
    body: UserCreateIn;
    actorMembershipRole: string;
    actor: CreateUserActor;
  },
): Promise<UserCreateOut> {
  const { businessId, body, actor, actorMembershipRole } = opts;

  if (actorMembershipRole === "admin" && (body.role as string) === "owner") {
    throw new HttpError(403, "Cannot create owner accounts");
  }

  const digits = phoneDigits(body.phone);
  if (digits.length < 6) {
    throw new HttpError(400, "Invalid phone");
  }

  const email = body.email;

  const run =
    deps.runInTransaction ??
    (async <T>(fn: (repos: CreateUserTxRepos) => Promise<T>): Promise<T> => {
      if (!deps.pool) {
        throw new Error("Database pool not connected. Call connect() first.");
      }
      return withTransaction(deps.pool, async (tx) => {
        const users = createUsersRepository(tx);
        const memberships = createMembershipsRepository(tx);
        const businessUsers = createBusinessUsersRepository(tx);
        return fn({ users, memberships, businessUsers });
      });
    });

  const created = await run(async ({ users, memberships, businessUsers }) => {
    let username: string;
    try {
      username = await allocateUsername(users, {
        requested: null,
        phoneDigits: digits,
        fullName: body.full_name,
      });
    } catch {
      throw new HttpError(409, "Username already taken");
    }

    if (await users.emailExistsActive(email)) {
      throw new HttpError(409, "Email already registered");
    }

    const plain =
      body.password && body.password.trim()
        ? body.password.trim()
        : generateReadablePassword(body.full_name);

    const now = new Date();
    const userId = randomUUID();
    const memId = randomUUID();
    const name = body.full_name.trim();
    const phone = body.phone.trim();
    const notes =
      body.notes && body.notes.trim() ? body.notes.trim() : null;

    const password_hash = hashPassword(plain);

    await users.insert({
      id: userId,
      email,
      username,
      password_hash,
      phone,
      name,
      is_active: body.is_active,
      is_blocked: false,
      notes,
      created_by: actor.id,
      created_at: now,
    });

    const perms = effectivePermissions(body.role, null);
    await memberships.insert({
      id: memId,
      user_id: userId,
      business_id: businessId,
      role: body.role,
      permissions_json: JSON.stringify(perms),
      created_at: now,
    });

    const display = actor.name || actor.username;
    const details = {
      target_user_id: userId,
      target_name: name || email,
      after: { role: body.role, email },
    };
    await businessUsers.insertActivityLog({
      id: randomUUID(),
      business_id: businessId,
      user_id: actor.id,
      user_name: display,
      action_type: "USER_CREATE",
      details: JSON.stringify(details),
      created_at: now,
    });

    return {
      userId,
      username,
      name,
      phone,
      email,
      role: body.role,
      is_active: body.is_active,
      notes,
      created_at: now,
      plain,
    };
  });

  const biz = await deps.businesses.findById(businessId);
  const warehouseName = biz?.name ?? null;
  const userOut = await buildUserListOut(
    deps.businessUsers,
    businessId,
    memberRowFromCreate({
      id: created.userId,
      name: created.name,
      phone: created.phone,
      email: created.email,
      username: created.username,
      role: created.role,
      is_active: created.is_active,
      notes: created.notes,
      created_at: created.created_at,
    }),
    warehouseName,
  );

  // FastAPI: generated_password=plain if not body.password else None
  const generated_password = !body.password ? created.plain : null;

  return {
    user: userOut,
    generated_password,
    login_email: email,
  };
}

/** Map req.user to create actor. */
export function actorFromUser(user: UserRow): CreateUserActor {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
  };
}
